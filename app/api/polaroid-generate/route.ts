import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { PolaroidHashids } from "@/db/dto/polaroid.dto";
import { prisma } from "@/db/prisma";
import { getUserCredit } from "@/db/queries/account";
import { BillingType } from "@/db/type";
import { generatePolaroidImage } from "@/lib/gemini";
import { 
  createAPIMiddleware, 
  BusinessError, 
  successResponse,
  RATE_LIMITS 
} from "@/lib/api-middleware";

export const maxDuration = 60;

// 宝丽来生成请求验证Schema
const CreatePolaroidSchema = z.object({
  input_type: z.enum(['text', 'image']),
  input_content: z.string().max(500).optional(), // 文字描述，最大500字符
  input_image_url: z.string().url().optional(),  // 输入图像URL
  style_type: z.string().default('classic_polaroid'), // 宝丽来风格类型
  is_private: z.boolean().default(false),         // 是否私有
  locale: z.string().default('en'),               // 语言环境
});

// 积分消费规则
const CREDIT_COSTS = {
  text: 5,   // 文字生成：5积分
  image: 8,  // 图片转换：8积分
};

export const POST = createAPIMiddleware(
  {
    requireAuth: true,
    requireOwner: true,
    rateLimit: RATE_LIMITS.generate,
    validation: {
      body: CreatePolaroidSchema,
    },
  },
  async (req, { userId, validatedData }) => {
    const {
      input_type,
      input_content,
      input_image_url,
      style_type,
      is_private,
      locale,
    } = validatedData.body;

    // 验证输入参数
    if (input_type === 'text' && !input_content) {
      throw new BusinessError("Text content is required for text generation");
    }
    if (input_type === 'image' && !input_image_url) {
      throw new BusinessError("Image URL is required for image conversion");
    }

    // 检查用户积分
    const account = await getUserCredit(userId);
    const needCredit = CREDIT_COSTS[input_type];
    
    if (!account.credit || account.credit < needCredit) {
      throw new BusinessError("Insufficient credit", "1000402");
    }

    // 创建宝丽来生成记录
    const polaroidGeneration = await prisma.polaroidai_PolaroidGeneration.create({
      data: {
        userId,
        input_type,
        input_content: input_content || null,
        input_image_url: input_image_url || null,
        style_type,
        task_status: 'processing',
        is_private,
        credit_cost: needCredit,
        locale,
        execute_start_time: Date.now(),
        retry_count: 0,
      },
    });

    try {
      // 调用Gemini API生成宝丽来图像
      const startTime = Date.now();
      const result = await generatePolaroidImage({
        type: input_type,
        content: input_content,
        imageUrl: input_image_url,
        style: style_type,
        locale,
      });

      const processingTime = Date.now() - startTime;

      // 更新生成记录
      const updatedGeneration = await prisma.polaroidai_PolaroidGeneration.update({
        where: { id: polaroidGeneration.id },
        data: {
          task_status: 'completed',
          output_image_url: result.outputImageUrl,
          thumbnail_url: result.thumbnailUrl,
          processing_time: processingTime,
          execute_end_time: Date.now(),
          gemini_request_id: result.requestId,
          gemini_response: JSON.stringify(result.response),
        },
      });

      // 扣除积分并创建交易记录
      await prisma.$transaction(async (tx) => {
        const newAccount = await tx.userCredit.update({
          where: { id: account.id },
          data: {
            credit: {
              decrement: needCredit,
            },
          },
        });

        const billing = await tx.userBilling.create({
          data: {
            userId,
            geminiId: updatedGeneration.id,
            state: "Done",
            amount: -needCredit,
            type: BillingType.Withdraw,
            description: `Polaroid ${input_type} generation - ${style_type}`,
          },
        });

        await tx.userCreditTransaction.create({
          data: {
            userId,
            credit: -needCredit,
            balance: newAccount.credit,
            billingId: billing.id,
            type: "Generate",
          },
        });
      });

      return successResponse({
        id: PolaroidHashids.encode(updatedGeneration.id),
        output_image_url: result.outputImageUrl,
        thumbnail_url: result.thumbnailUrl,
        processing_time: processingTime,
        credit_cost: needCredit,
        task_status: 'completed',
      });

    } catch (generationError) {
      // 生成失败，更新记录状态
      await prisma.polaroidai_PolaroidGeneration.update({
        where: { id: polaroidGeneration.id },
        data: {
          task_status: 'failed',
          error_msg: generationError.message,
          execute_end_time: Date.now(),
        },
      });

      console.error("Polaroid generation failed:", generationError);
      throw new BusinessError("Generation failed, please try again");
    }
  }
);