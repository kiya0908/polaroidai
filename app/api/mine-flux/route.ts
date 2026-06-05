import { NextResponse, type NextRequest } from "next/server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

import { model } from "@/config/constants";
import { FluxHashids } from "@/db/dto/polaroid.dto";
import { prisma } from "@/db/prisma";
import { GENERATION_STATUS } from "@/lib/constants/generation";
import { getErrorMessage } from "@/lib/handle-error";

export const dynamic = "force-dynamic";

const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(10),
  sort: z.string().optional(),
  model: z.enum([model.dev, model.pro, model.schnell]).optional(),
});

function toLegacyTaskStatus(status: string) {
  if (status === GENERATION_STATUS.SUCCEEDED) return "succeeded";
  if (status === GENERATION_STATUS.FAILED) return "failed";
  return "processing";
}

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const values = searchParamsSchema.parse(
      Object.fromEntries(url.searchParams),
    );
    const { page, pageSize } = values;
    const offset = (page - 1) * pageSize;
    const where = {
      userId,
      taskStatus: {
        in: [
          GENERATION_STATUS.SUCCEEDED,
          GENERATION_STATUS.PENDING,
          GENERATION_STATUS.QUEUED,
          GENERATION_STATUS.GENERATING,
        ],
      },
    };

    const [records, total] = await Promise.all([
      prisma.polaroidai_PolaroidGeneration.findMany({
        where,
        take: pageSize,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.polaroidai_PolaroidGeneration.count({ where }),
    ]);

    return NextResponse.json({
      data: {
        total,
        page,
        pageSize,
        data: records.map((record) => ({
          ...record,
          imageUrl: record.outputImageUrl,
          inputPrompt: record.inputContent,
          aspectRatio: "1:1",
          model: record.providerName ?? "kie_ai",
          taskStatus: toLegacyTaskStatus(record.taskStatus),
          executeTime:
            record.executeEndTime && record.executeStartTime
              ? Number(record.executeEndTime - record.executeStartTime)
              : 0,
          id: FluxHashids.encode(record.id),
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 },
    );
  }
}