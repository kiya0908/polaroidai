require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function testCreateSingleTable() {
  const prisma = new PrismaClient();

  try {
    console.log('🔄 测试创建单个宝丽来AI表...\n');

    // 尝试创建最简单的表
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "test_polaroidai_simple" (
        "id" SERIAL PRIMARY KEY,
        "user_id" VARCHAR(200) NOT NULL,
        "content" TEXT,
        "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('⚡ 执行创建表语句...');
    await prisma.$executeRawUnsafe(createTableSQL);
    console.log('✅ 创建表成功!');

    // 验证表是否存在
    const checkTable = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'test_polaroidai_simple'
      );
    `;

    console.log('📋 表存在检查:', checkTable[0].exists ? '✅ 存在' : '❌ 不存在');

    // 测试插入数据
    if (checkTable[0].exists) {
      console.log('⚡ 测试插入数据...');
      await prisma.$executeRawUnsafe(`
        INSERT INTO "test_polaroidai_simple" (user_id, content)
        VALUES ('test_user_123', '这是一个测试记录')
      `);

      // 查询数据
      const testData = await prisma.$queryRawUnsafe(`
        SELECT * FROM "test_polaroidai_simple" LIMIT 1
      `);
      console.log('✅ 数据插入和查询成功:', testData[0]);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCreateSingleTable();