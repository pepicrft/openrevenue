CREATE TABLE IF NOT EXISTS app_keys (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  label TEXT,
  created_at TEXT NOT NULL,
  revoked_at TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  identifier TEXT NOT NULL,
  display_name TEXT,
  price_cents INTEGER,
  currency TEXT,
  billing_period TEXT,
  type TEXT NOT NULL DEFAULT 'subscription',
  created_at TEXT NOT NULL,
  UNIQUE(app_id, identifier)
);

CREATE TABLE IF NOT EXISTS offerings (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  identifier TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(app_id, identifier)
);

CREATE TABLE IF NOT EXISTS offering_products (
  offering_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (offering_id, product_id)
);

CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  app_user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  store TEXT,
  transaction_id TEXT,
  purchase_date TEXT,
  raw_json TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  type TEXT NOT NULL,
  app_user_id TEXT,
  product_id TEXT,
  amount_cents INTEGER,
  payload_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  type TEXT NOT NULL,
  received_at TEXT NOT NULL,
  payload_json TEXT
);
