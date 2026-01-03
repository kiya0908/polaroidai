import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function testConnection() {
  console.log("🔍 测试数据库连接...\n");

  try {
    // 测试1: 基本连接
    console.log("1️⃣ 测试基本连接...");
    await prisma.$connect();
    console.log("✅ 数据库连接成功！\n");

    // 测试2: 查询产品数据
    console.log("2️⃣ 查询产品数据...");
    const products = await prisma.polaroidai_ChargeProduct.findMany({
      take: 5,
    });
    console.log(`✅ 找到 ${products.length} 个产品：`);
    products.forEach((p) => {
      console.log(`   - ${p.title} (${p.locale}): ${p.credit}积分 - $${p.amount / 100}`);
    });
    console.log();

    // 测试3: 按locale查询
    console.log("3️⃣ 测试按locale查询（en）...");
    const enProducts = await prisma.polaroidai_ChargeProduct.findMany({
      where: { locale: "en", state: "active" },
    });
    console.log(`✅ 找到 ${enProducts.length} 个英文产品\n`);

    console.log("4️⃣ 测试按locale查询（zh）...");
    const zhProducts = await prisma.polaroidai_ChargeProduct.findMany({
      where: { locale: "zh", state: "active" },
    });
    console.log(`✅ 找到 ${zhProducts.length} 个中文产品\n`);

    console.log("🎉 所有测试通过！数据库连接正常。");
  } catch (error) {
    console.error("❌ 数据库连接失败：");
    console.error(error);

    if (error instanceof Error) {
      console.error("\n错误详情：");
      console.error("- 错误类型:", error.name);
      console.error("- 错误信息:", error.message);

      if (error.message.includes("Can't reach database server")) {
        console.error("\n💡 建议：");
        console.error("1. 检查网络连接");
        console.error("2. 确认Supabase项目是否处于活跃状态");
        console.error("3. 验证.env.local中的DATABASE_URL是否正确");
        console.error("4. 尝试在Supabase控制台执行SQL查询");
      } else if (error.message.includes("authentication failed")) {
        console.error("\n💡 建议：");
        console.error("1. 检查数据库密码是否正确");
        console.error("2. 在Supabase控制台重置密码");
        console.error("3. 更新.env.local中的密码");
      }
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
