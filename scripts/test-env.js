// 测试环境变量是否正确加载
require('dotenv').config({ path: '.env.local' });

console.log('DATABASE_URL:', process.env.DATABASE_URL ? '已设置' : '未设置');
console.log('DATABASE_URL值:', process.env.DATABASE_URL);
console.log('DIRECT_URL:', process.env.DIRECT_URL ? '已设置' : '未设置');
console.log('DIRECT_URL值:', process.env.DIRECT_URL);

// 测试基本的node-postgres连接
const { Client } = require('pg');

async function testDirectConnection() {
  console.log('\n🔍 测试直接连接...');

  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ 直接连接成功！');

    // 测试查询
    const result = await client.query('SELECT NOW()');
    console.log('✅ 查询成功:', result.rows[0]);

    // 测试产品表
    const productResult = await client.query('SELECT COUNT(*) FROM polaroidai_charge_product');
    console.log(`✅ 产品表查询成功，共有 ${productResult.rows[0].count} 个产品`);

  } catch (error) {
    console.error('❌ 连接失败:', error.message);
  } finally {
    await client.end();
  }
}

testDirectConnection();