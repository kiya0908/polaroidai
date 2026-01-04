import { ChargeProductHashids } from "@/db/dto/charge-product.dto";
import { prisma } from "@/db/prisma";

import {
  OrderPhase,
  PaymentChannelType,
  type ChargeProductSelectDto,
} from "../type";

// Fallback静态数据
function getFallbackProducts(locale: string = "en") {
  const isZhLocale = locale === "zh" || locale.startsWith("zh-");

  if (isZhLocale) {
    return [
      {
        amount: 990,
        originalAmount: 0,
        credit: 1000,
        currency: "USD",
        locale: "zh",
        title: "入门套餐",
        message: "适合尝鲜使用,1000积分,一次性付款,无订阅",
        state: "active",
        tag: ["推荐新手"],
        id: "fallback_zh_1",
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
        tag: ["最受欢迎", "限时优惠"],
        id: "fallback_zh_2",
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
        tag: ["专业之选", "最大优惠"],
        id: "fallback_zh_3",
        creemProductId: "prod_O2wLG60Wu0otsJyWUokdH",
        isPopular: false,
        sortOrder: 3,
      }
    ];
  } else {
    return [
      {
        amount: 990,
        originalAmount: 0,
        credit: 1000,
        currency: "USD",
        locale: "en",
        title: "Starter Pack",
        message: "Perfect for trying out,1000 credits,One-time payment,No subscription",
        state: "active",
        tag: ["Recommended for beginners"],
        id: "fallback_en_1",
        creemProductId: "prod_7lvdtQGtIcLEZu2rTBppgN",
        isPopular: false,
        sortOrder: 1,
      },
      {
        amount: 1990,
        originalAmount: 2490,
        credit: 2500,
        currency: "USD",
        locale: "en",
        title: "Popular Pack",
        message: "Best value for regular users,2500 credits,Save 20%,One-time payment",
        state: "active",
        tag: ["Most Popular", "Limited Time Offer"],
        id: "fallback_en_2",
        creemProductId: "prod_66bghBzS1egNxmz4vp7TwW",
        isPopular: true,
        sortOrder: 2,
      },
      {
        amount: 9900,
        originalAmount: 0,
        credit: 10000,
        currency: "USD",
        locale: "en",
        title: "Pro Pack",
        message: "For power users,10000 credits,Maximum value,One-time payment",
        state: "active",
        tag: ["Professional Choice", "Best Value"],
        id: "fallback_en_3",
        creemProductId: "prod_O2wLG60Wu0otsJyWUokdH",
        isPopular: false,
        sortOrder: 3,
      }
    ];
  }
}

export async function getChargeProduct(locale?: string) {
  try {
    // 先尝试查询指定locale的产品
    let data = await prisma.polaroidai_ChargeProduct.findMany({
      where: {
        locale,
        state: "active", // 只查询激活状态的产品
      },
      orderBy: {
        credit: "asc",
      },
    });

    // 如果没有找到指定locale的产品，尝试查询所有激活的产品
    if (data.length === 0) {
      console.log(`No products found for locale: ${locale}, fetching all active products`);
      data = await prisma.polaroidai_ChargeProduct.findMany({
        where: {
          state: "active",
        },
        orderBy: {
          credit: "asc",
        },
      });
    }

    // 如果数据库中没有任何产品数据，使用fallback
    if (data.length === 0) {
      console.log(`No products found in database, using fallback data for locale: ${locale}`);
      const fallbackProducts = getFallbackProducts(locale);
      return {
        data: fallbackProducts.map(product => ({
          ...product,
          // 确保tag字段格式正确
          tag: product.tag ? JSON.stringify(product.tag) : null,
        })) as ChargeProductSelectDto[],
      };
    }

    return {
      data: (data.map(({ id, ...rest }) => ({
        ...rest,
        id: ChargeProductHashids.encode(id),
      })) ?? []) as ChargeProductSelectDto[],
    };
  } catch (error) {
    console.error('Failed to fetch charge products from database, using fallback data:', error);
    console.log('🔄 Database connection failed, using static fallback data for pricing page');

    // 返回fallback静态数据
    const fallbackProducts = getFallbackProducts(locale);

    return {
      data: fallbackProducts.map(product => ({
        ...product,
        // 确保tag字段格式正确
        tag: product.tag ? JSON.stringify(product.tag) : null,
      })) as ChargeProductSelectDto[],
    };
  }
}
const activityCode = "NEW_REGISTER_ACTIVITY";

export async function getClaimed(userId: string) {
  try {
    const targetDate = new Date("2024-08-20T20:20:00+08:00");
    const oneMonthLater = new Date(
      targetDate.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    // Step 1: Get the IDs of claimed orders for the user
    const claimedOrderIds = await prisma.polaroidai_ClaimedActivityOrder.findMany({
      where: {
        activityCode,
        userId,
      },
      select: {
        id: true,
        chargeOrderId: true,
      },
    });
    const claimedChargeOrderIdIds = claimedOrderIds.map((row) => row.chargeOrderId);
    const charOrders = await prisma.polaroidai_ChargeOrder.findMany({
      where: {
        phase: OrderPhase.Paid,
        userId,
        channel: PaymentChannelType.Stripe,
        paymentAt: {
          gte: targetDate,
          lte: oneMonthLater,
        },
        id: {
          notIn: claimedChargeOrderIdIds,
        },
      },
    });
    return charOrders.length > 0;
  } catch (error) {
    console.warn('Failed to check claimed status during build, using fallback false:', error);
    // 在数据库连接失败时，返回false表示用户没有可领取的活动
    return false;
  }
}
