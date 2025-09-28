import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { PolaroidHashids } from "@/db/dto/polaroid.dto";
import { prisma } from "@/db/prisma";
import { getErrorMessage } from "@/lib/handle-error";
import { Prisma } from "@prisma/client";

export const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(12),
  sort: z.string().optional(),
  type: z.enum(['text', 'image']).optional(),
  status: z.enum(['completed', 'processing', 'failed']).optional(),
});

// 根据ID获取宝丽来生成记录
export async function getPolaroidById(polaroidId: string) {
  const [id] = PolaroidHashids.decode(polaroidId);
  const polaroidData = await prisma.polaroidai_PolaroidGeneration.findUnique({
    where: { id: id as number },
  });
  if (!polaroidData) {
    return null;
  }
  return { ...polaroidData, id: polaroidId };
}

// 分页获取宝丽来生成记录
export async function getPolaroidDataByPage(params: {
  page: number;
  pageSize: number;
  type?: string;
  status?: string;
  userId?: string;
}) {
  try {
    const { page, pageSize, type, status, userId } = params;
    const offset = (page - 1) * pageSize;
    
    const whereConditions: Prisma.polaroidai_PolaroidGenerationWhereInput = {
      isPrivate: false,
      taskStatus: 'completed', // 只显示已完成的
    };

    // 如果指定了用户ID，则只显示该用户的记录
    if (userId) {
      whereConditions.userId = userId;
      // 用户自己的记录可以包含私有的
      delete whereConditions.isPrivate;
    }

    if (type) {
      whereConditions.inputType = type;
    }

    if (status) {
      whereConditions.taskStatus = status;
    }

    const [polaroidData, total] = await Promise.all([
      prisma.polaroidai_PolaroidGeneration.findMany({
        where: whereConditions,
        take: pageSize,
        skip: offset,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          inputType: true,
          inputContent: true,
          inputImageUrl: true,
          outputImageUrl: true,
          thumbnailUrl: true,
          styleType: true,
          taskStatus: true,
          isPrivate: true,
          creditCost: true,
          processingTime: true,
          downloadNum: true,
          viewsNum: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.polaroidai_PolaroidGeneration.count({ where: whereConditions }),
    ]);

    return {
      data: {
        total,
        page,
        pageSize,
        data: polaroidData.map(({ id, processingTime, ...rest }) => ({
          ...rest,
          processingTime: processingTime || 0,
          id: PolaroidHashids.encode(id),
        })),
      },
    };
  } catch (error) {
    return {
      data: {
        total: 0,
        page: 0,
        pageSize: 0,
        data: [],
      },
      error: getErrorMessage(error),
    };
  }
}

// 获取用户的宝丽来生成统计
export async function getUserPolaroidStats(userId: string) {
  try {
    const [totalCount, completedCount, processingCount, failedCount] = await Promise.all([
      prisma.polaroidai_PolaroidGeneration.count({
        where: { userId },
      }),
      prisma.polaroidai_PolaroidGeneration.count({
        where: { userId, taskStatus: 'completed' },
      }),
      prisma.polaroidai_PolaroidGeneration.count({
        where: { userId, taskStatus: 'processing' },
      }),
      prisma.polaroidai_PolaroidGeneration.count({
        where: { userId, taskStatus: 'failed' },
      }),
    ]);

    return {
      total: totalCount,
      completed: completedCount,
      processing: processingCount,
      failed: failedCount,
    };
  } catch (error) {
    console.error('Error getting user polaroid stats:', error);
    return {
      total: 0,
      completed: 0,
      processing: 0,
      failed: 0,
    };
  }
}

// 增加下载次数
export async function incrementDownloadCount(polaroidId: string, userId: string) {
  try {
    const [id] = PolaroidHashids.decode(polaroidId);
    
    // 更新下载次数
    await prisma.polaroidai_PolaroidGeneration.update({
      where: { id: id as number },
      data: {
        downloadNum: {
          increment: 1,
        },
      },
    });

    // 记录下载记录
    await prisma.polaroidai_PolaroidDownloads.create({
      data: {
        polaroidId: id as number,
        userId,
        downloadType: 'original',
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error incrementing download count:', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

// 增加查看次数
export async function incrementViewCount(polaroidId: string, userId: string, viewDuration?: number) {
  try {
    const [id] = PolaroidHashids.decode(polaroidId);
    
    // 更新查看次数
    await prisma.polaroidai_PolaroidGeneration.update({
      where: { id: id as number },
      data: {
        viewsNum: {
          increment: 1,
        },
      },
    });

    // 记录查看记录
    await prisma.polaroidai_PolaroidViews.create({
      data: {
        polaroidId: id as number,
        userId,
        viewDuration,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return { success: false, error: getErrorMessage(error) };
  }
}