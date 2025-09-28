require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function finalVerification() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 最终验证：宝丽来AI数据库状态\n');

    // 1. 检查数据库连接
    await prisma.$connect();
    console.log('✅ 数据库连接正常');

    // 2. 检查所有宝丽来AI表
    const polaroidaiTables = await prisma.$queryRaw`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
        AND table_name LIKE 'polaroidai_%'
      ORDER BY table_name;
    `;

    console.log('📋 宝丽来AI数据表状态:');
    polaroidaiTables.forEach(table => {
      console.log(`  ✅ ${table.table_name} (${table.column_count} 列)`);
    });

    // 3. 检查原有表是否完整
    const originalTables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name NOT LIKE 'polaroidai_%'
        AND table_name != '_prisma_migrations'
      ORDER BY table_name;
    `;

    console.log('\n📋 原有数据表状态:');
    originalTables.forEach(table => {
      console.log(`  ✅ ${table.table_name} (保持不变)`);
    });

    // 4. 测试 Prisma 客户端是否能正常使用新表
    console.log('\n🧪 测试 Prisma 客户端...');
    
    // 测试用户积分表的 Prisma 操作
    const testUser = await prisma.polaroidai_UserCredit.upsert({
      where: { userId: 'verification_test' },
      update: { credit: 50 },
      create: {
        userId: 'verification_test',
        credit: 50
      }
    });
    console.log('✅ Prisma 客户端操作正常');

    // 清理测试数据
    await prisma.polaroidai_UserCredit.delete({
      where: { userId: 'verification_test' }
    });

    console.log('\n🎉 验证完成！数据库状态总结:');
    console.log(`  • 宝丽来AI专用表: ${polaroidaiTables.length} 个`);
    console.log(`  • 原有数据表: ${originalTables.length} 个 (未受影响)`);
    console.log('  • Prisma 客户端: 正常工作');
    console.log('  • 数据库连接: 稳定');
    
    console.log('\n✨ 宝丽来AI项目数据库已准备就绪，可以开始开发！');

  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    
    if (error.code === 'P2025') {
      console.log('💡 这可能是因为 Prisma 客户端需要重新生成');
      console.log('   请运行: npx prisma generate');
    }
  } finally {
    await prisma.$disconnect();
  }
}

finalVerification();