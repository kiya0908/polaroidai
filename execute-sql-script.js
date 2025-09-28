require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function createPolaroidAITablesFromSQL() {
  const prisma = new PrismaClient();

  try {
    console.log('🔄 正在从SQL脚本创建宝丽来AI专用表...\n');

    // 读取SQL文件
    const sqlScript = fs.readFileSync('./create-polaroidai-tables.sql', 'utf8');

    // 将SQL脚本分割成单独的语句
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📄 找到 ${statements.length} 个SQL语句`);

    // 执行每个语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 10) { // 忽略空语句
        try {
          console.log(`⚡ 执行语句 ${i + 1}/${statements.length}...`);
          await prisma.$executeRawUnsafe(statement);
        } catch (error) {
          // 如果是"已存在"错误，继续执行
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`⚠️  语句 ${i + 1} 跳过: ${error.message.split('\n')[0]}`);
          } else {
            console.error(`❌ 语句 ${i + 1} 失败:`, error.message);
            console.error(`SQL语句: ${statement.substring(0, 100)}...`);
          }
        }
      }
    }

    // 验证表是否创建成功
    console.log('\n🔍 验证表创建结果...');
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE 'polaroidai_%'
      ORDER BY table_name;
    `;

    console.log('✅ 宝丽来AI专用表列表:');
    tables.forEach(table => console.log(`   - ${table.table_name}`));

    console.log(`\n🎉 成功！创建了 ${tables.length} 个宝丽来AI专用表`);

  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createPolaroidAITablesFromSQL();