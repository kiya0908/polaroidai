require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function analyzeExistingTables() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 分析现有数据库表结构...\n');

    // 获取所有表及其结构
    const tablesQuery = `
      SELECT
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        AND t.table_name != '_prisma_migrations'
      ORDER BY t.table_name, c.ordinal_position;
    `;

    const tableInfo = await prisma.$queryRawUnsafe(tablesQuery);

    // 按表分组
    const tablesByName = {};
    tableInfo.forEach(row => {
      if (!tablesByName[row.table_name]) {
        tablesByName[row.table_name] = [];
      }
      if (row.column_name) {
        tablesByName[row.table_name].push({
          column: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === 'YES',
          default: row.column_default
        });
      }
    });

    console.log('📊 现有数据表详情:\n');
    Object.keys(tablesByName).forEach(tableName => {
      console.log(`🗂️  表: ${tableName}`);
      tablesByName[tableName].forEach(col => {
        const nullable = col.nullable ? '可空' : '非空';
        const defaultVal = col.default ? ` (默认: ${col.default})` : '';
        console.log(`   - ${col.column}: ${col.type} [${nullable}]${defaultVal}`);
      });
      console.log('');
    });

    // 检查数据量
    console.log('📈 数据量统计:\n');
    for (const tableName of Object.keys(tablesByName)) {
      try {
        const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${tableName}"`);
        console.log(`📋 ${tableName}: ${count[0].count} 行数据`);
      } catch (error) {
        console.log(`⚠️  ${tableName}: 无法获取数据量 (${error.message})`);
      }
    }

  } catch (error) {
    console.error('❌ 分析失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeExistingTables();