CREATE TABLE IF NOT EXISTS apps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  app_user_id TEXT NOT NULL,
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  attributes_json TEXT,
  UNIQUE(app_id, app_user_id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  app_user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  transaction_id TEXT,
  purchase_date TEXT NOT NULL,
  expires_date TEXT,
  store TEXT,
  environment TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS entitlements (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  app_user_id TEXT NOT NULL,
  identifier TEXT NOT NULL,
  product_id TEXT NOT NULL,
  expires_date TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);
