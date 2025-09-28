-- =============================================================================
-- 宝丽来AI生成器数据库迁移脚本
-- 创建时间: 2025-09-21
-- 说明: 基于 ERD.md 设计的15张数据表
-- 执行方式: 在 Supabase SQL Editor 中执行此脚本
-- =============================================================================

-- 1. 用户系统表 (4表)

-- 1.1 用户积分表
CREATE TABLE IF NOT EXISTS "polaroidai_user_credit" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(200) NOT NULL,
    "credit" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 用户账单表
CREATE TABLE IF NOT EXISTS "polaroidai_user_billing" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(200) NOT NULL,
    "state" VARCHAR NOT NULL, -- Done/Pending/Failed
    "amount" INTEGER NOT NULL, -- 金额(正数充值/负数消费)
    "type" VARCHAR NOT NULL, -- Withdraw/Deposit/Gift
    "polaroid_id" INTEGER,
    "description" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 1.3 积分交易表
CREATE TABLE IF NOT EXISTS "polaroidai_user_credit_transaction" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(200) NOT NULL,
    "credit" INTEGER NOT NULL, -- 变动积分(正负)
    "balance" INTEGER NOT NULL, -- 变动后余额
    "billing_id" INTEGER,
    "type" VARCHAR NOT NULL, -- Generate/Recharge/Gift
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 1.4 用户支付信息表 (creem支付)
CREATE TABLE IF NOT EXISTS "polaroidai_user_payment_info" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(200) NOT NULL,
    "user_info" JSON,
    "creem_customer_id" VARCHAR,
    "creem_subscription_id" VARCHAR,
    "creem_price_id" VARCHAR,
    "creem_current_period_end" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 2. 业务核心表 (4表)

-- 2.1 宝丽来生成核心表
CREATE TABLE IF NOT EXISTS "polaroidai_polaroid_generation" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(200) NOT NULL,
    "request_id" VARCHAR NOT NULL,
    "input_type" VARCHAR NOT NULL, -- 'text' | 'image'
    "input_content" TEXT, -- 文字描述内容
    "input_image_url" VARCHAR, -- 输入图像 URL
    "output_image_url" VARCHAR, -- 生成的宝丽来图像 URL
    "thumbnail_url" VARCHAR, -- 缩略图 URL
    "style_type" VARCHAR(50) DEFAULT 'classic_polaroid', -- 宝丽来风格类型
    "task_status" VARCHAR NOT NULL, -- 'pending' | 'processing' | 'completed' | 'failed'
    "is_private" BOOLEAN DEFAULT false, -- 是否私有
    "download_num" INTEGER DEFAULT 0, -- 下载次数
    "views_num" INTEGER DEFAULT 0, -- 查看次数
    "credit_cost" INTEGER NOT NULL, -- 消耗积分
    "processing_time" INTEGER, -- 处理时间(毫秒)
    "gemini_request_id" VARCHAR, -- Gemini请求ID
    "gemini_response" TEXT, -- Gemini响应详情
    "locale" VARCHAR(64), -- 语言环境
    "error_msg" TEXT, -- 错误信息
    "execute_start_time" BIGINT, -- 开始时间戳
    "execute_end_time" BIGINT, -- 结束时间戳
    "retry_count" INTEGER DEFAULT 0, -- 重试次数
    "metadata" JSON, -- 额外元数据
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 下载记录表
CREATE TABLE IF NOT EXISTS "polaroidai_polaroid_downloads" (
    "id" SERIAL PRIMARY KEY,
    "polaroid_id" INTEGER NOT NULL,
    "user_id" VARCHAR(200) NOT NULL,
    "download_type" VARCHAR DEFAULT 'original', -- 'original' | 'thumbnail'
    "user_agent" TEXT, -- 用户设备信息
    "ip_address" VARCHAR(45), -- 下载IP
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 查看记录表
CREATE TABLE IF NOT EXISTS "polaroidai_polaroid_views" (
    "id" SERIAL PRIMARY KEY,
    "polaroid_id" INTEGER NOT NULL,
    "user_id" VARCHAR(200) NOT NULL,
    "view_duration" INTEGER, -- 查看时长(秒)
    "referrer" VARCHAR(500), -- 来源页面
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 2.4 媒体文件表
CREATE TABLE IF NOT EXISTS "polaroidai_media" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR NOT NULL,
    "key" VARCHAR NOT NULL,
    "url" VARCHAR NOT NULL,
    "color" VARCHAR, -- 主色调
    "blurhash" VARCHAR, -- 模糊哈希
    "file_size" INTEGER NOT NULL, -- 文件大小
    "file_type" VARCHAR NOT NULL, -- 文件类型
    "md5" VARCHAR NOT NULL, -- MD5校验
    "ext" JSON, -- 扩展信息
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 3. 商品交易表 (4表)

-- 3.1 充值商品表
CREATE TABLE IF NOT EXISTS "polaroidai_charge_product" (
    "id" SERIAL PRIMARY KEY,
    "amount" INTEGER NOT NULL, -- 售价(分)
    "original_amount" INTEGER NOT NULL, -- 原价(分)
    "credit" INTEGER NOT NULL, -- 赠送积分
    "currency" VARCHAR NOT NULL, -- 货币类型
    "locale" VARCHAR NOT NULL, -- 适用语言
    "title" VARCHAR NOT NULL, -- 商品标题
    "tag" JSON, -- 商品标签
    "message" TEXT, -- 商品描述
    "state" VARCHAR NOT NULL, -- 商品状态
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 3.2 充值订单表
CREATE TABLE IF NOT EXISTS "polaroidai_charge_order" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(200) NOT NULL,
    "user_info" JSON, -- 用户信息快照
    "amount" INTEGER NOT NULL, -- 订单金额(分)
    "credit" INTEGER NOT NULL, -- 获得积分
    "phase" VARCHAR NOT NULL, -- 订单阶段
    "channel" VARCHAR NOT NULL, -- 支付渠道
    "currency" VARCHAR NOT NULL, -- 货币类型
    "payment_at" TIMESTAMP(6), -- 支付时间
    "result" JSON, -- 支付结果
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 3.3 礼品码表
CREATE TABLE IF NOT EXISTS "polaroidai_gift_code" (
    "id" SERIAL PRIMARY KEY,
    "code" VARCHAR(256) NOT NULL, -- 兑换码
    "credit_amount" INTEGER NOT NULL, -- 积分数量
    "used" BOOLEAN DEFAULT false, -- 是否已使用
    "used_by" VARCHAR(200), -- 使用者ID
    "used_at" TIMESTAMP(6), -- 使用时间
    "transaction_id" INTEGER, -- 交易记录ID
    "expired_at" TIMESTAMP(6), -- 过期时间
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 3.4 活动订单表
CREATE TABLE IF NOT EXISTS "polaroidai_claimed_activity_order" (
    "id" SERIAL PRIMARY KEY,
    "charge_order_id" INTEGER NOT NULL,
    "user_id" VARCHAR(200) NOT NULL,
    "credit" INTEGER NOT NULL, -- 奖励积分
    "activity_code" VARCHAR(200) NOT NULL, -- 活动代码
    "transaction_id" INTEGER, -- 交易记录ID
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 4. 内容管理表 (2表)

-- 4.1 邮件通讯表
CREATE TABLE IF NOT EXISTS "polaroidai_newsletters" (
    "id" SERIAL PRIMARY KEY,
    "subject" VARCHAR(200), -- 邮件主题
    "body" TEXT, -- 邮件内容
    "locale" VARCHAR(10), -- 语言
    "sent_at" TIMESTAMP(6), -- 发送时间
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 4.2 订阅者表
CREATE TABLE IF NOT EXISTS "polaroidai_subscribers" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(120), -- 邮箱地址
    "token" VARCHAR(50), -- 验证令牌
    "locale" VARCHAR(10), -- 语言偏好
    "subscribed_at" TIMESTAMP(6), -- 订阅时间
    "unsubscribed_at" TIMESTAMP(6), -- 取消订阅时间
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 创建索引以优化查询性能
-- =============================================================================

-- 用户系统表索引
CREATE UNIQUE INDEX IF NOT EXISTS "polaroidai_user_credit_user_id_unique" ON "polaroidai_user_credit"("user_id");
CREATE INDEX IF NOT EXISTS "polaroidai_user_credit_user_id_idx" ON "polaroidai_user_credit"("user_id");

CREATE INDEX IF NOT EXISTS "polaroidai_user_billing_user_id_idx" ON "polaroidai_user_billing"("user_id");
CREATE INDEX IF NOT EXISTS "polaroidai_user_billing_state_idx" ON "polaroidai_user_billing"("state");
CREATE INDEX IF NOT EXISTS "polaroidai_user_billing_type_idx" ON "polaroidai_user_billing"("type");
CREATE INDEX IF NOT EXISTS "polaroidai_user_billing_polaroid_id_idx" ON "polaroidai_user_billing"("polaroid_id");

CREATE INDEX IF NOT EXISTS "polaroidai_user_credit_transaction_user_id_idx" ON "polaroidai_user_credit_transaction"("user_id");
CREATE INDEX IF NOT EXISTS "polaroidai_user_credit_transaction_billing_id_idx" ON "polaroidai_user_credit_transaction"("billing_id");
CREATE INDEX IF NOT EXISTS "polaroidai_user_credit_transaction_type_idx" ON "polaroidai_user_credit_transaction"("type");
CREATE INDEX IF NOT EXISTS "polaroidai_user_credit_transaction_created_at_idx" ON "polaroidai_user_credit_transaction"("created_at");

CREATE UNIQUE INDEX IF NOT EXISTS "polaroidai_user_payment_info_user_id_unique" ON "polaroidai_user_payment_info"("user_id");
CREATE INDEX IF NOT EXISTS "polaroidai_user_payment_info_user_id_idx" ON "polaroidai_user_payment_info"("user_id");
CREATE INDEX IF NOT EXISTS "polaroidai_user_payment_info_creem_customer_id_idx" ON "polaroidai_user_payment_info"("creem_customer_id");

-- 业务核心表索引
CREATE UNIQUE INDEX IF NOT EXISTS "polaroidai_polaroid_generation_request_id_unique" ON "polaroidai_polaroid_generation"("request_id");
CREATE INDEX IF NOT EXISTS "polaroidai_polaroid_generation_user_id_idx" ON "polaroidai_polaroid_generation"("user_id");
CREATE INDEX IF NOT EXISTS "polaroidai_polaroid_generation_task_status_idx" ON "polaroidai_polaroid_generation"("task_status");
CREATE INDEX IF NOT EXISTS "polaroidai_polaroid_generation_input_type_idx" ON "polaroidai_polaroid_generation"("input_type");
CREATE INDEX IF NOT EXISTS "polaroidai_polaroid_generation_style_type_idx" ON "polaroidai_polaroid_generation"("style_type");
CREATE INDEX IF NOT EXISTS "polaroidai_polaroid_generation_is_private_idx" ON "polaroidai_polaroid_generation"("is_private");
CREATE INDEX IF NOT EXISTS "polaroidai_polaroid_generation_created_at_idx" ON "polaroidai_polaroid_generation"("created_at");

CREATE INDEX IF NOT EXISTS "polaroidai_polaroid_downloads_polaroid_id_idx" ON "polaroidai_polaroid_downloads"("polaroid_id");
CREATE INDEX IF NOT EXISTS "polaroidai_polaroid_downloads_user_id_idx" ON "polaroidai_polaroid_downloads"("user_id");
CREATE INDEX IF NOT EXISTS "polaroidai_polaroid_downloads_download_type_idx" ON "polaroidai_polaroid_downloads"("download_type");

CREATE INDEX IF NOT EXISTS "polaroidai_polaroid_views_polaroid_id_idx" ON "polaroidai_polaroid_views"("polaroid_id");
CREATE INDEX IF NOT EXISTS "polaroidai_polaroid_views_user_id_idx" ON "polaroidai_polaroid_views"("user_id");
CREATE INDEX IF NOT EXISTS "polaroidai_polaroid_views_created_at_idx" ON "polaroidai_polaroid_views"("created_at");

CREATE UNIQUE INDEX IF NOT EXISTS "polaroidai_media_key_unique" ON "polaroidai_media"("key");
CREATE UNIQUE INDEX IF NOT EXISTS "polaroidai_media_md5_unique" ON "polaroidai_media"("md5");
CREATE INDEX IF NOT EXISTS "polaroidai_media_file_type_idx" ON "polaroidai_media"("file_type");
CREATE INDEX IF NOT EXISTS "polaroidai_media_file_size_idx" ON "polaroidai_media"("file_size");

-- 商品交易表索引
CREATE INDEX IF NOT EXISTS "polaroidai_charge_product_currency_idx" ON "polaroidai_charge_product"("currency");
CREATE INDEX IF NOT EXISTS "polaroidai_charge_product_locale_idx" ON "polaroidai_charge_product"("locale");
CREATE INDEX IF NOT EXISTS "polaroidai_charge_product_state_idx" ON "polaroidai_charge_product"("state");

CREATE INDEX IF NOT EXISTS "polaroidai_charge_order_user_id_idx" ON "polaroidai_charge_order"("user_id");
CREATE INDEX IF NOT EXISTS "polaroidai_charge_order_phase_idx" ON "polaroidai_charge_order"("phase");
CREATE INDEX IF NOT EXISTS "polaroidai_charge_order_channel_idx" ON "polaroidai_charge_order"("channel");
CREATE INDEX IF NOT EXISTS "polaroidai_charge_order_payment_at_idx" ON "polaroidai_charge_order"("payment_at");

CREATE UNIQUE INDEX IF NOT EXISTS "polaroidai_gift_code_code_unique" ON "polaroidai_gift_code"("code");
CREATE INDEX IF NOT EXISTS "polaroidai_gift_code_used_idx" ON "polaroidai_gift_code"("used");
CREATE INDEX IF NOT EXISTS "polaroidai_gift_code_used_by_idx" ON "polaroidai_gift_code"("used_by");
CREATE INDEX IF NOT EXISTS "polaroidai_gift_code_expired_at_idx" ON "polaroidai_gift_code"("expired_at");

CREATE INDEX IF NOT EXISTS "polaroidai_claimed_activity_order_charge_order_id_idx" ON "polaroidai_claimed_activity_order"("charge_order_id");
CREATE INDEX IF NOT EXISTS "polaroidai_claimed_activity_order_user_id_idx" ON "polaroidai_claimed_activity_order"("user_id");
CREATE INDEX IF NOT EXISTS "polaroidai_claimed_activity_order_activity_code_idx" ON "polaroidai_claimed_activity_order"("activity_code");

-- 内容管理表索引
CREATE INDEX IF NOT EXISTS "polaroidai_newsletters_locale_idx" ON "polaroidai_newsletters"("locale");
CREATE INDEX IF NOT EXISTS "polaroidai_newsletters_sent_at_idx" ON "polaroidai_newsletters"("sent_at");

CREATE UNIQUE INDEX IF NOT EXISTS "polaroidai_subscribers_email_unique" ON "polaroidai_subscribers"("email");
CREATE INDEX IF NOT EXISTS "polaroidai_subscribers_email_idx" ON "polaroidai_subscribers"("email");
CREATE INDEX IF NOT EXISTS "polaroidai_subscribers_locale_idx" ON "polaroidai_subscribers"("locale");
CREATE INDEX IF NOT EXISTS "polaroidai_subscribers_subscribed_at_idx" ON "polaroidai_subscribers"("subscribed_at");

-- =============================================================================
-- 外键约束
-- =============================================================================

-- 宝丽来下载记录关联宝丽来生成记录
ALTER TABLE "polaroidai_polaroid_downloads"
ADD CONSTRAINT "polaroidai_polaroid_downloads_polaroid_id_fkey"
FOREIGN KEY ("polaroid_id") REFERENCES "polaroidai_polaroid_generation"("id") ON DELETE CASCADE;

-- 宝丽来查看记录关联宝丽来生成记录
ALTER TABLE "polaroidai_polaroid_views"
ADD CONSTRAINT "polaroidai_polaroid_views_polaroid_id_fkey"
FOREIGN KEY ("polaroid_id") REFERENCES "polaroidai_polaroid_generation"("id") ON DELETE CASCADE;

-- 活动订单关联充值订单
ALTER TABLE "polaroidai_claimed_activity_order"
ADD CONSTRAINT "polaroidai_claimed_activity_order_charge_order_id_fkey"
FOREIGN KEY ("charge_order_id") REFERENCES "polaroidai_charge_order"("id");

-- =============================================================================
-- 插入一些基础数据 (可选)
-- =============================================================================

-- 插入基础积分商品
INSERT INTO "polaroidai_charge_product" ("amount", "original_amount", "credit", "currency", "locale", "title", "message", "state") VALUES
(99, 99, 50, 'CNY', 'zh', '新手礼包', '包含50积分，适合新用户尝试', 'active'),
(299, 299, 200, 'CNY', 'zh', '进阶套餐', '包含200积分，性价比之选', 'active'),
(599, 699, 500, 'CNY', 'zh', '专业套餐', '包含500积分，享受85折优惠', 'active'),
(99, 99, 50, 'USD', 'en', 'Starter Pack', '50 credits for new users', 'active'),
(299, 299, 200, 'USD', 'en', 'Pro Pack', '200 credits for regular users', 'active'),
(599, 699, 500, 'USD', 'en', 'Premium Pack', '500 credits with 15% discount', 'active')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 脚本执行完成
-- =============================================================================

-- 显示创建的表
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'polaroidai_%'
ORDER BY table_name;

-- 显示索引信息
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename LIKE 'polaroidai_%'
ORDER BY tablename, indexname;