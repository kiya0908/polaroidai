import { Webhook } from "@creem_io/nextjs";
import { Prisma } from "@prisma/client";

import { ChargeOrderHashids } from "@/db/dto/charge-order.dto";
import { prisma } from "@/db/prisma";
import { getUserCredit } from "@/db/queries/account";
import { OrderPhase } from "@/db/type";
import { env } from "@/env.mjs";
import { logsnag } from "@/lib/log-snag";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const POST = Webhook({
  webhookSecret: env.CREEM_WEBHOOK_SECRET ?? "",
  onCheckoutCompleted: async ({ customer, product, metadata }) => {
    try {
      const metaOrderId = metadata?.orderId as string | undefined;
      const metadataUserId = metadata?.userId as string | undefined;
      const metaChargeProductId = metadata?.chargeProductId as
        | string
        | undefined;
      const metadataCredit = metadata?.credit as string | number | undefined;

      if (!metaOrderId || !metadataUserId || !metaChargeProductId) {
        throw new Error("Missing required metadata");
      }

      const [decodedOrderId] = ChargeOrderHashids.decode(metaOrderId);
      if (!decodedOrderId) {
        throw new Error("Invalid order ID");
      }

      const orderId = decodedOrderId as number;
      const order = await prisma.polaroidai_ChargeOrder.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.userId !== metadataUserId) {
        throw new Error("Webhook user does not match order user");
      }

      if (
        typeof metadataCredit !== "undefined" &&
        Number(metadataCredit) !== order.credit
      ) {
        throw new Error("Webhook credit does not match order credit");
      }

      if (
        typeof product.price === "number" &&
        product.price !== order.amount
      ) {
        throw new Error("Webhook product price does not match order amount");
      }

      if (product.currency && product.currency !== order.currency) {
        throw new Error("Webhook product currency does not match order currency");
      }

      const account = await getUserCredit(order.userId);
      const completedAt = new Date();
      const result = JSON.parse(
        JSON.stringify({
          customer,
          product,
          metadata,
          completedAt: completedAt.toISOString(),
        }),
      ) as Prisma.InputJsonValue;

      const payment = await prisma.$transaction(async (tx) => {
        const paidOrder = await tx.polaroidai_ChargeOrder.updateMany({
          where: {
            id: order.id,
            phase: OrderPhase.Pending,
          },
          data: {
            phase: OrderPhase.Paid,
            paymentAt: completedAt,
            result,
          },
        });

        if (paidOrder.count === 0) {
          const currentOrder = await tx.polaroidai_ChargeOrder.findUnique({
            where: { id: order.id },
          });
          if (currentOrder?.phase === OrderPhase.Paid) {
            return { processed: false as const, order: currentOrder };
          }

          throw new Error("Order not in pending state");
        }

        const updatedAccount = await tx.polaroidai_UserCredit.update({
          where: { id: account.id },
          data: {
            credit: {
              increment: order.credit,
            },
          },
        });

        await tx.polaroidai_UserCreditTransaction.create({
          data: {
            userId: order.userId,
            credit: order.credit,
            balance: updatedAccount.credit,
            type: "Charge",
          },
        });

        return { processed: true as const, order };
      });

      if (!payment.processed) {
        console.log("Creem order already paid, skipping:", order.id);
        return;
      }

      const price = formatPrice(order.amount);
      await logsnag.track({
        channel: "payments",
        event: "Successful Payment (Creem)",
        user_id: order.userId,
        description: `User purchased credits: ${order.credit} credits - ${price}`,
        icon: "$",
        tags: {
          provider: "creem",
          credit: order.credit.toString(),
          amount: price,
        },
      });

      console.log("Creem payment processed successfully:", order.id);
    } catch (error) {
      console.error("Error processing Creem webhook:", error);
      throw error;
    }
  },
});
