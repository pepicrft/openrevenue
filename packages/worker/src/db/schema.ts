import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Existing tables
export const apps = sqliteTable("apps", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  apiKey: text("api_key").notNull().unique(),
  createdAt: text("created_at").notNull(),
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
  isActive: integer("is_active").notNull().default(1),
});

export const entitlements = sqliteTable("entitlements", {
  id: text("id").primaryKey(),
  appId: text("app_id").notNull(),
  appUserId: text("app_user_id").notNull(),
  identifier: text("identifier").notNull(),
  productId: text("product_id").notNull(),
  expiresDate: text("expires_date"),
  isActive: integer("is_active").notNull().default(1),
});

// Auth tables for dashboard users
export const dashboardUsers = sqliteTable("dashboard_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const emailVerificationTokens = sqliteTable("email_verification_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => dashboardUsers.id),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => dashboardUsers.id),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});
