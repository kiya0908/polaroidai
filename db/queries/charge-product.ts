import { ChargeProductHashids } from "@/db/dto/charge-product.dto";
import { prisma } from "@/db/prisma";

import {
  OrderPhase,
  PaymentChannelType,
  type ChargeProductSelectDto,
} from "../type";

export async function getChargeProduct(locale?: string) {
  try {
    const data = await prisma.polaroidai_ChargeProduct.findMany({
      where: {
        locale,
      },
      orderBy: {
        credit: "asc",
      },
    });

    return {
      data: (data.map(({ id, ...rest }) => ({
        ...rest,
        id: ChargeProductHashids.encode(id),
      })) ?? []) as ChargeProductSelectDto[],
    };
  } catch (error) {
    console.warn('Failed to fetch charge products during build:', error);
    // 返回空数据，避免构建失败
    return {
      data: [] as ChargeProductSelectDto[],
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
    const claimedOrderIds = await prisma.claimedActivityOrder.findMany({
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
    const charOrders = await prisma.chargeOrder.findMany({
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
    console.warn('Failed to check claimed status during build:', error);
    return false;
  }
}
