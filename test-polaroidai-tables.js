require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function testPolaroidAITables() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 测试宝丽来AI数据表功能...\n');

    // 1. 测试用户积分表
    console.log('⚡ 测试用户积分表...');
    await prisma.$executeRawUnsafe(`
      INSERT INTO "polaroidai_user_credit" (user_id, credit)
      VALUES ('test_user_001', 100)
      ON CONFLICT (user_id) DO UPDATE SET credit = EXCLUDED.credit
    `);

    const userCredit = await prisma.$queryRawUnsafe(`
      SELECT * FROM "polaroidai_user_credit" WHERE user_id = 'test_user_001'
    `);
    console.log('✅ 用户积分表测试成功:', userCredit[0]);

    // 2. 测试宝丽来生成记录表
    console.log('\n⚡ 测试宝丽来生成记录表...');
    await prisma.$executeRawUnsafe(`
      INSERT INTO "polaroidai_polaroid_generation" 
      (user_id, request_id, input_type, input_content, task_status, credit_cost)
      VALUES ('test_user_001', 'req_001', 'text', '测试生成一张宝丽来照片', 'completed', 10)
    `);

    const polaroidGen = await prisma.$queryRawUnsafe(`
      SELECT * FROM "polaroidai_polaroid_generation" WHERE request_id = 'req_001'
    `);
    console.log('✅ 宝丽来生成记录表测试成功:', {
      id: polaroidGen[0].id,
      user_id: polaroidGen[0].user_id,
      input_content: polaroidGen[0].input_content,
      task_status: polaroidGen[0].task_status
    });

    // 3. 测试媒体文件表
    console.log('\n⚡ 测试媒体文件表...');
    await prisma.$executeRawUnsafe(`
      INSERT INTO "polaroidai_media" 
      (name, key, url, file_size, file_type, md5)
      VALUES ('test_image.jpg', 'test_key_001', 'https://example.com/test.jpg', 1024, 'image/jpeg', 'test_md5_hash')
    `);

    const media = await prisma.$queryRawUnsafe(`
      SELECT * FROM "polaroidai_media" WHERE key = 'test_key_001'
    `);
    console.log('✅ 媒体文件表测试成功:', {
      name: media[0].name,
      key: media[0].key,
      file_type: media[0].file_type
    });

    // 4. 测试表关联查询
    console.log('\n⚡ 测试表关联查询...');
    const userWithGenerations = await prisma.$queryRawUnsafe(`
      SELECT 
        uc.user_id,
        uc.credit,
        COUNT(pg.id) as generation_count
      FROM "polaroidai_user_credit" uc
      LEFT JOIN "polaroidai_polaroid_generation" pg ON uc.user_id = pg.user_id
      WHERE uc.user_id = 'test_user_001'
      GROUP BY uc.user_id, uc.credit
    `);
    console.log('✅ 关联查询测试成功:', userWithGenerations[0]);

    // 5. 清理测试数据
    console.log('\n🧹 清理测试数据...');
    await prisma.$executeRawUnsafe(`DELETE FROM "polaroidai_polaroid_generation" WHERE request_id = 'req_001'`);
    await prisma.$executeRawUnsafe(`DELETE FROM "polaroidai_media" WHERE key = 'test_key_001'`);
    await prisma.$executeRawUnsafe(`DELETE FROM "polaroidai_user_credit" WHERE user_id = 'test_user_001'`);
    console.log('✅ 测试数据清理完成');

    console.log('\n🎉 所有宝丽来AI数据表测试通过！数据库已准备就绪。');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPolaroidAITables();