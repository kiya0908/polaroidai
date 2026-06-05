import { NextResponse, type NextRequest } from "next/server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { createCreem } from "creem_io";
import { z } from "zod";

import { ChargeOrderHashids } from "@/db/dto/charge-order.dto";
import { ChargeProductHashids } from "@/db/dto/charge-product.dto";
import { prisma } from "@/db/prisma";
import { OrderPhase } from "@/db/type";
import { env } from "@/env.mjs";
import { getErrorMessage } from "@/lib/handle-error";

export const dynamic = "force-dynamic";

const CreateChargeOrderSchema = z.object({
  currency: z.enum(["CNY", "USD"]).default("USD"),
  productId: z.string(),
  amount: z.number().min(100).max(1000000000),
  channel: z.enum(["GiftCode", "Stripe", "Creem"]).default("Stripe"),
  url: z.string().optional(),
  creemProductId: z.string().optional(),
});

type ChargeProductForCheckout = {
  amount: number;
  credit: number;
  currency: "USD" | "CNY";
  locale: string;
  creemProductId: string | null;
};

const fallbackProducts = {
  fallback_en_1: {
    amount: 990,
    credit: 1000,
    currency: "USD",
    locale: "en",
    creemProductId: "prod_7lvdtQGtIcLEZu2rTBppgN",
  },
  fallback_en_2: {
    amount: 1990,
    credit: 2500,
    currency: "USD",
    locale: "en",
    creemProductId: "prod_66bghBzS1egNxmz4vp7TwW",
  },
  fallback_en_3: {
    amount: 9900,
    credit: 10000,
    currency: "USD",
    locale: "en",
    creemProductId: "prod_O2wLG60Wu0otsJyWUokdH",
  },
  fallback_zh_1: {
    amount: 990,
    credit: 1000,
    currency: "USD",
    locale: "zh",
    creemProductId: "prod_7lvdtQGtIcLEZu2rTBppgN",
  },
  fallback_zh_2: {
    amount: 1990,
    credit: 2500,
    currency: "USD",
    locale: "zh",
    creemProductId: "prod_66bghBzS1egNxmz4vp7TwW",
  },
  fallback_zh_3: {
    amount: 9900,
    credit: 10000,
    currency: "USD",
    locale: "zh",
    creemProductId: "prod_O2wLG60Wu0otsJyWUokdH",
  },
} satisfies Record<string, ChargeProductForCheckout>;

async function getProductForCheckout(productId: string) {
  if (productId.startsWith("fallback_")) {
    return fallbackProducts[productId as keyof typeof fallbackProducts];
  }

  const [chargeProductId] = ChargeProductHashids.decode(productId);
  if (!chargeProductId) return null;

  const dbProduct = await prisma.polaroidai_ChargeProduct.findFirst({
    where: {
      id: chargeProductId as number,
      state: "active",
    },
  });
  if (!dbProduct) return null;

  return {
    amount: dbProduct.amount,
    credit: dbProduct.credit,
    currency: dbProduct.currency as "USD" | "CNY",
    locale: dbProduct.locale,
    creemProductId: dbProduct.creemProductId,
  } satisfies ChargeProductForCheckout;
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await currentUser();
  if (!user || !user.primaryEmailAddress) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { currency, amount, channel, productId, url, creemProductId } =
      CreateChargeOrderSchema.parse(data);
    if (channel !== "Stripe" && channel !== "Creem") {
      return NextResponse.json(
        { error: "Not Support Channel" },
        { status: 400 },
      );
    }

    const product = await getProductForCheckout(productId);
    if (!product) {
      return NextResponse.json({ error: "product not exists" }, { status: 404 });
    }

    if (amount !== product.amount || currency !== product.currency) {
      return NextResponse.json(
        { error: "Product price mismatch" },
        { status: 400 },
      );
    }

    if (creemProductId && creemProductId !== product.creemProductId) {
      return NextResponse.json(
        { error: "Creem product mismatch" },
        { status: 400 },
      );
    }

    const order = await prisma.polaroidai_ChargeOrder.create({
      data: {
        userId: user.id,
        userInfo: {
          email: user.primaryEmailAddress.emailAddress,
        },
        amount: product.amount,
        credit: product.credit,
        phase: OrderPhase.Pending,
        channel,
        currency: product.currency,
      },
    });

    console.log("Charge order created:", {
      orderId: order.id,
      credit: product.credit,
      amount: product.amount,
      channel,
    });

    const orderId = ChargeOrderHashids.encode(order.id);

    if (channel === "Creem") {
      if (!product.creemProductId) {
        await prisma.polaroidai_ChargeOrder.delete({
          where: { id: order.id },
        });
        return NextResponse.json(
          { error: "Creem product is not configured" },
          { status: 400 },
        );
      }

      try {
        const creem = createCreem({
          apiKey: env.CREEM_API_KEY,
          testMode: true,
        });

        const successUrl = `${url || "http://localhost:3000/app"}?success=true`;
        const creemCheckout = await creem.checkouts.create({
          productId: product.creemProductId,
          requestId: orderId,
          successUrl,
          customer: {
            email: user.primaryEmailAddress.emailAddress,
          },
          metadata: {
            orderId,
            userId: user.id,
            chargeProductId: productId,
            credit: product.credit.toString(),
          },
        });

        const checkoutUrl = creemCheckout.checkoutUrl;
        if (!checkoutUrl) {
          throw new Error("Failed to get checkout URL from Creem response");
        }

        return NextResponse.json({
          orderId,
          url: checkoutUrl,
        });
      } catch (creemError) {
        await prisma.polaroidai_ChargeOrder.delete({
          where: { id: order.id },
        });
        throw creemError;
      }
    }

    return NextResponse.json({
      orderId,
    });
  } catch (error) {
    console.error("Charge order error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 },
    );
  }
}
