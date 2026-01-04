import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("开始插入充值产品数据...");

  // 检查是否已存在产品
  const existingProducts = await prisma.polaroidai_ChargeProduct.findMany();

  if (existingProducts.length > 0) {
    console.log(`已存在 ${existingProducts.length} 个产品，跳过插入`);
    console.log("现有产品：");
    existingProducts.forEach((p) => {
      console.log(`  - ${p.title}: ${p.credit}积分 - $${p.amount / 100}`);
    });
    return;
  }

  // 插入英文产品
  const enProducts = [
    {
      amount: 990, // $9.90
      originalAmount: 0,
      credit: 1000,
      currency: "USD",
      locale: "en",
      title: "Starter Pack",
      message: "Perfect for trying out,1000 credits,One-time payment,No subscription",
      state: "active",
      creemProductId: "prod_7lvdtQGtIcLEZu2rTBppgN",
      isPopular: false,
      sortOrder: 1,
    },
    {
      amount: 1990, // $19.90
      originalAmount: 2490,
      credit: 2500,
      currency: "USD",
      locale: "en",
      title: "Popular Pack",
      message: "Best value for regular users,2500 credits,Save 20%,One-time payment",
      state: "active",
      creemProductId: "prod_66bghBzS1egNxmz4vp7TwW",
      isPopular: true,
      sortOrder: 2,
    },
    {
      amount: 9900, // $99.00
      originalAmount: 0,
      credit: 10000,
      currency: "USD",
      locale: "en",
      title: "Pro Pack",
      message: "For power users,10000 credits,Maximum value,One-time payment",
      state: "active",
      creemProductId: "prod_O2wLG60Wu0otsJyWUokdH",
      isPopular: false,
      sortOrder: 3,
    },
  ];

  // 插入中文产品
  const zhProducts = [
    {
      amount: 990,
      originalAmount: 0,
      credit: 1000,
      currency: "USD",
      locale: "zh",
      title: "入门套餐",
      message: "适合尝鲜使用,1000积分,一次性付款,无订阅",
      state: "active",
      creemProductId: "prod_7lvdtQGtIcLEZu2rTBppgN",
      isPopular: false,
      sortOrder: 1,
    },
    {
      amount: 1990,
      originalAmount: 2490,
      credit: 2500,
      currency: "USD",
      locale: "zh",
      title: "热门套餐",
      message: "最超值选择,2500积分,节省20%,一次性付款",
      state: "active",
      creemProductId: "prod_66bghBzS1egNxmz4vp7TwW",
      isPopular: true,
      sortOrder: 2,
    },
    {
      amount: 9900,
      originalAmount: 0,
      credit: 10000,
      currency: "USD",
      locale: "zh",
      title: "专业套餐",
      message: "适合重度用户,10000积分,最大价值,一次性付款",
      state: "active",
      creemProductId: "prod_O2wLG60Wu0otsJyWUokdH",
      isPopular: false,
      sortOrder: 3,
    },
  ];

  const allProducts = [...enProducts, ...zhProducts];

  for (const product of allProducts) {
    const created = await prisma.polaroidai_ChargeProduct.create({
      data: product,
    });
    console.log(`✅ 创建产品: ${created.title} (${created.locale})`);
  }

  console.log("\n✅ 所有产品创建完成！");
  console.log(`总共创建了 ${allProducts.length} 个产品`);
}

main()
  .catch((e) => {
    console.error("❌ 错误:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
