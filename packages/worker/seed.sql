INSERT INTO apps (id, name, api_key, created_at)
VALUES ('app_1', 'OpenRevenue Demo', 'rc_test_3f64a1b2', datetime('now'));

INSERT INTO app_keys (id, app_id, key, label, created_at)
VALUES ('key_1', 'app_1', 'rc_test_3f64a1b2', 'default', datetime('now'));

INSERT INTO products (id, app_id, identifier, display_name, price_cents, currency, billing_period, type, created_at)
VALUES
  ('prod_1', 'app_1', 'pro_monthly', 'Pro Monthly', 1299, 'USD', 'P1M', 'subscription', datetime('now')),
  ('prod_2', 'app_1', 'pro_yearly', 'Pro Yearly', 9999, 'USD', 'P1Y', 'subscription', datetime('now')),
  ('prod_3', 'app_1', 'starter_monthly', 'Starter Monthly', 599, 'USD', 'P1M', 'subscription', datetime('now'));

INSERT INTO offerings (id, app_id, identifier, description, created_at)
VALUES
  ('offer_1', 'app_1', 'default', 'Primary paywall offerings', datetime('now')),
  ('offer_2', 'app_1', 'growth', 'Higher tier bundles', datetime('now'));

INSERT INTO offering_products (offering_id, product_id, position)
VALUES
  ('offer_1', 'prod_1', 0),
  ('offer_1', 'prod_3', 1),
  ('offer_2', 'prod_2', 0);

INSERT INTO users (id, app_id, app_user_id, first_seen, last_seen)
VALUES
  ('user_1', 'app_1', 'user_001', datetime('now', '-20 day'), datetime('now', '-1 day')),
  ('user_2', 'app_1', 'user_002', datetime('now', '-15 day'), datetime('now', '-2 day')),
  ('user_3', 'app_1', 'user_003', datetime('now', '-10 day'), datetime('now', '-1 day')),
  ('user_4', 'app_1', 'user_004', datetime('now', '-8 day'), datetime('now', '-1 day')),
  ('user_5', 'app_1', 'user_005', datetime('now', '-7 day'), datetime('now', '-1 day'));

INSERT INTO subscriptions (id, app_id, app_user_id, product_id, transaction_id, purchase_date, expires_date, store, environment, is_active)
VALUES
  ('sub_1', 'app_1', 'user_001', 'pro_monthly', 'txn_001', datetime('now', '-29 day'), datetime('now', '+1 day'), 'app_store', 'production', 1),
  ('sub_2', 'app_1', 'user_002', 'pro_yearly', 'txn_002', datetime('now', '-120 day'), datetime('now', '+245 day'), 'app_store', 'production', 1),
  ('sub_3', 'app_1', 'user_003', 'starter_monthly', 'txn_003', datetime('now', '-20 day'), datetime('now', '+10 day'), 'play_store', 'production', 1),
  ('sub_4', 'app_1', 'user_004', 'pro_monthly', 'txn_004', datetime('now', '-5 day'), datetime('now', '+25 day'), 'app_store', 'production', 1),
  ('sub_5', 'app_1', 'user_005', 'starter_monthly', 'txn_005', datetime('now', '-5 day'), datetime('now', '+25 day'), 'play_store', 'production', 1);

INSERT INTO entitlements (id, app_id, app_user_id, identifier, product_id, expires_date, is_active)
VALUES
  ('ent_1', 'app_1', 'user_001', 'pro_monthly', 'pro_monthly', datetime('now', '+1 day'), 1),
  ('ent_2', 'app_1', 'user_002', 'pro_yearly', 'pro_yearly', datetime('now', '+245 day'), 1),
  ('ent_3', 'app_1', 'user_003', 'starter_monthly', 'starter_monthly', datetime('now', '+10 day'), 1),
  ('ent_4', 'app_1', 'user_004', 'pro_monthly', 'pro_monthly', datetime('now', '+25 day'), 1),
  ('ent_5', 'app_1', 'user_005', 'starter_monthly', 'starter_monthly', datetime('now', '+25 day'), 1);

INSERT INTO events (id, app_id, type, app_user_id, product_id, amount_cents, payload_json, created_at)
VALUES
  ('evt_1', 'app_1', 'receipt_validated', 'user_001', 'pro_monthly', 1299, '{"store":"app_store"}', datetime('now', '-13 day')),
  ('evt_2', 'app_1', 'receipt_validated', 'user_002', 'pro_yearly', 9999, '{"store":"app_store"}', datetime('now', '-12 day')),
  ('evt_3', 'app_1', 'receipt_validated', 'user_003', 'starter_monthly', 599, '{"store":"play_store"}', datetime('now', '-11 day')),
  ('evt_4', 'app_1', 'receipt_validated', 'user_004', 'pro_monthly', 1299, '{"store":"app_store"}', datetime('now', '-10 day')),
  ('evt_5', 'app_1', 'receipt_validated', 'user_005', 'starter_monthly', 599, '{"store":"play_store"}', datetime('now', '-9 day')),
  ('evt_6', 'app_1', 'receipt_validated', 'user_001', 'pro_monthly', 1299, '{"store":"app_store"}', datetime('now', '-8 day')),
  ('evt_7', 'app_1', 'receipt_validated', 'user_002', 'pro_yearly', 9999, '{"store":"app_store"}', datetime('now', '-7 day')),
  ('evt_8', 'app_1', 'receipt_validated', 'user_004', 'pro_monthly', 1299, '{"store":"app_store"}', datetime('now', '-6 day')),
  ('evt_9', 'app_1', 'receipt_validated', 'user_005', 'starter_monthly', 599, '{"store":"play_store"}', datetime('now', '-5 day')),
  ('evt_10', 'app_1', 'webhook_cancellation', 'user_003', 'starter_monthly', NULL, '{"reason":"billing_retry"}', datetime('now', '-4 day')),
  ('evt_11', 'app_1', 'receipt_validated', 'user_001', 'pro_monthly', 1299, '{"store":"app_store"}', datetime('now', '-3 day')),
  ('evt_12', 'app_1', 'receipt_validated', 'user_004', 'pro_monthly', 1299, '{"store":"app_store"}', datetime('now', '-2 day')),
  ('evt_13', 'app_1', 'receipt_validated', 'user_005', 'starter_monthly', 599, '{"store":"play_store"}', datetime('now', '-1 day'));
