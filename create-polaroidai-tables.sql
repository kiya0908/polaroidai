-- 宝丽来AI项目专用数据表创建脚本
-- 此脚本仅创建新表，不会影响现有数据

-- 1. 用户积分表
CREATE TABLE IF NOT EXISTS "polaroidai_user_credit" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(200) NOT NULL,
    "credit" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. 用户账单表
CREATE TABLE IF NOT EXISTS "polaroidai_user_billing" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(200) NOT NULL,
    "state" VARCHAR NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" VARCHAR NOT NULL,
    "polaroid_id" INTEGER,
    "description" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. 用户积分交易记录表
CREATE TABLE IF NOT EXISTS "polaroidai_user_credit_transaction" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(200) NOT NULL,
    "credit" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "billing_id" INTEGER,
    "type" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. 用户支付信息表
CREATE TABLE IF NOT EXISTS "polaroidai_user_payment_info" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(200) NOT NULL,
    "user_info" JSON,
    "creem_customer_id" VARCHAR,
    "creem_subscription_id" VARCHAR,
    "creem_price_id" VARCHAR,
    "creem_current_period_end" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. 宝丽来生成记录表（核心表）
CREATE TABLE IF NOT EXISTS "polaroidai_polaroid_generation" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(200) NOT NULL,
    "request_id" VARCHAR NOT NULL,
    "input_type" VARCHAR NOT NULL,
    "input_content" TEXT,
    "input_image_url" VARCHAR,
    "output_image_url" VARCHAR,
    "thumbnail_url" VARCHAR,
    "style_type" VARCHAR(50) NOT NULL DEFAULT 'classic_polaroid',
    "task_status" VARCHAR NOT NULL,
    "is_private" BOOLEAN DEFAULT false,
    "download_num" INTEGER NOT NULL DEFAULT 0,
    "views_num" INTEGER NOT NULL DEFAULT 0,
    "credit_cost" INTEGER NOT NULL,
    "processing_time" INTEGER,
    "gemini_request_id" VARCHAR,
    "gemini_response" TEXT,
    "locale" VARCHAR(64),
    "error_msg" TEXT,
    "execute_start_time" BIGINT,
    "execute_end_time" BIGINT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSON,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. 宝丽来下载记录表
CREATE TABLE IF NOT EXISTS "polaroidai_polaroid_downloads" (
    "id" SERIAL PRIMARY KEY,
    "polaroid_id" INTEGER NOT NULL,
    "user_id" VARCHAR(200) NOT NULL,
    "download_type" VARCHAR NOT NULL DEFAULT 'original',
    "user_agent" TEXT,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. 宝丽来查看记录表
CREATE TABLE IF NOT EXISTS "polaroidai_polaroid_views" (
    "id" SERIAL PRIMARY KEY,
    "polaroid_id" INTEGER NOT NULL,
    "user_id" VARCHAR(200) NOT NULL,
    "view_duration" INTEGER,
    "referrer" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. 媒体文件表
CREATE TABLE IF NOT EXISTS "polaroidai_media" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR NOT NULL,
    "key" VARCHAR NOT NULL,
    "url" VARCHAR NOT NULL,
    "color" VARCHAR,
    "blurhash" VARCHAR,
    "file_size" INTEGER NOT NULL,
    "file_type" VARCHAR NOT NULL,
    "md5" VARCHAR NOT NULL,
    "ext" JSON,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引和约束
CREATE UNIQUE INDEX IF NOT EXISTS "polaroidai_user_credit_user_id_key" ON "polaroidai_user_credit"("user_id");
CREATE INDEX IF NOT EXISTS "polaroidai_user_credit_user_id_idx" ON "polaroidai_user_credit"("user_id");

CREATE UNIQUE INDEX IF NOT EXISTS "polaroidai_polaroid_generation_request_id_key" ON "polaroidai_polaroid_generation"("request_id");
CREATE INDEX IF NOT EXISTS "polaroidai_polaroid_generation_user_id_idx" ON "polaroidai_polaroid_generation"("user_id");
CREATE INDEX IF NOT EXISTS "polaroidai_polaroid_generation_task_status_idx" ON "polaroidai_polaroid_generation"("task_status");

CREATE UNIQUE INDEX IF NOT EXISTS "polaroidai_media_key_key" ON "polaroidai_media"("key");
CREATE UNIQUE INDEX IF NOT EXISTS "polaroidai_media_md5_key" ON "polaroidai_media"("md5");

CREATE UNIQUE INDEX IF NOT EXISTS "polaroidai_user_payment_info_user_id_key" ON "polaroidai_user_payment_info"("user_id");

-- 更新触发器（PostgreSQL自动更新updated_at字段）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有有updated_at字段的表创建触发器
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN
        SELECT t.table_name
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name
        WHERE t.table_schema = 'public'
        AND t.table_name LIKE 'polaroidai_%'
        AND c.column_name = 'updated_at'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
            CREATE TRIGGER update_%s_updated_at
            BEFORE UPDATE ON %s
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', table_name, table_name, table_name, table_name);
    END LOOP;
END $$;