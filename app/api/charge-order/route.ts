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
import { absoluteUrl } from "@/lib/utils";

const CreateChargeOrderSchema = z.object({
  currency: z.enum(["CNY", "USD"]).default("USD"),
  productId: z.string(),
  amount: z.number().min(100).max(1000000000),
  channel: z.enum(["GiftCode", "Stripe", "Creem"]).default("Stripe"),
  url: z.string().optional(),
  creemProductId: z.string().optional(), // Creem产品ID
});

// 完全移除限流功能，避免Redis依赖
export async function POST(req: NextRequest) {
  const { userId } = auth();

  const user = await currentUser();
  if (!userId || !user || !user.primaryEmailAddress) {
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

    let product;

    // 检查是否是fallback产品ID
    if (productId.startsWith("fallback_")) {
      // 处理fallback产品
      const fallbackProducts = {
        "fallback_en_1": { credit: 1000, locale: "en" },
        "fallback_en_2": { credit: 2500, locale: "en" },
        "fallback_en_3": { credit: 10000, locale: "en" },
        "fallback_zh_1": { credit: 1000, locale: "zh" },
        "fallback_zh_2": { credit: 2500, locale: "zh" },
        "fallback_zh_3": { credit: 10000, locale: "zh" },
      };

      product = fallbackProducts[productId as keyof typeof fallbackProducts];

      if (!product) {
        return NextResponse.json(
          { error: "Invalid fallback product" },
          { status: 404 },
        );
      }
    } else {
      // 处理数据库产品
      try {
        const [chargeProductId] = ChargeProductHashids.decode(productId);
        const dbProduct = await prisma.polaroidai_ChargeProduct.findFirst({
          where: {
            id: chargeProductId as number,
          },
        });

        if (!dbProduct) {
          return NextResponse.json(
            { error: "product not exists" },
            { status: 404 },
          );
        }

        product = { credit: dbProduct.credit, locale: dbProduct.locale };
      } catch (dbError) {
        console.warn("Database lookup failed, treating as fallback:", dbError);
        // 如果数据库查询失败，尝试从productId解析积分数量
        const creditMatch = productId.match(/(\d+)_/);
        if (creditMatch) {
          product = { credit: parseInt(creditMatch[1]), locale: "en" };
        } else {
          return NextResponse.json(
            { error: "product not exists" },
            { status: 404 },
          );
        }
      }
    }

    // 创建订单（无论哪个渠道都需要先创建订单记录）
    const order = await prisma.polaroidai_ChargeOrder.create({
      data: {
        userId: user.id,
        userInfo: {
          email: user.primaryEmailAddress.emailAddress,
          name: user.fullName || user.username || "",
        },
        amount,
        credit: product.credit,
        phase: OrderPhase.Pending,
        channel,
        currency,
      },
    });

    console.log('✅ 订单创建成功:', {
      orderId: order.id,
      credit: product.credit,
      amount,
      channel,
    });

    // 生成hashId格式的orderId
    const orderId = ChargeOrderHashids.encode(order.id);

    // Creem支付渠道特殊处理
    if (channel === "Creem" && creemProductId) {
      console.log('开始创建Creem checkout:', {
        creemProductId,
        userId: user.id,
        productId,
        productCredit: product.credit,
        orderId,
        userEmail: user.primaryEmailAddress.emailAddress
      });

      try {
        // 打印API Key信息（脱敏）
        const apiKey = env.CREEM_API_KEY;
        console.log('🔑 API Key信息:', {
          存在: !!apiKey,
          前缀: apiKey ? apiKey.substring(0, 15) + '...' : 'undefined',
          testMode: true
        });

        // 初始化Creem客户端
        const creem = createCreem({
          apiKey: env.CREEM_API_KEY,
          testMode: true, // 测试环境
        });

        console.log('Creem客户端初始化成功，开始创建checkout session...');
        console.log('📦 请求参数:', {
          productId: creemProductId,
          successUrl: `${url || `http://localhost:3000/app`}?success=true`,
          cancelUrl: `${url || `http://localhost:3000/app`}?success=false`,
          customerEmail: user.primaryEmailAddress.emailAddress,
          customerName: user.fullName || user.username || "",
        });

        // 创建Creem checkout session
        const creemCheckout = await creem.checkouts.create({
          productId: creemProductId,
          successUrl: `${url || `http://localhost:3000/app`}?success=true`,
          cancelUrl: `${url || `http://localhost:3000/app`}?success=false`,
          customer: {
            email: user.primaryEmailAddress.emailAddress,
            name: user.fullName || user.username || "",
          },
          metadata: {
            orderId,           // ✅ 真实的hashId
            userId: user.id,
            chargeProductId: productId,
            credit: product.credit.toString(),
          },
          referenceId: user.id,
        });

        console.log('✅ Creem checkout创建成功');
        console.log('📦 返回对象的键:', Object.keys(creemCheckout));
        console.log('📦 checkoutUrl字段:', creemCheckout.checkoutUrl);
        console.log('📦 url字段:', creemCheckout.url);

        // 根据Creem SDK类型定义，URL字段是 checkoutUrl（驼峰命名）
        const checkoutUrl = creemCheckout.checkoutUrl;

        if (!checkoutUrl) {
          console.error('❌ 无法从返回对象中获取checkout URL');
          console.error('❌ 返回对象:', JSON.stringify(creemCheckout, null, 2));
          throw new Error('Failed to get checkout URL from Creem response');
        }

        console.log('✅ 获取到checkout URL:', checkoutUrl);

        return NextResponse.json({
          orderId,
          url: checkoutUrl,
        });
      } catch (creemError) {
        console.error('❌ Creem checkout创建失败:', creemError);
        console.error('❌ 错误详情:', {
          message: creemError instanceof Error ? creemError.message : 'Unknown error',
          cause: creemError instanceof Error ? (creemError as any).cause : undefined,
          stack: creemError instanceof Error ? creemError.stack : undefined,
        });

        // 尝试获取更多错误信息
        if (creemError instanceof Error && 'response' in creemError) {
          console.error('❌ HTTP响应信息:', (creemError as any).response);
        }

        // 如果Creem checkout创建失败，删除已创建的订单
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
    console.error('Charge order error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 },
    );
  }
}