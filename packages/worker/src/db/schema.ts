import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const apps = sqliteTable("apps", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  apiKey: text("api_key").notNull(),
  createdAt: text("created_at").notNull(),
});

export const appKeys = sqliteTable("app_keys", {
  id: text("id").primaryKey(),
  appId: text("app_id").notNull(),
  key: text("key").notNull(),
  label: text("label"),
  createdAt: text("created_at").notNull(),
  revokedAt: text("revoked_at"),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  appId: text("app_id").notNull(),
  appUserId: text("app_user_id").notNull(),
  firstSeen: text("first_seen").notNull(),
  lastSeen: text("last_seen").notNull(),
  attributesJson: text("attributes_json"),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  appId: text("app_id").notNull(),
  appUserId: text("app_user_id").notNull(),
  productId: text("product_id").notNull(),
  transactionId: text("transaction_id"),
  purchaseDate: text("purchase_date").notNull(),
  expiresDate: text("expires_date"),
  store: text("store"),
  environment: text("environment"),
  isActive: integer("is_active").notNull(),
});

export const entitlements = sqliteTable("entitlements", {
  id: text("id").primaryKey(),
  appId: text("app_id").notNull(),
  appUserId: text("app_user_id").notNull(),
  identifier: text("identifier").notNull(),
  productId: text("product_id").notNull(),
  expiresDate: text("expires_date"),
  isActive: integer("is_active").notNull(),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  appId: text("app_id").notNull(),
  identifier: text("identifier").notNull(),
  displayName: text("display_name"),
  priceCents: integer("price_cents"),
  currency: text("currency"),
  billingPeriod: text("billing_period"),
  type: text("type").notNull(),
  createdAt: text("created_at").notNull(),
});

export const offerings = sqliteTable("offerings", {
  id: text("id").primaryKey(),
  appId: text("app_id").notNull(),
  identifier: text("identifier").notNull(),
  description: text("description"),
  createdAt: text("created_at").notNull(),
});

export const offeringProducts = sqliteTable("offering_products", {
  offeringId: text("offering_id").notNull(),
  productId: text("product_id").notNull(),
  position: integer("position").notNull(),
});

export const receipts = sqliteTable("receipts", {
  id: text("id").primaryKey(),
  appId: text("app_id").notNull(),
  appUserId: text("app_user_id").notNull(),
  productId: text("product_id").notNull(),
  store: text("store"),
  transactionId: text("transaction_id"),
  purchaseDate: text("purchase_date"),
  rawJson: text("raw_json"),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  appId: text("app_id").notNull(),
  type: text("type").notNull(),
  appUserId: text("app_user_id"),
  productId: text("product_id"),
  amountCents: integer("amount_cents"),
  payloadJson: text("payload_json"),
  createdAt: text("created_at").notNull(),
});

export const webhookEvents = sqliteTable("webhook_events", {
  id: text("id").primaryKey(),
  appId: text("app_id").notNull(),
  type: text("type").notNull(),
  receivedAt: text("received_at").notNull(),
  payloadJson: text("payload_json"),
});
