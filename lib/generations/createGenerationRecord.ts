import { Prisma } from "@prisma/client";

import { prisma } from "@/db/prisma";
import {
  GENERATION_INPUT_TYPE,
  GENERATION_STATUS,
  type GenerationInputType,
  type GenerationStatus,
  PROVIDER_NAME,
} from "@/lib/constants/generation";

type CreateGenerationRecordParams = {
  userId?: string | null;
  requestId: string;
  inputType?: GenerationInputType;
  inputContent?: string | null;
  creditCost: number;
  status?: GenerationStatus;
  locale?: string | null;
  metadata?: Record<string, unknown>;
};

export async function createGenerationRecord({
  userId,
  requestId,
  inputType = GENERATION_INPUT_TYPE.TEXT,
  inputContent,
  creditCost,
  status = GENERATION_STATUS.PENDING,
  locale,
  metadata,
}: CreateGenerationRecordParams) {
  return prisma.polaroidai_PolaroidGeneration.create({
    data: {
      userId: userId || null,
      requestId,
      inputType,
      inputContent,
      taskStatus: status,
      creditCost,
      providerName: PROVIDER_NAME.KIE_AI,
      locale: locale || null,
      executeStartTime: BigInt(Date.now()),
      metadata: (metadata || {}) as Prisma.InputJsonValue,
    },
  });
}
