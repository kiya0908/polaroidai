require('dotenv').config({ path: '.env.local' });

console.log('🔍 使用的数据库连接:', process.env.DATABASE_URL ? 'DATABASE_URL已设置' : 'DATABASE_URL未设置');
console.log('🔍 直连URL:', process.env.DIRECT_URL ? 'DIRECT_URL已设置' : 'DIRECT_URL未设置');
const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();

  try {
    console.log('🔄 正在测试数据库连接...');

    // 测试基本连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功！');

    // 测试查询权限
    console.log('🔄 测试数据库查询权限...');
    const result = await prisma.$queryRaw`SELECT version() as version`;
    console.log('✅ 数据库查询成功！PostgreSQL版本:', result[0].version);

    // 检查现有表
    console.log('🔄 检查现有数据表...');
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    if (tables.length > 0) {
      console.log('✅ 发现以下数据表:');
      tables.forEach(table => console.log(`  - ${table.table_name}`));
    } else {
      console.log('⚠️  数据库中暂无数据表');
    }

  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);

    if (error.message.includes('timeout')) {
      console.log('💡 建议检查：');
      console.log('   1. 网络连接是否正常');
      console.log('   2. Supabase项目是否处于活跃状态');
      console.log('   3. 数据库URL是否正确');
    } else if (error.message.includes('authentication')) {
      console.log('💡 建议检查：');
      console.log('   1. 数据库密码是否正确');
      console.log('   2. 用户权限是否足够');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();