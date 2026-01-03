-- 插入充值产品数据
-- 如果数据库中没有产品数据，请执行此SQL

-- 英文产品
INSERT INTO polaroidai_charge_product (amount, original_amount, credit, currency, locale, title, message, state, created_at, updated_at)
VALUES
  (990, 0, 1000, 'USD', 'en', 'Starter Pack', 'Perfect for trying out,1000 credits,One-time payment,No subscription', 'active', NOW(), NOW()),
  (1990, 2490, 2500, 'USD', 'en', 'Popular Pack', 'Best value for regular users,2500 credits,Save 20%,One-time payment', 'active', NOW(), NOW()),
  (9900, 0, 10000, 'USD', 'en', 'Pro Pack', 'For power users,10000 credits,Maximum value,One-time payment', 'active', NOW(), NOW());

-- 中文产品
INSERT INTO polaroidai_charge_product (amount, original_amount, credit, currency, locale, title, message, state, created_at, updated_at)
VALUES
  (990, 0, 1000, 'USD', 'zh', '入门套餐', '适合尝鲜使用,1000积分,一次性付款,无订阅', 'active', NOW(), NOW()),
  (1990, 2490, 2500, 'USD', 'zh', '热门套餐', '最超值选择,2500积分,节省20%,一次性付款', 'active', NOW(), NOW()),
  (9900, 0, 10000, 'USD', 'zh', '专业套餐', '适合重度用户,10000积分,最大价值,一次性付款', 'active', NOW(), NOW());

-- 查询插入的数据
SELECT * FROM polaroidai_charge_product ORDER BY locale, credit;
