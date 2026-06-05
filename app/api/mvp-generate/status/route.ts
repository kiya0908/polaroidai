import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";

import { prisma } from "@/db/prisma";
import { getKieImageTaskStatus } from "@/lib/ai/providers/kie";
import { GENERATION_STATUS, PROVIDER_NAME } from "@/lib/constants/generation";
import { refundGenerationCredits } from "@/lib/credits/refundGenerationCredits";
import {
  getGenerationLockOwner,
  releaseGenerationLock,
} from "@/lib/generations/idempotency";
import { updateGenerationStatus } from "@/lib/generations/updateGenerationStatus";
import {
  applyMvpCookies,
  getClientIp,
  getMvpIdentity,
  getTaskStartedAt,
  logMvpEvent,
  markTaskTerminal,
  recordSuccessCount,
  releaseGeneratingLock,
} from "@/lib/mvp-events";

export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  taskId: z.string().trim().min(1).max(120),
});

function jsonResponse(
  req: NextRequest,
  body: Record<string, unknown>,
  init?: ResponseInit,
) {
  const response = NextResponse.json(body, init);
  applyMvpCookies(response, getMvpIdentity(req));
  return response;
}

function jsonError(req: NextRequest, message: string, status = 400) {
  return jsonResponse(
    req,
    { success: false, error: { message } },
    { status },
  );
}

function metadataObject(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function getLockOwner(
  req: NextRequest,
  generation: { userId: string | null; metadata: unknown } | null,
) {
  if (generation?.userId) {
    return getGenerationLockOwner({
      userId: generation.userId,
      anonymousId: getMvpIdentity(req).anonymousId,
    });
  }

  const anonymousId =
    metadataObject(generation?.metadata).anonymousId || getMvpIdentity(req).anonymousId;

  return getGenerationLockOwner({
    anonymousId: String(anonymousId),
  });
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const { taskId } = QuerySchema.parse(
      Object.fromEntries(new URL(req.url).searchParams),
    );
    const providerStatus = await getKieImageTaskStatus(taskId);
    const generation = await prisma.polaroidai_PolaroidGeneration.findUnique({
      where: { providerTaskId: taskId },
    });
    const lockOwner = getLockOwner(req, generation);
    const startedAt = await getTaskStartedAt(taskId);
    const durationMs = startedAt ? Date.now() - startedAt : undefined;

    if (providerStatus.status === GENERATION_STATUS.SUCCEEDED) {
      if (generation && generation.taskStatus !== GENERATION_STATUS.SUCCEEDED) {
        await updateGenerationStatus({
          generationId: generation.id,
          status: GENERATION_STATUS.SUCCEEDED,
          outputImageUrl: providerStatus.imageUrls[0],
          processingTime: durationMs,
          providerRaw: providerStatus.raw,
          metadata: { imageCount: providerStatus.imageUrls.length },
        }).catch((error) => {
          console.error("Failed to update succeeded generation:", error);
        });
      }

      if (await markTaskTerminal(taskId, GENERATION_STATUS.SUCCEEDED)) {
        await recordSuccessCount(ip);
        await releaseGenerationLock(lockOwner);
        await releaseGeneratingLock(ip);
        await logMvpEvent(req, "generate_success", {
          taskId,
          provider: PROVIDER_NAME.KIE_AI,
          durationMs,
          metadata: { imageCount: providerStatus.imageUrls.length },
        });
      }

      return jsonResponse(req, {
        success: true,
        data: {
          taskId,
          status: GENERATION_STATUS.SUCCEEDED,
          imageUrls: providerStatus.imageUrls,
          outputImageUrl: providerStatus.imageUrls[0],
          durationMs,
        },
      });
    }

    if (providerStatus.status === GENERATION_STATUS.FAILED) {
      let refundResult:
        | Awaited<ReturnType<typeof refundGenerationCredits>>
        | undefined;

      if (generation && generation.taskStatus !== GENERATION_STATUS.FAILED) {
        await updateGenerationStatus({
          generationId: generation.id,
          status: GENERATION_STATUS.FAILED,
          processingTime: durationMs,
          errorMsg: providerStatus.errorMessage,
          providerRaw: providerStatus.raw,
        }).catch((error) => {
          console.error("Failed to update failed generation:", error);
        });
      }

      if (generation?.userId) {
        refundResult = await refundGenerationCredits({
          generationId: generation.id,
          reason: providerStatus.errorMessage || "KIE generation failed",
        }).catch((error) => {
          console.error("Failed to refund generation credits:", error);
          return undefined;
        });
      }

      if (await markTaskTerminal(taskId, GENERATION_STATUS.FAILED)) {
        await releaseGenerationLock(lockOwner);
        await releaseGeneratingLock(ip);
        await logMvpEvent(req, "generate_failed", {
          taskId,
          provider: PROVIDER_NAME.KIE_AI,
          durationMs,
          metadata: { message: providerStatus.errorMessage },
        });
      }

      return jsonResponse(req, {
        success: true,
        data: {
          taskId,
          status: GENERATION_STATUS.FAILED,
          errorMessage: providerStatus.errorMessage,
          durationMs,
          refunded: refundResult?.refunded || false,
        },
      });
    }

    if (generation && generation.taskStatus !== providerStatus.status) {
      await updateGenerationStatus({
        generationId: generation.id,
        status: providerStatus.status,
        providerRaw: providerStatus.raw,
      }).catch((error) => {
        console.error("Failed to update in-progress generation:", error);
      });
    }

    return jsonResponse(req, {
      success: true,
      data: {
        taskId,
        status: providerStatus.status,
        durationMs,
      },
    });
  } catch (error) {
    const taskId = new URL(req.url).searchParams.get("taskId") || undefined;
    const message =
      error instanceof Error ? error.message : "Failed to query generation";

    if (taskId && (await markTaskTerminal(taskId, "query_failed"))) {
      const generation = await prisma.polaroidai_PolaroidGeneration.findUnique({
        where: { providerTaskId: taskId },
      }).catch(() => null);
      if (generation) {
        await releaseGenerationLock(getLockOwner(req, generation));
      }
      await releaseGeneratingLock(ip);
      await logMvpEvent(req, "generate_failed", {
        taskId,
        provider: PROVIDER_NAME.KIE_AI,
        metadata: { message },
      });
    }

    return jsonError(req, message, 400);
  }
}
