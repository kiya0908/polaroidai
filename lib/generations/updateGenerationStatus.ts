import { Prisma } from "@prisma/client";

import { prisma } from "@/db/prisma";
import {
  GENERATION_STATUS,
  PROVIDER_NAME,
  type GenerationStatus,
} from "@/lib/constants/generation";

type UpdateGenerationStatusParams = {
  generationId?: number;
  providerTaskId?: string;
  status: GenerationStatus;
  outputImageUrl?: string | null;
  processingTime?: number | null;
  errorMsg?: string | null;
  providerRaw?: unknown;
  metadata?: Record<string, unknown>;
};

function jsonObject(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

export async function updateGenerationStatus({
  generationId,
  providerTaskId,
  status,
  outputImageUrl,
  processingTime,
  errorMsg,
  providerRaw,
  metadata,
}: UpdateGenerationStatusParams) {
  if (!generationId && !providerTaskId) {
    throw new Error("generationId or providerTaskId is required");
  }

  const existing = await prisma.polaroidai_PolaroidGeneration.findFirst({
    where: generationId ? { id: generationId } : { providerTaskId },
    select: { id: true, metadata: true },
  });

  if (!existing) {
    throw new Error("Generation record was not found");
  }

  const nextMetadata = {
    ...jsonObject(existing.metadata),
    ...(metadata || {}),
    ...(providerRaw === undefined ? {} : { providerRaw }),
  };

  return prisma.polaroidai_PolaroidGeneration.update({
    where: { id: existing.id },
    data: {
      taskStatus: status,
      providerName: PROVIDER_NAME.KIE_AI,
      ...(providerTaskId ? { providerTaskId } : {}),
      ...(outputImageUrl !== undefined ? { outputImageUrl } : {}),
      ...(processingTime !== undefined ? { processingTime } : {}),
      ...(errorMsg !== undefined ? { errorMsg } : {}),
      ...(status === GENERATION_STATUS.SUCCEEDED ||
      status === GENERATION_STATUS.FAILED
        ? { executeEndTime: BigInt(Date.now()) }
        : {}),
      metadata: nextMetadata as Prisma.InputJsonValue,
    },
  });
}
