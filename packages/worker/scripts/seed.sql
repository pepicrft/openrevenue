-- OpenRevenue Database Seed Script
-- This script populates the database with sample data for development and testing.
-- 
-- IMPORTANT: Keep this file up to date when adding new tables or modifying schemas.
-- Run with: pnpm -C packages/worker wrangler d1 execute openrevenue --local --file=packages/worker/scripts/seed.sql

-- Clear existing data (in reverse order of dependencies)
DELETE FROM sessions;
DELETE FROM email_verification_tokens;
DELETE FROM dashboard_users;
DELETE FROM entitlements;
DELETE FROM subscriptions;
DELETE FROM users;
DELETE FROM apps;

-- ============================================
-- Apps (API clients)
-- ============================================
INSERT INTO apps (id, name, api_key, created_at) VALUES 
  ('app_demo', 'Demo App', 'rc_test_openrevenue', datetime('now')),
  ('app_acme', 'Acme Corp', 'rc_test_acme_12345', datetime('now')),
  ('app_startup', 'Startup Pro', 'rc_test_startup_67890', datetime('now'));

-- ============================================
-- Users (app subscribers/customers)
-- ============================================
INSERT INTO users (id, app_id, app_user_id, first_seen, last_seen, attributes_json) VALUES
  -- Demo App users
  ('usr_1', 'app_demo', 'user_alice', datetime('now', '-30 days'), datetime('now', '-1 day'), '{"name": "Alice", "tier": "premium"}'),
  ('usr_2', 'app_demo', 'user_bob', datetime('now', '-60 days'), datetime('now', '-2 days'), '{"name": "Bob", "tier": "basic"}'),
  ('usr_3', 'app_demo', 'user_charlie', datetime('now', '-7 days'), datetime('now'), '{"name": "Charlie", "tier": "trial"}'),
  -- Acme Corp users
  ('usr_4', 'app_acme', 'acme_user_1', datetime('now', '-90 days'), datetime('now', '-5 days'), NULL),
  ('usr_5', 'app_acme', 'acme_user_2', datetime('now', '-15 days'), datetime('now'), NULL);

-- ============================================
-- Subscriptions
-- ============================================
INSERT INTO subscriptions (id, app_id, app_user_id, product_id, transaction_id, purchase_date, expires_date, store, environment, is_active) VALUES
  -- Active monthly subscription
  ('sub_1', 'app_demo', 'user_alice', 'premium_monthly', 'txn_001', datetime('now', '-15 days'), datetime('now', '+15 days'), 'app_store', 'production', 1),
  -- Active yearly subscription
  ('sub_2', 'app_demo', 'user_bob', 'premium_yearly', 'txn_002', datetime('now', '-200 days'), datetime('now', '+165 days'), 'app_store', 'production', 1),
  -- Expired subscription
  ('sub_3', 'app_demo', 'user_charlie', 'premium_monthly', 'txn_003', datetime('now', '-45 days'), datetime('now', '-15 days'), 'play_store', 'production', 0),
  -- Sandbox subscription
  ('sub_4', 'app_demo', 'user_alice', 'premium_monthly', 'txn_004_sandbox', datetime('now', '-5 days'), datetime('now', '+25 days'), 'app_store', 'sandbox', 1),
  -- Acme subscription
  ('sub_5', 'app_acme', 'acme_user_1', 'enterprise_monthly', 'txn_005', datetime('now', '-10 days'), datetime('now', '+20 days'), 'app_store', 'production', 1);

-- ============================================
-- Entitlements
-- ============================================
INSERT INTO entitlements (id, app_id, app_user_id, identifier, product_id, expires_date, is_active) VALUES
  -- Alice's entitlements
  ('ent_1', 'app_demo', 'user_alice', 'premium_access', 'premium_monthly', datetime('now', '+15 days'), 1),
  ('ent_2', 'app_demo', 'user_alice', 'no_ads', 'premium_monthly', datetime('now', '+15 days'), 1),
  -- Bob's entitlements
  ('ent_3', 'app_demo', 'user_bob', 'premium_access', 'premium_yearly', datetime('now', '+165 days'), 1),
  ('ent_4', 'app_demo', 'user_bob', 'no_ads', 'premium_yearly', datetime('now', '+165 days'), 1),
  ('ent_5', 'app_demo', 'user_bob', 'priority_support', 'premium_yearly', datetime('now', '+165 days'), 1),
  -- Charlie's expired entitlement
  ('ent_6', 'app_demo', 'user_charlie', 'premium_access', 'premium_monthly', datetime('now', '-15 days'), 0),
  -- Acme entitlement
  ('ent_7', 'app_acme', 'acme_user_1', 'enterprise_features', 'enterprise_monthly', datetime('now', '+20 days'), 1);

-- ============================================
-- Dashboard Users (admin accounts)
-- ============================================
INSERT INTO dashboard_users (id, email, email_verified, created_at, updated_at) VALUES
  ('dash_1', 'admin@example.com', 1, datetime('now', '-30 days'), datetime('now')),
  ('dash_2', 'developer@example.com', 1, datetime('now', '-7 days'), datetime('now')),
  ('dash_3', 'pending@example.com', 0, datetime('now', '-1 day'), datetime('now', '-1 day'));

-- ============================================
-- Sessions (active login sessions)
-- ============================================
INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES
  ('sess_1', 'dash_1', 'dev_session_token_admin_12345', datetime('now', '+30 days'), datetime('now', '-1 day')),
  ('sess_2', 'dash_2', 'dev_session_token_developer_67890', datetime('now', '+30 days'), datetime('now'));

-- Note: email_verification_tokens are intentionally not seeded as they are short-lived

-- ============================================
-- Summary
-- ============================================
-- Apps: 3 (Demo App, Acme Corp, Startup Pro)
-- Users: 5 (3 in Demo, 2 in Acme)
-- Subscriptions: 5 (various states: active, expired, sandbox)
-- Entitlements: 7 (mapped to subscriptions)
-- Dashboard Users: 3 (2 verified, 1 pending)
-- Sessions: 2 (for quick dev access)
--
-- Dev session tokens for testing:
--   admin@example.com: dev_session_token_admin_12345
--   developer@example.com: dev_session_token_developer_67890
