export const dynamic = "force-dynamic";

import { z } from "zod";

import { PolaroidHashids } from "@/db/dto/polaroid.dto";
import { prisma } from "@/db/prisma";
import {
  BusinessError,
  COMMON_SCHEMAS,
  RATE_LIMITS,
  createAPIMiddleware,
  successResponse,
} from "@/lib/api-middleware";

const HistoryQuerySchema = COMMON_SCHEMAS.pagination.extend({
  type: z.enum(["text", "image", "all"]).default("all"),
  status: z.enum(["completed", "processing", "failed", "all"]).default("all"),
  sort: z.enum(["newest", "oldest"]).default("newest"),
});

function toDbStatus(status: "completed" | "processing" | "failed" | "all") {
  if (status === "completed") return "succeeded";
  if (status === "processing") {
    return { in: ["pending", "queued", "generating", "processing"] };
  }
  if (status === "failed") return "failed";
  return undefined;
}

function toClientStatus(status: string) {
  if (status === "succeeded") return "completed";
  if (status === "failed") return "failed";
  return "processing";
}

export const GET = createAPIMiddleware(
  {
    requireAuth: true,
    requireOwner: true,
    rateLimit: RATE_LIMITS.history,
    validation: {
      query: HistoryQuerySchema,
    },
  },
  async (_req, { userId, validatedData }) => {
    const { page, limit, type, status, sort } = validatedData.query;
    const where: any = { userId };

    if (type !== "all") {
      where.inputType = type;
    }

    const dbStatus = toDbStatus(status);
    if (dbStatus) {
      where.taskStatus = dbStatus;
    }

    const skip = (page - 1) * limit;
    const orderBy = {
      createdAt: sort === "newest" ? ("desc" as const) : ("asc" as const),
    };

    const [records, total] = await Promise.all([
      prisma.polaroidai_PolaroidGeneration.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
      prisma.polaroidai_PolaroidGeneration.count({ where }),
    ]);

    const processedRecords = records.map((record) => ({
      id: PolaroidHashids.encode(record.id),
      input_type: record.inputType,
      input_content: record.isPrivate ? null : record.inputContent,
      input_image_url: record.inputImageUrl,
      output_image_url: record.outputImageUrl,
      thumbnail_url: record.thumbnailUrl,
      style_type: record.styleType,
      task_status: toClientStatus(record.taskStatus),
      is_private: record.isPrivate,
      credit_cost: record.creditCost,
      processing_time: record.processingTime,
      download_num: record.downloadNum,
      views_num: record.viewsNum,
      created_at: record.createdAt.toISOString(),
      updated_at: record.updatedAt.toISOString(),
    }));

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      records: processedRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        type,
        status,
        sort,
      },
    });
  },
);

export const DELETE = createAPIMiddleware(
  {
    requireAuth: true,
    requireOwner: true,
    rateLimit: RATE_LIMITS.history,
    validation: {
      body: COMMON_SCHEMAS.ids,
    },
  },
  async (_req, { userId, validatedData }) => {
    const { ids } = validatedData.body;
    const decodedIds = ids
      .map((id) => {
        const decoded = PolaroidHashids.decode(id);
        return decoded.length > 0 ? Number(decoded[0]) : null;
      })
      .filter((id): id is number => Boolean(id));

    if (decodedIds.length === 0) {
      throw new BusinessError("No valid ids provided");
    }

    const deleteResult = await prisma.polaroidai_PolaroidGeneration.deleteMany({
      where: {
        id: { in: decodedIds },
        userId,
      },
    });

    return successResponse({
      deleted: deleteResult.count,
      message: `Successfully deleted ${deleteResult.count} records`,
    });
  },
);
