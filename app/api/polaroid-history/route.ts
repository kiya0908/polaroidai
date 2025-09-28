import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { PolaroidHashids } from "@/db/dto/polaroid.dto";
import { prisma } from "@/db/prisma";
import { 
  createAPIMiddleware, 
  BusinessError, 
  paginatedResponse,
  successResponse,
  RATE_LIMITS,
  COMMON_SCHEMAS 
} from "@/lib/api-middleware";

// 查询参数验证Schema
const HistoryQuerySchema = COMMON_SCHEMAS.pagination.extend({
  type: z.enum(['text', 'image', 'all']).default('all'),
  status: z.enum(['completed', 'processing', 'failed', 'all']).default('all'),
  sort: z.enum(['newest', 'oldest']).default('newest'),
});

export const GET = createAPIMiddleware(
  {
    requireAuth: true,
    requireOwner: true,
    rateLimit: RATE_LIMITS.history,
    validation: {
      query: HistoryQuerySchema,
    },
  },
  async (req, { userId, validatedData }) => {
    const {
      page,
      limit,
      type,
      status,
      sort,
    } = validatedData.query;

    // 构建查询条件
    const where: any = {
      userId,
    };

    if (type !== 'all') {
      where.input_type = type;
    }

    if (status !== 'all') {
      where.task_status = status;
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 排序条件
    const orderBy = {
      created_at: sort === 'newest' ? 'desc' : 'asc' as const,
    };

    // 查询历史记录
    const [records, total] = await Promise.all([
      prisma.polaroidai_PolaroidGeneration.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          input_type: true,
          input_content: true,
          input_image_url: true,
          output_image_url: true,
          thumbnail_url: true,
          style_type: true,
          task_status: true,
          is_private: true,
          credit_cost: true,
          processing_time: true,
          download_num: true,
          views_num: true,
          created_at: true,
          updated_at: true,
        },
      }),
      prisma.polaroidai_PolaroidGeneration.count({ where }),
    ]);

    // 处理返回数据
    const processedRecords = records.map(record => ({
      ...record,
      id: PolaroidHashids.encode(record.id),
      // 隐藏私有内容的详细信息（如果需要）
      input_content: record.is_private ? null : record.input_content,
    }));

    // 计算分页信息
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return successResponse({
      records: processedRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
      filters: {
        type,
        status,
        sort,
      },
    });
  }
);

// 删除历史记录
export const DELETE = createAPIMiddleware(
  {
    requireAuth: true,
    requireOwner: true,
    rateLimit: RATE_LIMITS.history,
    validation: {
      body: COMMON_SCHEMAS.ids,
    },
  },
  async (req, { userId, validatedData }) => {
    const { ids } = validatedData.body;

    // 解码ID
    const decodedIds = ids.map(id => {
      const decoded = PolaroidHashids.decode(id);
      return decoded.length > 0 ? decoded[0] : null;
    }).filter(Boolean);

    if (decodedIds.length === 0) {
      throw new BusinessError("No valid ids provided");
    }

    // 删除记录（只能删除自己的记录）
    const deleteResult = await prisma.polaroidai_PolaroidGeneration.deleteMany({
      where: {
        id: { in: decodedIds },
        userId, // 确保只能删除自己的记录
      },
    });

    return successResponse({
      deleted: deleteResult.count,
      message: `Successfully deleted ${deleteResult.count} records`,
    });
  }
);