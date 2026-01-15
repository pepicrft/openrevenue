import { Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { parseApiKey, parseBasicAuth } from "./lib/auth";
import * as schema from "./db/schema";

interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  ASSETS: Fetcher;
  BASIC_AUTH_PASSWORD: string;
  APPLE_SHARED_SECRET: string;
  GOOGLE_SERVICE_ACCOUNT_JSON: string;
  GOOGLE_PLAY_PACKAGE_NAME: string;
}

type Variables = {
  app: {
    id: string;
    name: string;
  };
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

const getDb = (db: D1Database) => drizzle(db, { schema });
type Database = ReturnType<typeof getDb>;

app.use("*", async (c, next) => {
  if (!hasStoreCredentials(c.env)) {
    return c.json(
      {
        error: "store_credentials_missing",
        message:
          "Set APPLE_SHARED_SECRET or GOOGLE_SERVICE_ACCOUNT_JSON before starting the worker.",
      },
      500
    );
  }

  await next();
});

app.get("/v1/health", (c) => {
  return c.json({ status: "ok" });
});

app.use("/admin/*", async (c, next) => {
  const password = c.env.BASIC_AUTH_PASSWORD?.trim();
  if (!password) {
    await next();
    return;
  }

  const result = parseBasicAuth(
    c.req.header("Authorization"),
    password,
    (value) => atob(value)
  );

  if (!result.ok) {
    return unauthorizedResponse();
  }

  await next();
});

app.use("/v1/*", async (c, next) => {
  if (c.req.path.endsWith("/health_report_availability")) {
    await next();
    return;
  }

  const apiKey = parseApiKey({
    Authorization: c.req.header("Authorization"),
    "X-API-Key": c.req.header("X-API-Key"),
  });

  if (!apiKey) {
    return c.json({ error: "missing_api_key" }, 401);
  }

  const db = getDb(c.env.DB);
  const appRow =
    (await db
      .select({ id: schema.apps.id, name: schema.apps.name })
      .from(schema.appKeys)
      .innerJoin(schema.apps, eq(schema.appKeys.appId, schema.apps.id))
      .where(and(eq(schema.appKeys.key, apiKey), isNull(schema.appKeys.revokedAt)))
      .get()) ??
    (await db
      .select({ id: schema.apps.id, name: schema.apps.name })
      .from(schema.apps)
      .where(eq(schema.apps.apiKey, apiKey))
      .get());

  if (!appRow) {
    return c.json({ error: "invalid_api_key" }, 403);
  }

  c.set("app", appRow);
  await next();
});

app.use("/rcbilling/*", async (c, next) => {
  const apiKey = parseApiKey({
    Authorization: c.req.header("Authorization"),
    "X-API-Key": c.req.header("X-API-Key"),
  });

  if (!apiKey) {
    return c.json({ error: "missing_api_key" }, 401);
  }

  const db = getDb(c.env.DB);
  const appRow = await db
    .select({ id: schema.apps.id, name: schema.apps.name })
    .from(schema.appKeys)
    .innerJoin(schema.apps, eq(schema.appKeys.appId, schema.apps.id))
    .where(and(eq(schema.appKeys.key, apiKey), isNull(schema.appKeys.revokedAt)))
    .get();

  if (!appRow) {
    return c.json({ error: "invalid_api_key" }, 403);
  }

  c.set("app", appRow);
  await next();
});

const receiptSchema = z.object({
  app_user_id: z.string().min(1),
  product_id: z.string().min(1),
  store: z.enum(["app_store", "play_store"]).optional().default("app_store"),
  transaction_id: z.string().optional(),
  purchase_date_ms: z.number().optional(),
  receipt_data: z.string().optional(),
  purchase_token: z.string().optional(),
  package_name: z.string().optional(),
  price_cents: z.number().int().optional(),
  currency: z.string().optional(),
});

const attributesSchema = z.object({
  attributes: z.record(z.string()).optional(),
});

const introEligibilitySchema = z.object({
  product_identifiers: z.array(z.string().min(1)),
  fetch_token: z.string().min(1),
});

const identifySchema = z.object({
  app_user_id: z.string().min(1),
  new_app_user_id: z.string().min(1),
});

const offerSigningSchema = z.object({
  app_user_id: z.string().min(1),
  fetch_token: z.string().optional(),
  generate_offers: z.array(
    z.object({
      offer_id: z.string().min(1),
      product_id: z.string().min(1),
      subscription_group: z.string().min(1),
    })
  ),
});

const redeemPurchaseSchema = z.object({
  app_user_id: z.string().min(1),
  redemption_token: z.string().min(1),
});

const productSchema = z.object({
  identifier: z.string().min(1),
  display_name: z.string().min(1).optional(),
  price_cents: z.number().int().optional(),
  currency: z.string().min(1).optional(),
  billing_period: z.string().min(1).optional(),
  type: z.enum(["subscription", "one_time"]).optional().default("subscription"),
});

const offeringSchema = z.object({
  identifier: z.string().min(1),
  description: z.string().optional(),
  products: z.array(z.string().min(1)).optional().default([]),
});

const webhookSchema = z.object({
  type: z.string().min(1),
  app_user_id: z.string().min(1),
  product_id: z.string().min(1).optional(),
  entitlement_id: z.string().min(1).optional(),
  expires_date_ms: z.number().optional(),
  price_cents: z.number().int().optional(),
  currency: z.string().optional(),
  store: z.enum(["app_store", "play_store"]).optional().default("app_store"),
});

app.post("/v1/receipts", async (c) => {
  const body = receiptSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "invalid_payload", details: body.error.flatten() }, 400);
  }

  const appRecord = c.get("app");
  const now = new Date();
  const input = body.data;
  const db = getDb(c.env.DB);

  const validation =
    input.store === "play_store"
      ? await validateGoogleReceipt(c.env, input)
      : await validateAppleReceipt(c.env, input);

  if (!validation.ok) {
    await recordReceipt(db, {
      appId: appRecord.id,
      appUserId: input.app_user_id,
      productId: input.product_id,
      store: input.store,
      transactionId: input.transaction_id ?? null,
      purchaseDate: input.purchase_date_ms
        ? new Date(input.purchase_date_ms).toISOString()
        : null,
      rawJson: validation.rawJson,
      status: validation.error,
    });
    return c.json({ error: "receipt_validation_failed", details: validation.error }, 400);
  }

  const purchaseDate = new Date(validation.purchaseDateMs ?? now.getTime());
  const expiresDate = validation.expiresDateMs
    ? new Date(validation.expiresDateMs)
    : defaultExpiry(purchaseDate);

  await recordReceipt(db, {
    appId: appRecord.id,
    appUserId: input.app_user_id,
    productId: validation.productId,
    store: input.store,
    transactionId: validation.transactionId,
    purchaseDate: purchaseDate.toISOString(),
    rawJson: validation.rawJson,
    status: "validated",
  });

  const user = await upsertUser(db, appRecord.id, input.app_user_id);

  await deactivateSubscription(db, appRecord.id, user.appUserId, validation.productId);

  await db.insert(schema.subscriptions).values({
    id: crypto.randomUUID(),
    appId: appRecord.id,
    appUserId: user.appUserId,
    productId: validation.productId,
    transactionId: validation.transactionId,
    purchaseDate: purchaseDate.toISOString(),
    expiresDate: expiresDate.toISOString(),
    store: input.store,
    environment: validation.environment,
    isActive: 1,
  });

  await deactivateEntitlement(db, appRecord.id, user.appUserId, validation.entitlementId);

  await db.insert(schema.entitlements).values({
    id: crypto.randomUUID(),
    appId: appRecord.id,
    appUserId: user.appUserId,
    identifier: validation.entitlementId,
    productId: validation.productId,
    expiresDate: expiresDate.toISOString(),
    isActive: 1,
  });

  await recordEvent(db, {
    appId: appRecord.id,
    type: "receipt_validated",
    appUserId: user.appUserId,
    productId: validation.productId,
    amountCents: validation.amountCents,
    payload: {
      store: input.store,
      transaction_id: validation.transactionId,
    },
  });

  const customerInfo = await buildCustomerInfo(db, appRecord.id, user.appUserId);
  await cacheCustomerInfo(c.env.CACHE, appRecord.id, user.appUserId, customerInfo);

  return c.json({
    request_date: now.toISOString(),
    request_date_ms: now.getTime(),
    subscriber: customerInfo,
  });
});

app.get("/v1/subscribers/:app_user_id", async (c) => {
  const appRecord = c.get("app");
  const appUserId = c.req.param("app_user_id");
  const db = getDb(c.env.DB);

  const cached = await readCachedCustomerInfo(c.env.CACHE, appRecord.id, appUserId);
  if (cached) {
    return c.json({
      request_date: new Date().toISOString(),
      request_date_ms: Date.now(),
      subscriber: cached,
    });
  }

  const user = await upsertUser(db, appRecord.id, appUserId);
  const customerInfo = await buildCustomerInfo(db, appRecord.id, user.appUserId);
  await cacheCustomerInfo(c.env.CACHE, appRecord.id, user.appUserId, customerInfo);

  const now = new Date();
  return c.json({
    request_date: now.toISOString(),
    request_date_ms: now.getTime(),
    subscriber: customerInfo,
  });
});

app.post("/v1/subscribers/:app_user_id/attributes", async (c) => {
  const appRecord = c.get("app");
  const appUserId = c.req.param("app_user_id");
  const body = attributesSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "invalid_payload", details: body.error.flatten() }, 400);
  }

  const db = getDb(c.env.DB);
  const user = await upsertUser(db, appRecord.id, appUserId);
  const attributesJson = body.data.attributes
    ? JSON.stringify(body.data.attributes)
    : null;

  await db
    .update(schema.users)
    .set({ attributesJson, lastSeen: new Date().toISOString() })
    .where(eq(schema.users.id, user.id));

  return c.body(null, 204);
});

app.get("/v1/subscribers/:app_user_id/offerings", async (c) => {
  const appRecord = c.get("app");
  const appUserId = c.req.param("app_user_id");

  const db = getDb(c.env.DB);
  await upsertUser(db, appRecord.id, appUserId);
  const offeringsResponse = await buildOfferingsResponse(db, appRecord.id);

  return c.json(offeringsResponse);
});

app.post("/v1/subscribers/:app_user_id/intro_eligibility", async (c) => {
  const appRecord = c.get("app");
  const appUserId = c.req.param("app_user_id");
  const body = introEligibilitySchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "invalid_payload", details: body.error.flatten() }, 400);
  }

  const db = getDb(c.env.DB);
  await upsertUser(db, appRecord.id, appUserId);
  const eligibilities = Object.fromEntries(
    body.data.product_identifiers.map((id) => [id, null])
  );

  return c.json(eligibilities);
});

app.get("/v1/subscribers/:app_user_id/health_report", async (c) => {
  const appRecord = c.get("app");
  const appUserId = c.req.param("app_user_id");
  const db = getDb(c.env.DB);
  await upsertUser(db, appRecord.id, appUserId);

  return c.json({
    status: "passed",
    project_id: null,
    app_id: appRecord.id,
    checks: [],
  });
});

app.get("/v1/subscribers/:app_user_id/health_report_availability", async (c) => {
  const appUserId = c.req.param("app_user_id");
  const appRecord = c.get("app");
  if (appRecord) {
    const db = getDb(c.env.DB);
    await upsertUser(db, appRecord.id, appUserId);
  }

  return c.json({
    report_logs: true,
  });
});

app.post("/v1/subscribers/identify", async (c) => {
  const appRecord = c.get("app");
  const body = identifySchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "invalid_payload", details: body.error.flatten() }, 400);
  }

  const db = getDb(c.env.DB);
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(
      and(
        eq(schema.users.appId, appRecord.id),
        eq(schema.users.appUserId, body.data.new_app_user_id)
      )
    )
    .get();

  await upsertUser(db, appRecord.id, body.data.new_app_user_id);

  if (body.data.app_user_id !== body.data.new_app_user_id) {
    await db
      .update(schema.subscriptions)
      .set({ appUserId: body.data.new_app_user_id })
      .where(
        and(
          eq(schema.subscriptions.appId, appRecord.id),
          eq(schema.subscriptions.appUserId, body.data.app_user_id)
        )
      );
    await db
      .update(schema.entitlements)
      .set({ appUserId: body.data.new_app_user_id })
      .where(
        and(
          eq(schema.entitlements.appId, appRecord.id),
          eq(schema.entitlements.appUserId, body.data.app_user_id)
        )
      );
  }

  const customerInfo = await buildCustomerInfo(
    db,
    appRecord.id,
    body.data.new_app_user_id
  );
  await cacheCustomerInfo(
    c.env.CACHE,
    appRecord.id,
    body.data.new_app_user_id,
    customerInfo
  );

  return c.json(
    {
      request_date: new Date().toISOString(),
      request_date_ms: Date.now(),
      subscriber: customerInfo,
    },
    existing ? 200 : 201
  );
});

app.post("/v1/subscribers/:app_user_id/attribution", async (c) => {
  const appRecord = c.get("app");
  const appUserId = c.req.param("app_user_id");
  const payload = await c.req.json().catch(() => null);

  const db = getDb(c.env.DB);
  await upsertUser(db, appRecord.id, appUserId);
  await recordEvent(db, {
    appId: appRecord.id,
    type: "attribution",
    appUserId,
    payload,
  });

  return c.body(null, 204);
});

app.post("/v1/subscribers/:app_user_id/adservices_attribution", async (c) => {
  const appRecord = c.get("app");
  const appUserId = c.req.param("app_user_id");
  const payload = await c.req.json().catch(() => null);

  const db = getDb(c.env.DB);
  await upsertUser(db, appRecord.id, appUserId);
  await recordEvent(db, {
    appId: appRecord.id,
    type: "adservices_attribution",
    appUserId,
    payload,
  });

  return c.body(null, 204);
});

app.post("/v1/offers", async (c) => {
  const body = offerSigningSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "invalid_payload", details: body.error.flatten() }, 400);
  }

  const offers = body.data.generate_offers.map((offer) => ({
    key_id: "openrevenue",
    offer_id: offer.offer_id,
    product_id: offer.product_id,
    signature_data: null,
    signature_error: {
      code: 7001,
      message: "offer_signing_not_configured",
    },
  }));

  return c.json({ offers });
});

app.post("/v1/subscribers/redeem_purchase", async (c) => {
  const appRecord = c.get("app");
  const body = redeemPurchaseSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "invalid_payload", details: body.error.flatten() }, 400);
  }

  const db = getDb(c.env.DB);
  await upsertUser(db, appRecord.id, body.data.app_user_id);
  const customerInfo = await buildCustomerInfo(
    db,
    appRecord.id,
    body.data.app_user_id
  );
  await cacheCustomerInfo(
    c.env.CACHE,
    appRecord.id,
    body.data.app_user_id,
    customerInfo
  );

  return c.json({
    request_date: new Date().toISOString(),
    request_date_ms: Date.now(),
    subscriber: customerInfo,
  });
});

app.get("/v1/subscribers/:app_user_id/virtual_currencies", async (c) => {
  const appRecord = c.get("app");
  const appUserId = c.req.param("app_user_id");
  const db = getDb(c.env.DB);
  await upsertUser(db, appRecord.id, appUserId);

  return c.json({
    virtual_currencies: {},
  });
});

app.get("/v1/product_entitlement_mapping", async (c) => {
  const appRecord = c.get("app");
  const db = getDb(c.env.DB);
  const rows = await db
    .select({
      productId: schema.entitlements.productId,
      identifier: schema.entitlements.identifier,
    })
    .from(schema.entitlements)
    .where(eq(schema.entitlements.appId, appRecord.id));

  const mapping: Record<
    string,
    { product_identifier: string; entitlements: string[] }
  > = {};

  for (const row of rows) {
    if (!mapping[row.productId]) {
      mapping[row.productId] = {
        product_identifier: row.productId,
        entitlements: [],
      };
    }
    mapping[row.productId].entitlements.push(row.identifier);
  }

  return c.json({
    product_entitlement_mapping: mapping,
  });
});

app.get("/v1/customercenter/:app_user_id", async (c) => {
  const appRecord = c.get("app");
  const appUserId = c.req.param("app_user_id");
  const db = getDb(c.env.DB);
  await upsertUser(db, appRecord.id, appUserId);

  return c.json({
    customer_center: {
      appearance: {
        light: {},
        dark: {},
      },
      screens: {},
      localization: {
        locale: "en-US",
        localized_strings: {},
      },
      support: {
        email: "support@example.com",
        should_warn_customer_to_update: false,
        display_purchase_history_link: false,
        display_user_details_section: false,
        display_virtual_currencies: false,
        should_warn_customers_about_multiple_subscriptions: false,
      },
      change_plans: [],
    },
    last_published_app_version: null,
    itunes_track_id: null,
  });
});

app.post("/v1/customercenter/support/create-ticket", async (c) => {
  await c.req.json().catch(() => null);
  return c.json({ status: "received" });
});

app.get("/v1/products", async (c) => {
  const appRecord = c.get("app");
  const db = getDb(c.env.DB);
  const products = await db
    .select({
      identifier: schema.products.identifier,
      display_name: schema.products.displayName,
      price_cents: schema.products.priceCents,
      currency: schema.products.currency,
      billing_period: schema.products.billingPeriod,
      type: schema.products.type,
    })
    .from(schema.products)
    .where(eq(schema.products.appId, appRecord.id))
    .orderBy(desc(schema.products.createdAt));

  return c.json({ products });
});

app.post("/v1/products", async (c) => {
  const appRecord = c.get("app");
  const body = productSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "invalid_payload", details: body.error.flatten() }, 400);
  }

  const db = getDb(c.env.DB);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(schema.products).values({
    id,
    appId: appRecord.id,
    identifier: body.data.identifier,
    displayName: body.data.display_name ?? null,
    priceCents: body.data.price_cents ?? null,
    currency: body.data.currency ?? null,
    billingPeriod: body.data.billing_period ?? null,
    type: body.data.type,
    createdAt: now,
  });

  return c.json({
    id,
    ...body.data,
    created_at: now,
  });
});

app.get("/v1/offerings", async (c) => {
  const appRecord = c.get("app");
  const format = c.req.query("format");

  if (format === "management") {
    const db = getDb(c.env.DB);
    const offerings = await db
      .select({
        id: schema.offerings.id,
        identifier: schema.offerings.identifier,
        description: schema.offerings.description,
        product_identifier: schema.products.identifier,
        display_name: schema.products.displayName,
        price_cents: schema.products.priceCents,
        currency: schema.products.currency,
      })
      .from(schema.offerings)
      .leftJoin(
        schema.offeringProducts,
        eq(schema.offerings.id, schema.offeringProducts.offeringId)
      )
      .leftJoin(schema.products, eq(schema.offeringProducts.productId, schema.products.id))
      .where(eq(schema.offerings.appId, appRecord.id))
      .orderBy(desc(schema.offerings.createdAt), schema.offeringProducts.position);

    const grouped = new Map<
      string,
      {
        id: string;
        identifier: string;
        description: string | null;
        products: {
          identifier: string;
          display_name: string | null;
          price_cents: number | null;
          currency: string | null;
        }[];
      }
    >();

    for (const row of offerings) {
      if (!grouped.has(row.id)) {
        grouped.set(row.id, {
          id: row.id,
          identifier: row.identifier,
          description: row.description,
          products: [],
        });
      }
      if (row.product_identifier) {
        grouped.get(row.id)?.products.push({
          identifier: row.product_identifier,
          display_name: row.display_name,
          price_cents: row.price_cents,
          currency: row.currency,
        });
      }
    }

    return c.json({ offerings: Array.from(grouped.values()) });
  }

  const db = getDb(c.env.DB);
  const offeringsResponse = await buildOfferingsResponse(db, appRecord.id);
  return c.json(offeringsResponse);
});

app.post("/v1/offerings", async (c) => {
  const appRecord = c.get("app");
  const body = offeringSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "invalid_payload", details: body.error.flatten() }, 400);
  }

  const db = getDb(c.env.DB);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.insert(schema.offerings).values({
    id,
    appId: appRecord.id,
    identifier: body.data.identifier,
    description: body.data.description ?? null,
    createdAt: now,
  });

  if (body.data.products.length > 0) {
    const productRows = await db
      .select({ id: schema.products.id, identifier: schema.products.identifier })
      .from(schema.products)
      .where(
        and(
          eq(schema.products.appId, appRecord.id),
          inArray(schema.products.identifier, body.data.products)
        )
      );

    const productLookup = new Map(productRows.map((row) => [row.identifier, row.id]));

    for (const [index, identifier] of body.data.products.entries()) {
      const productId = productLookup.get(identifier);
      if (!productId) {
        continue;
      }
      await db.insert(schema.offeringProducts).values({
        offeringId: id,
        productId,
        position: index,
      });
    }
  }

  return c.json({
    id,
    ...body.data,
    created_at: now,
  });
});

app.post("/v1/webhooks", async (c) => {
  const appRecord = c.get("app");
  const body = webhookSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "invalid_payload", details: body.error.flatten() }, 400);
  }

  const db = getDb(c.env.DB);
  await db.insert(schema.webhookEvents).values({
    id: crypto.randomUUID(),
    appId: appRecord.id,
    type: body.data.type,
    receivedAt: new Date().toISOString(),
    payloadJson: JSON.stringify(body.data),
  });

  if (
    body.data.type === "RENEWAL" ||
    body.data.type === "INITIAL_PURCHASE" ||
    body.data.type === "NON_RENEWING_PURCHASE"
  ) {
    if (!body.data.product_id) {
      return c.json({ error: "missing_product_id" }, 400);
    }
    const purchaseDate = new Date();
    const expiresDate = body.data.expires_date_ms
      ? new Date(body.data.expires_date_ms)
      : defaultExpiry(purchaseDate);

    await deactivateSubscription(
      db,
      appRecord.id,
      body.data.app_user_id,
      body.data.product_id
    );
    await db.insert(schema.subscriptions).values({
      id: crypto.randomUUID(),
      appId: appRecord.id,
      appUserId: body.data.app_user_id,
      productId: body.data.product_id,
      transactionId: null,
      purchaseDate: purchaseDate.toISOString(),
      expiresDate: expiresDate.toISOString(),
      store: body.data.store,
      environment: "production",
      isActive: 1,
    });

    const entitlementId = body.data.entitlement_id ?? body.data.product_id;
    await deactivateEntitlement(db, appRecord.id, body.data.app_user_id, entitlementId);
    await db.insert(schema.entitlements).values({
      id: crypto.randomUUID(),
      appId: appRecord.id,
      appUserId: body.data.app_user_id,
      identifier: entitlementId,
      productId: body.data.product_id,
      expiresDate: expiresDate.toISOString(),
      isActive: 1,
    });
  }

  if (body.data.type === "CANCELLATION" || body.data.type === "EXPIRATION") {
    await db
      .update(schema.subscriptions)
      .set({ isActive: 0 })
      .where(
        and(
          eq(schema.subscriptions.appId, appRecord.id),
          eq(schema.subscriptions.appUserId, body.data.app_user_id)
        )
      );
    await db
      .update(schema.entitlements)
      .set({ isActive: 0 })
      .where(
        and(
          eq(schema.entitlements.appId, appRecord.id),
          eq(schema.entitlements.appUserId, body.data.app_user_id)
        )
      );
  }

  await recordEvent(db, {
    appId: appRecord.id,
    type: `webhook_${body.data.type.toLowerCase()}`,
    appUserId: body.data.app_user_id,
    productId: body.data.product_id,
    amountCents: body.data.price_cents,
    payload: body.data,
  });

  return c.json({ status: "ok" });
});

app.post("/v1/events", async (c) => {
  const appRecord = c.get("app");
  const payload = await c.req.json().catch(() => null);
  const events = Array.isArray(payload?.events) ? payload.events : [];
  const db = getDb(c.env.DB);

  for (const event of events) {
    const type = typeof event?.type === "string" ? event.type : "sdk_event";
    const eventType = type.startsWith("rc_ads_") ? "ad_event" : "feature_event";
    await recordEvent(db, {
      appId: appRecord.id,
      type: eventType,
      appUserId: event?.app_user_id ?? event?.appUserId ?? null,
      payload: event,
    });
  }

  return c.json({ status: "ok" });
});

app.post("/v1/diagnostics", async (c) => {
  const appRecord = c.get("app");
  const payload = await c.req.json().catch(() => null);
  const entries = Array.isArray(payload?.entries) ? payload.entries : [];
  const db = getDb(c.env.DB);

  for (const entry of entries) {
    await recordEvent(db, {
      appId: appRecord.id,
      type: "diagnostics_event",
      appUserId: entry?.app_user_id ?? entry?.appUserId ?? null,
      payload: entry,
    });
  }

  return c.json({ status: "ok" });
});

app.get("/rcbilling/v1/subscribers/:app_user_id/offering_products", async (c) => {
  const appRecord = c.get("app");
  const appUserId = c.req.param("app_user_id");
  const checkoutBase = new URL(c.req.url).origin;

  const db = getDb(c.env.DB);
  await upsertUser(db, appRecord.id, appUserId);

  const offerings = await db
    .select({
      id: schema.offerings.id,
      identifier: schema.offerings.identifier,
      description: schema.offerings.description,
      product_identifier: schema.products.identifier,
      display_name: schema.products.displayName,
      price_cents: schema.products.priceCents,
      currency: schema.products.currency,
      type: schema.products.type,
    })
    .from(schema.offerings)
    .leftJoin(
      schema.offeringProducts,
      eq(schema.offerings.id, schema.offeringProducts.offeringId)
    )
    .leftJoin(schema.products, eq(schema.offeringProducts.productId, schema.products.id))
    .where(eq(schema.offerings.appId, appRecord.id))
    .orderBy(desc(schema.offerings.createdAt), schema.offeringProducts.position);

  const offeringsMap: Record<
    string,
    {
      identifier: string;
      description: string | null;
      packages: Record<
        string,
        {
          identifier: string;
          web_checkout_url: string;
          product_details: {
            identifier: string;
            product_type: string;
            title: string;
            description: string | null;
            default_purchase_option_id: string | null;
            purchase_options: Record<
              string,
              {
                base_price: {
                  amount_micros: number;
                  currency: string;
                } | null;
                base: {
                  period_duration: string | null;
                  price: {
                    amount_micros: number;
                    currency: string;
                  } | null;
                  cycle_count: number;
                } | null;
                trial: null;
                intro_price: null;
              }
            >;
          };
        }
      >;
    }
  > = {};

  for (const row of offerings) {
    if (!offeringsMap[row.identifier]) {
      offeringsMap[row.identifier] = {
        identifier: row.identifier,
        description: row.description,
        packages: {},
      };
    }

    if (!row.product_identifier) {
      continue;
    }

    const priceMicros = row.price_cents ? row.price_cents * 10000 : 0;
    const purchaseOptionId = "base";

    offeringsMap[row.identifier].packages[row.product_identifier] = {
      identifier: row.product_identifier,
      web_checkout_url: `${checkoutBase}/web-checkout?product_id=${encodeURIComponent(
        row.product_identifier
      )}`,
      product_details: {
        identifier: row.product_identifier,
        product_type: row.type === "one_time" ? "non_consumable" : "subscription",
        title: row.display_name ?? row.product_identifier,
        description: null,
        default_purchase_option_id: purchaseOptionId,
        purchase_options: {
          [purchaseOptionId]: {
            base_price: row.type === "one_time"
              ? {
                  amount_micros: priceMicros,
                  currency: row.currency ?? "USD",
                }
              : null,
            base: row.type === "subscription"
              ? {
                  period_duration: row.type === "subscription" ? "P1M" : null,
                  price: {
                    amount_micros: priceMicros,
                    currency: row.currency ?? "USD",
                  },
                  cycle_count: 0,
                }
              : null,
            trial: null,
            intro_price: null,
          },
        },
      },
    };
  }

  await recordEvent(db, {
    appId: appRecord.id,
    type: "web_billing_request",
    appUserId: appUserId,
    payload: { endpoint: "offering_products" },
  });

  return c.json({ offerings: offeringsMap });
});

app.get("/rcbilling/v1/subscribers/:app_user_id/products", async (c) => {
  const appRecord = c.get("app");
  const appUserId = c.req.param("app_user_id");
  const productIds = c.req.queries("id") ?? [];

  const db = getDb(c.env.DB);
  await upsertUser(db, appRecord.id, appUserId);

  const products = await db
    .select({
      identifier: schema.products.identifier,
      display_name: schema.products.displayName,
      price_cents: schema.products.priceCents,
      currency: schema.products.currency,
      billing_period: schema.products.billingPeriod,
      type: schema.products.type,
    })
    .from(schema.products)
    .where(
      productIds.length
        ? and(
            eq(schema.products.appId, appRecord.id),
            inArray(schema.products.identifier, productIds)
          )
        : eq(schema.products.appId, appRecord.id)
    )
    .orderBy(desc(schema.products.createdAt));

  const productDetails = products.map((product) => {
    const purchaseOptionId = "base";
    const priceMicros = product.price_cents ? product.price_cents * 10000 : 0;
    const isSubscription = product.type === "subscription";

    return {
      identifier: product.identifier,
      product_type: isSubscription ? "subscription" : "non_consumable",
      title: product.display_name ?? product.identifier,
      description: null,
      default_purchase_option_id: purchaseOptionId,
      purchase_options: {
        [purchaseOptionId]: {
          base_price: isSubscription
            ? null
            : {
                amount_micros: priceMicros,
                currency: product.currency ?? "USD",
              },
          base: isSubscription
            ? {
                period_duration: product.billing_period ?? "P1M",
                price: {
                  amount_micros: priceMicros,
                  currency: product.currency ?? "USD",
                },
                cycle_count: 0,
              }
            : null,
          trial: null,
          intro_price: null,
        },
      },
    };
  });

  await recordEvent(db, {
    appId: appRecord.id,
    type: "web_billing_request",
    appUserId: appUserId,
    payload: { endpoint: "products", product_ids: productIds },
  });

  return c.json({ product_details: productDetails });
});

app.get("/admin/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/admin/apps", async (c) => {
  const db = getDb(c.env.DB);
  const apps = await db
    .select({
      id: schema.apps.id,
      name: schema.apps.name,
      api_key: schema.apps.apiKey,
      created_at: schema.apps.createdAt,
    })
    .from(schema.apps)
    .orderBy(desc(schema.apps.createdAt));

  const keys = await db
    .select({
      id: schema.appKeys.id,
      app_id: schema.appKeys.appId,
      key: schema.appKeys.key,
      label: schema.appKeys.label,
      created_at: schema.appKeys.createdAt,
      revoked_at: schema.appKeys.revokedAt,
    })
    .from(schema.appKeys)
    .orderBy(desc(schema.appKeys.createdAt));

  const groupedKeys = new Map<string, typeof keys>();
  for (const key of keys) {
    if (!groupedKeys.has(key.app_id)) {
      groupedKeys.set(key.app_id, []);
    }
    groupedKeys.get(key.app_id)?.push(key);
  }

  return c.json({
    apps: apps.map((row) => ({
      ...row,
      keys: groupedKeys.get(row.id) ?? [],
    })),
  });
});

app.post("/admin/apps", async (c) => {
  const body = z
    .object({ name: z.string().min(1), key_label: z.string().optional() })
    .safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "invalid_payload", details: body.error.flatten() }, 400);
  }

  const db = getDb(c.env.DB);
  const now = new Date().toISOString();
  const appId = crypto.randomUUID();
  const keyValue = generateApiKey();
  const keyId = crypto.randomUUID();

  await db.insert(schema.apps).values({
    id: appId,
    name: body.data.name,
    apiKey: keyValue,
    createdAt: now,
  });

  await db.insert(schema.appKeys).values({
    id: keyId,
    appId,
    key: keyValue,
    label: body.data.key_label ?? "default",
    createdAt: now,
  });

  return c.json({
    id: appId,
    name: body.data.name,
    created_at: now,
    api_key: keyValue,
    keys: [
      {
        id: keyId,
        key: keyValue,
        label: body.data.key_label ?? "default",
        created_at: now,
        revoked_at: null,
      },
    ],
  });
});

app.post("/admin/apps/:id/keys", async (c) => {
  const appId = c.req.param("id");
  const body = z
    .object({ label: z.string().min(1).optional() })
    .safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "invalid_payload", details: body.error.flatten() }, 400);
  }

  const db = getDb(c.env.DB);
  const now = new Date().toISOString();
  const keyId = crypto.randomUUID();
  const keyValue = generateApiKey();

  await db.insert(schema.appKeys).values({
    id: keyId,
    appId,
    key: keyValue,
    label: body.data.label ?? "rotated",
    createdAt: now,
  });

  return c.json({
    id: keyId,
    key: keyValue,
    label: body.data.label ?? "rotated",
    created_at: now,
    revoked_at: null,
  });
});

app.post("/admin/apps/:id/keys/:key_id/revoke", async (c) => {
  const appId = c.req.param("id");
  const keyId = c.req.param("key_id");
  const now = new Date().toISOString();

  const db = getDb(c.env.DB);
  await db
    .update(schema.appKeys)
    .set({ revokedAt: now })
    .where(and(eq(schema.appKeys.id, keyId), eq(schema.appKeys.appId, appId)));

  return c.json({ status: "revoked", revoked_at: now });
});

app.get("/admin/overview", async (c) => {
  const appId = c.req.query("app_id");

  const db = getDb(c.env.DB);
  let resolvedAppId = appId;
  if (!resolvedAppId) {
    const firstApp = await db
      .select({ id: schema.apps.id })
      .from(schema.apps)
      .orderBy(schema.apps.createdAt)
      .get();
    resolvedAppId = firstApp?.id;
  }

  if (!resolvedAppId) {
    return c.json({ error: "no_apps_configured" }, 404);
  }

  const activeSubscribers = await db
    .select({ count: sql<number>`count(distinct ${schema.entitlements.appUserId})` })
    .from(schema.entitlements)
    .where(
      and(
        eq(schema.entitlements.appId, resolvedAppId),
        eq(schema.entitlements.isActive, 1)
      )
    )
    .get();

  const revenueRows = await db
    .select({ total: sql<number | null>`sum(${schema.events.amountCents})` })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.appId, resolvedAppId),
        eq(schema.events.type, "receipt_validated"),
        sql`${schema.events.createdAt} >= datetime('now', '-30 day')`
      )
    )
    .get();

  const churnRows = await db
    .select({ total: sql<number>`count(*)` })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.appId, resolvedAppId),
        eq(schema.events.type, "webhook_cancellation"),
        sql`${schema.events.createdAt} >= datetime('now', '-7 day')`
      )
    )
    .get();

  const revenueDay = sql<string>`strftime('%Y-%m-%d', ${schema.events.createdAt})`;
  const dailyRevenue = await db
    .select({
      day: revenueDay,
      total: sql<number>`sum(${schema.events.amountCents})`,
    })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.appId, resolvedAppId),
        eq(schema.events.type, "receipt_validated"),
        sql`${schema.events.createdAt} >= datetime('now', '-14 day')`
      )
    )
    .groupBy(revenueDay)
    .orderBy(revenueDay);

  const activity = await db
    .select({
      type: schema.events.type,
      app_user_id: schema.events.appUserId,
      product_id: schema.events.productId,
      created_at: schema.events.createdAt,
    })
    .from(schema.events)
    .where(eq(schema.events.appId, resolvedAppId))
    .orderBy(desc(schema.events.createdAt))
    .limit(8);

  const offerings = await db
    .select({ total: sql<number>`count(*)` })
    .from(schema.offerings)
    .where(eq(schema.offerings.appId, resolvedAppId))
    .get();

  const products = await db
    .select({ total: sql<number>`count(*)` })
    .from(schema.products)
    .where(eq(schema.products.appId, resolvedAppId))
    .get();

  const featureEvents = await db
    .select({ total: sql<number>`count(*)` })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.appId, resolvedAppId),
        eq(schema.events.type, "feature_event"),
        sql`${schema.events.createdAt} >= datetime('now', '-7 day')`
      )
    )
    .get();

  const adEvents = await db
    .select({ total: sql<number>`count(*)` })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.appId, resolvedAppId),
        eq(schema.events.type, "ad_event"),
        sql`${schema.events.createdAt} >= datetime('now', '-7 day')`
      )
    )
    .get();

  const diagnosticsEvents = await db
    .select({ total: sql<number>`count(*)` })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.appId, resolvedAppId),
        eq(schema.events.type, "diagnostics_event"),
        sql`${schema.events.createdAt} >= datetime('now', '-7 day')`
      )
    )
    .get();

  const webBillingRequests = await db
    .select({ total: sql<number>`count(*)` })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.appId, resolvedAppId),
        eq(schema.events.type, "web_billing_request"),
        sql`${schema.events.createdAt} >= datetime('now', '-7 day')`
      )
    )
    .get();

  return c.json({
    app_id: resolvedAppId,
    metrics: {
      active_subscribers: activeSubscribers?.count ?? 0,
      mrr_cents: revenueRows?.total ?? 0,
      churn_events_7d: churnRows?.total ?? 0,
      offerings: offerings?.total ?? 0,
      products: products?.total ?? 0,
      feature_events_7d: featureEvents?.total ?? 0,
      ad_events_7d: adEvents?.total ?? 0,
      diagnostics_events_7d: diagnosticsEvents?.total ?? 0,
      web_billing_requests_7d: webBillingRequests?.total ?? 0,
    },
    revenue_series: dailyRevenue,
    activity,
  });
});

app.all("/v1/*", (c) => {
  return c.json(
    {
      error: "not_implemented",
      message: "Endpoint not implemented yet. See README for planned coverage.",
    },
    501
  );
});

app.get("*", async (c) => {
  const url = new URL(c.req.url);
  if (
    url.pathname.startsWith("/v1/") ||
    url.pathname.startsWith("/admin/") ||
    url.pathname.startsWith("/rcbilling/")
  ) {
    return c.json({ error: "not_found" }, 404);
  }

  const assetResponse = await c.env.ASSETS.fetch(c.req.raw);
  if (assetResponse.status !== 404 || url.pathname.includes(".")) {
    return assetResponse;
  }

  const indexUrl = new URL(c.req.url);
  indexUrl.pathname = "/index.html";
  return c.env.ASSETS.fetch(new Request(indexUrl.toString(), c.req.raw));
});

function unauthorizedResponse() {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": "Basic realm=\"OpenRevenue Admin\"",
    },
  });
}

function hasStoreCredentials(env: Env) {
  const apple = env.APPLE_SHARED_SECRET?.trim();
  const google = env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  return Boolean(apple || google);
}

function generateApiKey() {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `rc_test_${suffix}`;
}

function defaultExpiry(purchaseDate: Date) {
  const expiresDate = new Date(purchaseDate);
  expiresDate.setDate(expiresDate.getDate() + 30);
  return expiresDate;
}

async function upsertUser(db: Database, appId: string, appUserId: string) {
  const existing = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.appId, appId), eq(schema.users.appUserId, appUserId)))
    .get();

  const now = new Date().toISOString();

  if (existing) {
    await db
      .update(schema.users)
      .set({ lastSeen: now })
      .where(eq(schema.users.id, existing.id));
    return existing;
  }

  const newUser = {
    id: crypto.randomUUID(),
    appId,
    appUserId,
    firstSeen: now,
    lastSeen: now,
  };

  await db.insert(schema.users).values(newUser);

  return newUser;
}

async function deactivateSubscription(
  db: Database,
  appId: string,
  appUserId: string,
  productId: string
) {
  if (!productId) {
    return;
  }
  await db
    .update(schema.subscriptions)
    .set({ isActive: 0 })
    .where(
      and(
        eq(schema.subscriptions.appId, appId),
        eq(schema.subscriptions.appUserId, appUserId),
        eq(schema.subscriptions.productId, productId)
      )
    );
}

async function deactivateEntitlement(
  db: Database,
  appId: string,
  appUserId: string,
  entitlementId: string
) {
  if (!entitlementId) {
    return;
  }
  await db
    .update(schema.entitlements)
    .set({ isActive: 0 })
    .where(
      and(
        eq(schema.entitlements.appId, appId),
        eq(schema.entitlements.appUserId, appUserId),
        eq(schema.entitlements.identifier, entitlementId)
      )
    );
}

async function buildCustomerInfo(db: Database, appId: string, appUserId: string) {
  const user = await db
    .select({
      firstSeen: schema.users.firstSeen,
      lastSeen: schema.users.lastSeen,
    })
    .from(schema.users)
    .where(and(eq(schema.users.appId, appId), eq(schema.users.appUserId, appUserId)))
    .get();

  const subscriptions = await db
    .select({
      productId: schema.subscriptions.productId,
      purchaseDate: schema.subscriptions.purchaseDate,
      expiresDate: schema.subscriptions.expiresDate,
      store: schema.subscriptions.store,
      environment: schema.subscriptions.environment,
      isActive: schema.subscriptions.isActive,
    })
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.appId, appId),
        eq(schema.subscriptions.appUserId, appUserId)
      )
    );

  const entitlements = await db
    .select({
      identifier: schema.entitlements.identifier,
      productId: schema.entitlements.productId,
      expiresDate: schema.entitlements.expiresDate,
      isActive: schema.entitlements.isActive,
    })
    .from(schema.entitlements)
    .where(
      and(
        eq(schema.entitlements.appId, appId),
        eq(schema.entitlements.appUserId, appUserId)
      )
    );

  const subscriptionMap: Record<string, unknown> = {};
  for (const row of subscriptions) {
    subscriptionMap[row.productId] = {
      purchase_date: row.purchaseDate,
      expires_date: row.expiresDate,
      ownership_type: "PURCHASED",
      store: row.store ?? "app_store",
      is_sandbox: false,
      period_type: "normal",
      unsubscribe_detected_at: null,
      billing_issues_detected_at: null,
      environment: row.environment ?? "production",
      is_active: row.isActive === 1,
    };
  }

  const entitlementMap: Record<string, unknown> = {};
  for (const row of entitlements) {
    entitlementMap[row.identifier] = {
      product_identifier: row.productId,
      expires_date: row.expiresDate,
      grace_period_expires_date: null,
      purchase_date: null,
      ownership_type: "PURCHASED",
      is_active: row.isActive === 1,
    };
  }

  return {
    original_app_user_id: appUserId,
    first_seen: user?.firstSeen ?? new Date().toISOString(),
    last_seen: user?.lastSeen ?? new Date().toISOString(),
    entitlements: entitlementMap,
    subscriptions: subscriptionMap,
    non_subscriptions: {},
    management_url: null,
  };
}

async function buildOfferingsResponse(db: Database, appId: string) {
  const offerings = await db
    .select({
      id: schema.offerings.id,
      identifier: schema.offerings.identifier,
      description: schema.offerings.description,
      productIdentifier: schema.products.identifier,
    })
    .from(schema.offerings)
    .leftJoin(
      schema.offeringProducts,
      eq(schema.offerings.id, schema.offeringProducts.offeringId)
    )
    .leftJoin(schema.products, eq(schema.offeringProducts.productId, schema.products.id))
    .where(eq(schema.offerings.appId, appId))
    .orderBy(desc(schema.offerings.createdAt), schema.offeringProducts.position);

  const grouped = new Map<
    string,
    {
      identifier: string;
      description: string;
      packages: Array<{
        identifier: string;
        platform_product_identifier: string;
        web_checkout_url: null;
      }>;
    }
  >();

  for (const row of offerings) {
    if (!grouped.has(row.id)) {
      grouped.set(row.id, {
        identifier: row.identifier,
        description: row.description ?? "",
        packages: [],
      });
    }
    if (row.productIdentifier) {
      grouped.get(row.id)?.packages.push({
        identifier: row.productIdentifier,
        platform_product_identifier: row.productIdentifier,
        web_checkout_url: null,
      });
    }
  }

  const offeringList = Array.from(grouped.values()).map((offering) => ({
    identifier: offering.identifier,
    description: offering.description,
    packages: offering.packages,
    paywall: null,
    metadata: {},
    paywall_components: null,
    draft_paywall_components: null,
    web_checkout_url: null,
  }));

  return {
    current_offering_id: offeringList[0]?.identifier ?? null,
    offerings: offeringList,
    placements: null,
    targeting: null,
    ui_config: null,
  };
}

async function cacheCustomerInfo(
  cache: KVNamespace,
  appId: string,
  appUserId: string,
  customerInfo: unknown
) {
  await cache.put(buildCacheKey(appId, appUserId), JSON.stringify(customerInfo), {
    expirationTtl: 300,
  });
}

async function readCachedCustomerInfo(
  cache: KVNamespace,
  appId: string,
  appUserId: string
) {
  const cached = await cache.get(buildCacheKey(appId, appUserId));
  if (!cached) {
    return null;
  }
  try {
    return JSON.parse(cached) as unknown;
  } catch (error) {
    return null;
  }
}

function buildCacheKey(appId: string, appUserId: string) {
  return `customer:${appId}:${appUserId}`;
}

type ReceiptValidationResult =
  | {
      ok: true;
      productId: string;
      entitlementId: string;
      transactionId: string | null;
      purchaseDateMs: number | null;
      expiresDateMs: number | null;
      environment: string;
      amountCents: number | null;
      rawJson: string | null;
    }
  | {
      ok: false;
      error: string;
      rawJson: string | null;
    };

async function validateAppleReceipt(env: Env, input: z.infer<typeof receiptSchema>): Promise<ReceiptValidationResult> {
  const receiptData = input.receipt_data?.trim();
  if (!receiptData) {
    return { ok: false, error: "missing_receipt_data", rawJson: null };
  }

  const secret = env.APPLE_SHARED_SECRET?.trim();
  if (!secret) {
    return { ok: false, error: "missing_apple_shared_secret", rawJson: null };
  }

  const payload = {
    "receipt-data": receiptData,
    password: secret,
    "exclude-old-transactions": true,
  };

  const production = await fetchJson("https://buy.itunes.apple.com/verifyReceipt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let response = production;

  if (production.ok) {
    const status = production.data?.status;
    if (status === 21007) {
      response = await fetchJson("https://sandbox.itunes.apple.com/verifyReceipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }
  }

  if (!response.ok) {
    return { ok: false, error: "apple_verification_failed", rawJson: response.rawJson };
  }

  const status = response.data?.status;
  if (typeof status !== "number" || status !== 0) {
    return { ok: false, error: `apple_status_${status ?? "unknown"}`, rawJson: response.rawJson };
  }

  const receiptInfo =
    response.data?.latest_receipt_info ?? response.data?.receipt?.in_app ?? [];

  const latest = pickLatestAppleReceipt(receiptInfo);

  const productId = input.product_id || latest?.product_id;
  if (!productId) {
    return { ok: false, error: "missing_product_id", rawJson: response.rawJson };
  }

  const transactionId = input.transaction_id ?? latest?.transaction_id ?? null;
  const purchaseDateMs =
    input.purchase_date_ms ??
    (latest?.purchase_date_ms ? Number(latest.purchase_date_ms) : null);
  const expiresDateMs = latest?.expires_date_ms
    ? Number(latest.expires_date_ms)
    : null;

  return {
    ok: true,
    productId,
    entitlementId: productId,
    transactionId,
    purchaseDateMs,
    expiresDateMs,
    environment: response.data?.environment ?? "production",
    amountCents: input.price_cents ?? null,
    rawJson: response.rawJson,
  };
}

async function validateGoogleReceipt(env: Env, input: z.infer<typeof receiptSchema>): Promise<ReceiptValidationResult> {
  const token = input.purchase_token?.trim();
  if (!token) {
    return { ok: false, error: "missing_purchase_token", rawJson: null };
  }

  const productId = input.product_id?.trim();
  if (!productId) {
    return { ok: false, error: "missing_product_id", rawJson: null };
  }

  const packageName = input.package_name?.trim() || env.GOOGLE_PLAY_PACKAGE_NAME?.trim();
  if (!packageName) {
    return { ok: false, error: "missing_package_name", rawJson: null };
  }

  const serviceAccount = env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!serviceAccount) {
    return { ok: false, error: "missing_google_service_account", rawJson: null };
  }

  let credentials: { client_email: string; private_key: string };
  try {
    credentials = JSON.parse(serviceAccount);
  } catch (error) {
    return { ok: false, error: "invalid_google_service_account", rawJson: null };
  }

  const accessToken = await getGoogleAccessToken(credentials);
  if (!accessToken) {
    return { ok: false, error: "google_access_token_failed", rawJson: null };
  }

  const response = await fetchJson(
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${productId}/tokens/${token}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    return { ok: false, error: "google_verification_failed", rawJson: response.rawJson };
  }

  const expiry = response.data?.expiryTimeMillis
    ? Number(response.data.expiryTimeMillis)
    : null;
  const start = response.data?.startTimeMillis
    ? Number(response.data.startTimeMillis)
    : null;

  return {
    ok: true,
    productId,
    entitlementId: productId,
    transactionId: response.data?.orderId ?? null,
    purchaseDateMs: start,
    expiresDateMs: expiry,
    environment: "production",
    amountCents: input.price_cents ?? null,
    rawJson: response.rawJson,
  };
}

async function getGoogleAccessToken(credentials: {
  client_email: string;
  private_key: string;
}) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const assertion = await signJwt(credentials.private_key, payload);
  if (!assertion) {
    return null;
  }

  const tokenResponse = await fetchJson("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    return null;
  }

  return tokenResponse.data?.access_token ?? null;
}

async function signJwt(privateKeyPem: string, payload: Record<string, unknown>) {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const key = await importPrivateKey(privateKeyPem);
  if (!key) {
    return null;
  }

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(data)
  );

  return `${data}.${base64UrlEncode(signature)}`;
}

async function importPrivateKey(pem: string) {
  const pemBody = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");

  try {
    const binary = atob(pemBody);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    return await crypto.subtle.importKey(
      "pkcs8",
      bytes.buffer,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );
  } catch (error) {
    return null;
  }
}

function base64UrlEncode(input: string | ArrayBuffer) {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pickLatestAppleReceipt(receipts: Array<{ purchase_date_ms?: string; product_id?: string; transaction_id?: string; expires_date_ms?: string }>) {
  if (!Array.isArray(receipts) || receipts.length === 0) {
    return null;
  }

  return receipts
    .map((receipt) => ({
      ...receipt,
      purchase_date_ms: receipt.purchase_date_ms ? Number(receipt.purchase_date_ms) : 0,
    }))
    .sort((a, b) => (b.purchase_date_ms ?? 0) - (a.purchase_date_ms ?? 0))[0];
}

async function fetchJson(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    const parsed = text ? JSON.parse(text) : null;
    return { ok: response.ok, data: parsed, rawJson: text };
  } catch (error) {
    return { ok: false, data: null, rawJson: null };
  }
}

async function recordReceipt(db: Database, input: {
  appId: string;
  appUserId: string;
  productId: string;
  store: string;
  transactionId: string | null;
  purchaseDate: string | null;
  rawJson: string | null;
  status: string;
}) {
  await db.insert(schema.receipts).values({
    id: crypto.randomUUID(),
    appId: input.appId,
    appUserId: input.appUserId,
    productId: input.productId,
    store: input.store,
    transactionId: input.transactionId,
    purchaseDate: input.purchaseDate,
    rawJson: input.rawJson,
    status: input.status,
    createdAt: new Date().toISOString(),
  });
}

async function recordEvent(db: Database, input: {
  appId: string;
  type: string;
  appUserId?: string | null;
  productId?: string | null;
  amountCents?: number | null;
  payload?: unknown;
}) {
  await db.insert(schema.events).values({
    id: crypto.randomUUID(),
    appId: input.appId,
    type: input.type,
    appUserId: input.appUserId ?? null,
    productId: input.productId ?? null,
    amountCents: input.amountCents ?? null,
    payloadJson: input.payload ? JSON.stringify(input.payload) : null,
    createdAt: new Date().toISOString(),
  });
}

export default app;
