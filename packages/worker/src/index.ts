import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { parseApiKey, parseBasicAuth } from "./lib/auth";
import {
  requestEmailVerification,
  verifyEmailToken,
  validateSession,
  logout,
  getPendingVerifications,
} from "./lib/email-auth";

interface Env {
  DB: D1Database;
  BASIC_AUTH_PASSWORD: string;
  RESEND_API_KEY?: string;
  APP_URL?: string;
}

type Variables = {
  app: {
    id: string;
    name: string;
  };
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Enable CORS for dashboard
app.use("/auth/*", cors({
  origin: ["http://localhost:5173", "http://localhost:4173"],
  credentials: true,
}));

app.get("/v1/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================
// Auth endpoints for dashboard
// ============================================

const loginSchema = z.object({
  email: z.string().email(),
});

const verifySchema = z.object({
  token: z.string().min(1),
});

// Request email verification (login/signup)
app.post("/auth/login", async (c) => {
  const body = loginSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "invalid_email", details: body.error.flatten() }, 400);
  }

  const result = await requestEmailVerification(c.env, body.data.email);

  if (!result.success) {
    return c.json({ error: result.error }, 500);
  }

  // In development (no RESEND_API_KEY), return the token for easy testing
  return c.json({
    message: "Verification email sent",
    // Only include token in dev mode for local testing
    ...(result.token && { token: result.token }),
  });
});

// Verify email token and create session
app.post("/auth/verify", async (c) => {
  const body = verifySchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "invalid_token", details: body.error.flatten() }, 400);
  }

  const result = await verifyEmailToken(c.env, body.data.token);

  if (!result.success) {
    return c.json({ error: result.error }, 401);
  }

  return c.json({
    message: "Email verified",
    sessionToken: result.sessionToken,
  });
});

// Get current user (validate session)
app.get("/auth/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  const sessionToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!sessionToken) {
    return c.json({ error: "missing_token" }, 401);
  }

  const result = await validateSession(c.env, sessionToken);

  if (!result.valid) {
    return c.json({ error: "invalid_session" }, 401);
  }

  return c.json({
    userId: result.userId,
    email: result.email,
  });
});

// Logout
app.post("/auth/logout", async (c) => {
  const authHeader = c.req.header("Authorization");
  const sessionToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (sessionToken) {
    await logout(c.env, sessionToken);
  }

  return c.json({ message: "Logged out" });
});

// Dev endpoint: list pending verifications (for local testing without email)
app.get("/auth/dev/pending", async (c) => {
  // Only allow in development
  if (c.env.RESEND_API_KEY) {
    return c.json({ error: "not_available_in_production" }, 403);
  }

  const pending = await getPendingVerifications(c.env);
  return c.json({ pending });
});

app.use("/admin/*", async (c, next) => {
  const password = c.env.BASIC_AUTH_PASSWORD?.trim();
  if (!password) {
    return c.json(
      { error: "basic_auth_not_configured", message: "Set BASIC_AUTH_PASSWORD." },
      500
    );
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
  const apiKey = parseApiKey({
    Authorization: c.req.header("Authorization"),
    "X-API-Key": c.req.header("X-API-Key"),
  });

  if (!apiKey) {
    return c.json({ error: "missing_api_key" }, 401);
  }

  const appRow = await c.env.DB.prepare(
    "SELECT id, name FROM apps WHERE api_key = ?"
  )
    .bind(apiKey)
    .first<{ id: string; name: string }>();

  if (!appRow) {
    return c.json({ error: "invalid_api_key" }, 403);
  }

  c.set("app", appRow);
  await next();
});

const receiptSchema = z.object({
  app_user_id: z.string().min(1),
  product_id: z.string().min(1),
  transaction_id: z.string().optional(),
  purchase_date_ms: z.number().optional(),
  store: z.string().optional().default("app_store"),
});

const attributesSchema = z.object({
  attributes: z.record(z.string()).optional(),
});

app.post("/v1/receipts", async (c) => {
  const body = receiptSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ error: "invalid_payload", details: body.error.flatten() }, 400);
  }

  const { app_user_id, product_id, transaction_id, purchase_date_ms, store } =
    body.data;
  const now = new Date();
  const purchaseDate = purchase_date_ms
    ? new Date(purchase_date_ms)
    : now;
  const expiresDate = new Date(purchaseDate);
  expiresDate.setDate(expiresDate.getDate() + 30);

  const appRecord = c.get("app");
  const user = await upsertUser(c.env.DB, appRecord.id, app_user_id);

  await c.env.DB.prepare(
    "INSERT INTO subscriptions (id, app_id, app_user_id, product_id, transaction_id, purchase_date, expires_date, store, environment, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)"
  )
    .bind(
      crypto.randomUUID(),
      appRecord.id,
      app_user_id,
      product_id,
      transaction_id ?? null,
      purchaseDate.toISOString(),
      expiresDate.toISOString(),
      store,
      "production"
    )
    .run();

  await c.env.DB.prepare(
    "INSERT INTO entitlements (id, app_id, app_user_id, identifier, product_id, expires_date, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)"
  )
    .bind(
      crypto.randomUUID(),
      appRecord.id,
      app_user_id,
      product_id,
      product_id,
      expiresDate.toISOString()
    )
    .run();

  const customerInfo = await buildCustomerInfo(c.env.DB, appRecord.id, user.app_user_id);

  return c.json({
    request_date: now.toISOString(),
    request_date_ms: now.getTime(),
    subscriber: customerInfo,
  });
});

app.get("/v1/subscribers/:app_user_id", async (c) => {
  const appRecord = c.get("app");
  const appUserId = c.req.param("app_user_id");

  const user = await upsertUser(c.env.DB, appRecord.id, appUserId);
  const customerInfo = await buildCustomerInfo(c.env.DB, appRecord.id, user.app_user_id);

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

  const user = await upsertUser(c.env.DB, appRecord.id, appUserId);
  const attributesJson = body.data.attributes
    ? JSON.stringify(body.data.attributes)
    : null;

  await c.env.DB.prepare(
    "UPDATE users SET attributes_json = ?, last_seen = ? WHERE id = ?"
  )
    .bind(attributesJson, new Date().toISOString(), user.id)
    .run();

  return c.body(null, 204);
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

app.get("/admin/health", (c) => {
  return c.json({ status: "ok" });
});

function unauthorizedResponse() {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": "Basic realm=\"OpenRevenue Admin\"",
    },
  });
}

async function upsertUser(db: D1Database, appId: string, appUserId: string) {
  const existing = await db
    .prepare("SELECT * FROM users WHERE app_id = ? AND app_user_id = ?")
    .bind(appId, appUserId)
    .first<{
      id: string;
      app_id: string;
      app_user_id: string;
      first_seen: string;
      last_seen: string;
    }>();

  const now = new Date().toISOString();

  if (existing) {
    await db
      .prepare("UPDATE users SET last_seen = ? WHERE id = ?")
      .bind(now, existing.id)
      .run();
    return existing;
  }

  const newUser = {
    id: crypto.randomUUID(),
    app_id: appId,
    app_user_id: appUserId,
    first_seen: now,
    last_seen: now,
  };

  await db
    .prepare(
      "INSERT INTO users (id, app_id, app_user_id, first_seen, last_seen) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(
      newUser.id,
      newUser.app_id,
      newUser.app_user_id,
      newUser.first_seen,
      newUser.last_seen
    )
    .run();

  return newUser;
}

async function buildCustomerInfo(db: D1Database, appId: string, appUserId: string) {
  const user = await db
    .prepare("SELECT * FROM users WHERE app_id = ? AND app_user_id = ?")
    .bind(appId, appUserId)
    .first<{
      first_seen: string;
      last_seen: string;
    }>();

  const subscriptions = await db
    .prepare(
      "SELECT product_id, purchase_date, expires_date, store, environment, is_active FROM subscriptions WHERE app_id = ? AND app_user_id = ?"
    )
    .bind(appId, appUserId)
    .all<{
      product_id: string;
      purchase_date: string;
      expires_date: string | null;
      store: string | null;
      environment: string | null;
      is_active: number;
    }>();

  const entitlements = await db
    .prepare(
      "SELECT identifier, product_id, expires_date, is_active FROM entitlements WHERE app_id = ? AND app_user_id = ?"
    )
    .bind(appId, appUserId)
    .all<{
      identifier: string;
      product_id: string;
      expires_date: string | null;
      is_active: number;
    }>();

  const subscriptionMap: Record<string, unknown> = {};
  for (const row of subscriptions.results) {
    subscriptionMap[row.product_id] = {
      purchase_date: row.purchase_date,
      expires_date: row.expires_date,
      ownership_type: "PURCHASED",
      store: row.store ?? "app_store",
      is_sandbox: false,
      period_type: "normal",
      unsubscribe_detected_at: null,
      billing_issues_detected_at: null,
      environment: row.environment ?? "production",
      is_active: row.is_active === 1,
    };
  }

  const entitlementMap: Record<string, unknown> = {};
  for (const row of entitlements.results) {
    entitlementMap[row.identifier] = {
      product_identifier: row.product_id,
      expires_date: row.expires_date,
      grace_period_expires_date: null,
      purchase_date: null,
      ownership_type: "PURCHASED",
      is_active: row.is_active === 1,
    };
  }

  return {
    original_app_user_id: appUserId,
    first_seen: user?.first_seen ?? new Date().toISOString(),
    last_seen: user?.last_seen ?? new Date().toISOString(),
    entitlements: entitlementMap,
    subscriptions: subscriptionMap,
    non_subscriptions: {},
    management_url: null,
  };
}

export default app;
