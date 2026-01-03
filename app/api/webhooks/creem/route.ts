import { Webhook } from "@creem_io/nextjs";

import { ChargeOrderHashids } from "@/db/dto/charge-order.dto";
import { prisma } from "@/db/prisma";
import { getUserCredit } from "@/db/queries/account";
import { OrderPhase } from "@/db/type";
import { env } from "@/env.mjs";
import { logsnag } from "@/lib/log-snag";
import { formatPrice } from "@/lib/utils";

export const POST = Webhook({
  webhookSecret: env.CREEM_WEBHOOK_SECRET || "temp_secret",
  onCheckoutCompleted: async ({ customer, product, metadata }) => {
    console.log("🎉 Creem checkout completed:", {
      customer: customer.email,
      product: product.name,
      metadata,
    });

    try {
      // 从 metadata 中获取订单信息
      const metaOrderId = metadata?.orderId as string;
      const userId = metadata?.userId as string;
      const metaChargeProductId = metadata?.chargeProductId as string;

      if (!metaOrderId || !userId || !metaChargeProductId) {
        console.error("❌ Missing required metadata:", metadata);
        throw new Error("Missing required metadata");
      }

      // 解码订单 ID
      const [orderId] = ChargeOrderHashids.decode(metaOrderId);
      if (!orderId) {
        console.error("❌ Invalid order ID:", metaOrderId);
        throw new Error("Invalid order ID");
      }

      // 查询订单和产品信息
      const order = await prisma.polaroidai_ChargeOrder.findUnique({
        where: { id: orderId as number },
      });

      if (!order) {
        console.error("❌ Order not found:", orderId);
        throw new Error("Order not found");
      }

      // 如果订单已经是Paid状态，说明已经处理过了（幂等性检查）
      if (order.phase === OrderPhase.Paid) {
        console.log("✅ Order already paid, skipping:", orderId);
        return; // 返回成功，避免Creem重复发送webhook
      }

      // 如果订单不是Pending状态，说明状态异常
      if (order.phase !== OrderPhase.Pending) {
        console.error("❌ Order not in pending state:", order);
        throw new Error("Order not in pending state");
      }

      // 获取用户积分信息
      const account = await getUserCredit(userId);

      // 使用事务更新订单状态和充值积分
      await prisma.$transaction(async (tx) => {
        const addCredit = order.credit;

        // 更新订单状态为已支付
        await tx.polaroidai_ChargeOrder.update({
          where: { id: order.id },
          data: {
            phase: OrderPhase.Paid,
            paymentAt: new Date(),
            result: {
              customer,
              product,
              metadata,
              completedAt: new Date(),
            } as any,
          },
        });

        // 充值积分
        await tx.polaroidai_UserCredit.update({
          where: { id: account.id },
          data: {
            credit: {
              increment: addCredit,
            },
          },
        });

        // 记录积分交易
        await tx.polaroidai_UserCreditTransaction.create({
          data: {
            userId: userId,
            credit: addCredit,
            balance: account.credit + addCredit,
            type: "Charge",
          },
        });
      });

      // 发送通知到 LogSnag
      const price = formatPrice(order.amount);
      await logsnag.track({
        channel: "payments",
        event: "Successful Payment (Creem)",
        user_id: userId,
        description: `用户购买积分：${order.credit}积分 - ${price}`,
        icon: "💰",
        tags: {
          provider: "creem",
          credit: order.credit.toString(),
          amount: price,
        },
      });

      console.log("✅ Creem payment processed successfully");
    } catch (error) {
      console.error("❌ Error processing Creem webhook:", error);
      // 抛出错误，让Creem知道处理失败，会重试webhook
      throw error;
    }
  },
});
