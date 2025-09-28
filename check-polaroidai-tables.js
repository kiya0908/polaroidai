require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function createPolaroidAITables() {
  const prisma = new PrismaClient();

  try {
    console.log('🔄 正在安全地创建宝丽来AI专用数据表...\n');

    // 检查宝丽来AI表是否已存在
    const checkTableExists = async (tableName) => {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = ${tableName}
        );
      `;
      return result[0].exists;
    };

    const polaroidTables = [
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

    console.log('📋 检查宝丽来AI专用表状态:');
    for (const table of polaroidTables) {
      const exists = await checkTableExists(table);
      console.log(`${exists ? '✅' : '❌'} ${table}: ${exists ? '已存在' : '不存在'}`);
    }

    const missingTables = [];
    for (const table of polaroidTables) {
      const exists = await checkTableExists(table);
      if (!exists) {
        missingTables.push(table);
      }
    }

    if (missingTables.length === 0) {
      console.log('\n🎉 所有宝丽来AI专用表都已存在！');
      return;
    }

    console.log(`\n⚠️  需要创建 ${missingTables.length} 个表:`);
    missingTables.forEach(table => console.log(`   - ${table}`));

    console.log('\n💡 建议方案:');
    console.log('   1. 手动创建宝丽来AI专用表 (推荐)');
    console.log('   2. 或者使用 prisma migrate 命令');
    console.log('   3. 现有数据将完全保留不变');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createPolaroidAITables();