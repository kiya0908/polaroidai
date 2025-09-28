require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function safeCreateMissingTables() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 检查数据库状态和缺失的表...\n');

    // 1. 检查现有表
    const existingTables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('📋 现有数据表:');
    const existingTableNames = existingTables.map(t => t.table_name);
    existingTableNames.forEach(name => console.log(`  ✅ ${name}`));

    // 2. 定义需要的宝丽来AI表
    const requiredTables = [
      'polaroidai_user_credit',
      'polaroidai_user_billing', 
      'polaroidai_user_credit_transaction',
      'polaroidai_user_payment_info',
      'polaroidai_polaroid_generation',
      'polaroidai_polaroid_downloads',
      'polaroidai_polaroid_views',
      'polaroidai_media',
      'polaroidai_charge_product',
      'polaroidai_charge_order',
      'polaroidai_gift_code',
      'polaroidai_claimed_activity_order',
      'polaroidai_newsletters',
      'polaroidai_subscribers'
    ];

    // 3. 找出缺失的表
    const missingTables = requiredTables.filter(table => !existingTableNames.includes(table));
    
    console.log(`\n🔍 需要创建的表 (${missingTables.length}/${requiredTables.length}):`);
    if (missingTables.length === 0) {
      console.log('  🎉 所有表都已存在！');
      return;
    }

    missingTables.forEach(name => console.log(`  ❌ ${name}`));

    // 4. 安全创建缺失的表
    console.log('\n⚡ 开始创建缺失的表...');

    // 表创建语句映射
    const tableCreationSQL = {
      'polaroidai_user_credit': `
        CREATE TABLE "polaroidai_user_credit" (
          "id" SERIAL PRIMARY KEY,
          "user_id" VARCHAR(200) NOT NULL,
          "credit" INTEGER NOT NULL,
          "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX "polaroidai_user_credit_user_id_key" ON "polaroidai_user_credit"("user_id");
      `,
      
      'polaroidai_user_billing': `
        CREATE TABLE "polaroidai_user_billing" (
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
        CREATE INDEX "polaroidai_user_billing_user_id_idx" ON "polaroidai_user_billing"("user_id");
      `,
      
      'polaroidai_user_credit_transaction': `
        CREATE TABLE "polaroidai_user_credit_transaction" (
          "id" SERIAL PRIMARY KEY,
          "user_id" VARCHAR(200) NOT NULL,
          "credit" INTEGER NOT NULL,
          "balance" INTEGER NOT NULL,
          "billing_id" INTEGER,
          "type" VARCHAR NOT NULL,
          "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX "polaroidai_user_credit_transaction_user_id_idx" ON "polaroidai_user_credit_transaction"("user_id");
      `,
      
      'polaroidai_user_payment_info': `
        CREATE TABLE "polaroidai_user_payment_info" (
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
        CREATE UNIQUE INDEX "polaroidai_user_payment_info_user_id_key" ON "polaroidai_user_payment_info"("user_id");
      `,
      
      'polaroidai_polaroid_generation': `
        CREATE TABLE "polaroidai_polaroid_generation" (
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
        CREATE UNIQUE INDEX "polaroidai_polaroid_generation_request_id_key" ON "polaroidai_polaroid_generation"("request_id");
        CREATE INDEX "polaroidai_polaroid_generation_user_id_idx" ON "polaroidai_polaroid_generation"("user_id");
        CREATE INDEX "polaroidai_polaroid_generation_task_status_idx" ON "polaroidai_polaroid_generation"("task_status");
      `,
      
      'polaroidai_polaroid_downloads': `
        CREATE TABLE "polaroidai_polaroid_downloads" (
          "id" SERIAL PRIMARY KEY,
          "polaroid_id" INTEGER NOT NULL,
          "user_id" VARCHAR(200) NOT NULL,
          "download_type" VARCHAR NOT NULL DEFAULT 'original',
          "user_agent" TEXT,
          "ip_address" VARCHAR(45),
          "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX "polaroidai_polaroid_downloads_polaroid_id_idx" ON "polaroidai_polaroid_downloads"("polaroid_id");
      `,
      
      'polaroidai_polaroid_views': `
        CREATE TABLE "polaroidai_polaroid_views" (
          "id" SERIAL PRIMARY KEY,
          "polaroid_id" INTEGER NOT NULL,
          "user_id" VARCHAR(200) NOT NULL,
          "view_duration" INTEGER,
          "referrer" VARCHAR(500),
          "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX "polaroidai_polaroid_views_polaroid_id_idx" ON "polaroidai_polaroid_views"("polaroid_id");
      `,
      
      'polaroidai_media': `
        CREATE TABLE "polaroidai_media" (
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
        CREATE UNIQUE INDEX "polaroidai_media_key_key" ON "polaroidai_media"("key");
        CREATE UNIQUE INDEX "polaroidai_media_md5_key" ON "polaroidai_media"("md5");
      `,
      
      'polaroidai_charge_product': `
        CREATE TABLE "polaroidai_charge_product" (
          "id" SERIAL PRIMARY KEY,
          "amount" INTEGER NOT NULL,
          "original_amount" INTEGER NOT NULL,
          "credit" INTEGER NOT NULL,
          "currency" VARCHAR NOT NULL,
          "locale" VARCHAR NOT NULL,
          "title" VARCHAR NOT NULL,
          "tag" JSON,
          "message" TEXT,
          "state" VARCHAR NOT NULL,
          "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `,
      
      'polaroidai_charge_order': `
        CREATE TABLE "polaroidai_charge_order" (
          "id" SERIAL PRIMARY KEY,
          "user_id" VARCHAR(200) NOT NULL,
          "user_info" JSON,
          "amount" INTEGER NOT NULL,
          "credit" INTEGER NOT NULL,
          "phase" VARCHAR NOT NULL,
          "channel" VARCHAR NOT NULL,
          "currency" VARCHAR NOT NULL,
          "payment_at" TIMESTAMP(6),
          "result" JSON,
          "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX "polaroidai_charge_order_user_id_idx" ON "polaroidai_charge_order"("user_id");
      `,
      
      'polaroidai_gift_code': `
        CREATE TABLE "polaroidai_gift_code" (
          "id" SERIAL PRIMARY KEY,
          "code" VARCHAR(256) NOT NULL,
          "credit_amount" INTEGER NOT NULL,
          "used" BOOLEAN DEFAULT false,
          "used_by" VARCHAR(200),
          "used_at" TIMESTAMP(6),
          "transaction_id" INTEGER,
          "expired_at" TIMESTAMP(6),
          "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX "polaroidai_gift_code_code_key" ON "polaroidai_gift_code"("code");
      `,
      
      'polaroidai_claimed_activity_order': `
        CREATE TABLE "polaroidai_claimed_activity_order" (
          "id" SERIAL PRIMARY KEY,
          "charge_order_id" INTEGER NOT NULL,
          "user_id" VARCHAR(200) NOT NULL,
          "credit" INTEGER NOT NULL,
          "activity_code" VARCHAR(200) NOT NULL,
          "transaction_id" INTEGER,
          "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `,
      
      'polaroidai_newsletters': `
        CREATE TABLE "polaroidai_newsletters" (
          "id" SERIAL PRIMARY KEY,
          "subject" VARCHAR(200),
          "body" TEXT,
          "locale" VARCHAR(10),
          "sent_at" TIMESTAMP(6),
          "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `,
      
      'polaroidai_subscribers': `
        CREATE TABLE "polaroidai_subscribers" (
          "id" SERIAL PRIMARY KEY,
          "email" VARCHAR(120),
          "token" VARCHAR(50),
          "locale" VARCHAR(10),
          "subscribed_at" TIMESTAMP(6),
          "unsubscribed_at" TIMESTAMP(6),
          "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX "polaroidai_subscribers_email_key" ON "polaroidai_subscribers"("email");
      `
    };

    // 为每个缺失的表创建SQL
    for (const tableName of missingTables) {
      try {
        console.log(`⚡ 创建表: ${tableName}`);
        
        if (tableCreationSQL[tableName]) {
          // 分割SQL语句并逐个执行
          const sqlStatements = tableCreationSQL[tableName]
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
          
          for (const statement of sqlStatements) {
            await prisma.$executeRawUnsafe(statement);
          }
        } else {
          // 简单的表创建（用于其他表）
          console.log(`⚠️  ${tableName} 暂无预定义SQL，跳过`);
          continue;
        }
        
        console.log(`✅ ${tableName} 创建成功`);
      } catch (error) {
        console.error(`❌ ${tableName} 创建失败:`, error.message);
      }
    }

    // 5. 验证结果
    console.log('\n🔍 验证创建结果...');
    const finalTables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE 'polaroidai_%'
      ORDER BY table_name;
    `;

    console.log('✅ 宝丽来AI表列表:');
    finalTables.forEach(table => console.log(`  - ${table.table_name}`));
    
    console.log(`\n🎉 完成！现在有 ${finalTables.length} 个宝丽来AI专用表`);

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

safeCreateMissingTables();