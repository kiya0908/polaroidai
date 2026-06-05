import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { consumeAnonymousGenerationAllowance } from "@/lib/anonymous/allowance";
import {
  buildPolaroidPrompt,
  createKieImageTask,
} from "@/lib/ai/providers/kie";
import {
  GENERATION_CREDIT_COST,
  GENERATION_INPUT_TYPE,
  GENERATION_STATUS,
  PROVIDER_NAME,
} from "@/lib/constants/generation";
import { checkGenerationAllowance } from "@/lib/credits/checkGenerationAllowance";
import {
  consumeGenerationCredits,
  InsufficientCreditsError,
} from "@/lib/credits/consumeGenerationCredits";
import { refundGenerationCredits } from "@/lib/credits/refundGenerationCredits";
import { createGenerationRecord } from "@/lib/generations/createGenerationRecord";
import {
  acquireGenerationLock,
  findGenerationByRequestId,
  getGenerationLockOwner,
  normalizeRequestId,
  releaseGenerationLock,
} from "@/lib/generations/idempotency";
import { updateGenerationStatus } from "@/lib/generations/updateGenerationStatus";
import {
  applyMvpCookies,
  getClientIp,
  getMvpIdentity,
  logMvpEvent,
  recordAttemptCount,
  setTaskStartedAt,
} from "@/lib/mvp-events";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8 * 1024;

const StartSchema = z.object({
  type: z.enum(["text", "multiImage", "multi"]).default("text"),
  content: z.string().trim().min(1).max(500),
  requestId: z.string().trim().min(1).max(160).optional(),
  locale: z.string().trim().max(64).optional(),
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

function getOptionalUserId() {
  try {
    return auth().userId;
  } catch {
    return null;
  }
}

async function readBody(req: NextRequest) {
  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    throw new Error("REQUEST_BODY_TOO_LARGE");
  }

  return StartSchema.parse(JSON.parse(raw));
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const ip = getClientIp(req);
  const identity = getMvpIdentity(req);
  const userId = getOptionalUserId();
  let lockOwner: string | null = null;
  let locked = false;
  let generationId: number | null = null;
  let creditsDebited = false;

  try {
    const input = await readBody(req);
    const requestId = normalizeRequestId(input.requestId);

    await recordAttemptCount(ip);
    await logMvpEvent(req, "generate_click", {
      provider: PROVIDER_NAME.KIE_AI,
      metadata: { type: input.type, requestId, signedIn: Boolean(userId) },
    });

    if (input.type !== "text") {
      return jsonError(req, "Image composition is coming soon.", 400);
    }

    const existing = await findGenerationByRequestId(requestId);
    if (existing) {
      const metadata = existing.metadata as Record<string, unknown> | null;
      const sameOwner = userId
        ? existing.userId === userId
        : !existing.userId && metadata?.anonymousId === identity.anonymousId;

      if (!sameOwner) {
        return jsonError(req, "Request id already exists", 409);
      }

      if (!existing.providerTaskId) {
        return jsonError(req, "Generation is already starting", 409);
      }

      return jsonResponse(req, {
        success: true,
        data: {
          generationId: existing.id,
          requestId,
          taskId: existing.providerTaskId,
          status: existing.taskStatus,
          outputImageUrl: existing.outputImageUrl,
        },
      });
    }

    lockOwner = getGenerationLockOwner({
      userId,
      anonymousId: identity.anonymousId,
    });
    locked = await acquireGenerationLock(lockOwner);
    if (!locked) {
      return jsonError(req, "Generation already in progress", 409);
    }

    const allowance = await checkGenerationAllowance({
      userId,
      anonymousId: identity.anonymousId,
    });

    if (!allowance.allowed) {
      await releaseGenerationLock(lockOwner);
      locked = false;

      return jsonResponse(
        req,
        {
          success: false,
          error: {
            message:
              allowance.mode === "user"
                ? "Insufficient credits"
                : "Please sign in or upgrade to continue generating.",
            code:
              allowance.mode === "user"
                ? "INSUFFICIENT_CREDITS"
                : "ANONYMOUS_LIMIT_REACHED",
          },
          data:
            allowance.mode === "user"
              ? { creditsBalance: allowance.balance, cost: allowance.cost }
              : {
                  remainingFreeGenerations: allowance.remaining,
                  freeGenerationLimit: allowance.limit,
                },
        },
        { status: allowance.mode === "user" ? 402 : 429 },
      );
    }

    let anonymousAllowance:
      | Awaited<ReturnType<typeof consumeAnonymousGenerationAllowance>>
      | undefined;
    if (!userId) {
      anonymousAllowance = await consumeAnonymousGenerationAllowance(
        identity.anonymousId,
      );
      if (!anonymousAllowance.allowed) {
        await releaseGenerationLock(lockOwner);
        locked = false;
        return jsonResponse(
          req,
          {
            success: false,
            error: {
              message: "Please sign in or upgrade to continue generating.",
              code: "ANONYMOUS_LIMIT_REACHED",
            },
            data: {
              remainingFreeGenerations: anonymousAllowance.remaining,
              freeGenerationLimit: anonymousAllowance.limit,
            },
          },
          { status: 429 },
        );
      }
    }

    const generation = await createGenerationRecord({
      userId,
      requestId,
      inputType: GENERATION_INPUT_TYPE.TEXT,
      inputContent: input.content,
      creditCost: userId ? GENERATION_CREDIT_COST : 0,
      locale: input.locale,
      metadata: {
        anonymousId: identity.anonymousId,
        sessionId: identity.sessionId,
        owner: userId ? "user" : "anonymous",
      },
    });
    generationId = generation.id;

    let creditsBalance: number | undefined;
    if (userId) {
      const debit = await consumeGenerationCredits({
        userId,
        generationId,
        cost: GENERATION_CREDIT_COST,
      });
      creditsDebited = true;
      creditsBalance = debit.account.credit;
    }

    const { taskId } = await createKieImageTask({
      prompt: buildPolaroidPrompt(input.content),
    });
    await setTaskStartedAt(taskId, startedAt);

    await updateGenerationStatus({
      generationId,
      providerTaskId: taskId,
      status: GENERATION_STATUS.QUEUED,
      metadata: {
        providerTaskCreatedAt: new Date().toISOString(),
      },
    });

    return jsonResponse(req, {
      success: true,
      data: {
        generationId,
        requestId,
        taskId,
        status: GENERATION_STATUS.QUEUED,
        creditsBalance,
        remainingFreeGenerations: anonymousAllowance?.remaining,
        freeGenerationLimit: anonymousAllowance?.limit,
      },
    });
  } catch (error) {
    if (generationId) {
      await updateGenerationStatus({
        generationId,
        status: GENERATION_STATUS.FAILED,
        errorMsg: error instanceof Error ? error.message : "Generation failed",
      }).catch((updateError) => {
        console.error("Failed to mark generation failed:", updateError);
      });
    }

    if (creditsDebited && generationId) {
      await refundGenerationCredits({
        generationId,
        reason: "KIE task creation failed",
      }).catch((refundError) => {
        console.error("Failed to refund generation credits:", refundError);
      });
    }

    if (locked && lockOwner) {
      await releaseGenerationLock(lockOwner);
    }

    const message =
      error instanceof Error ? error.message : "Generation failed";
    const status =
      message === "REQUEST_BODY_TOO_LARGE"
        ? 413
        : message.includes("Redis")
          ? 503
          : error instanceof InsufficientCreditsError
            ? error.status
          : 400;
    const userMessage =
      message === "REQUEST_BODY_TOO_LARGE"
        ? "Request body is too large"
        : status === 503
          ? "Generation is temporarily unavailable"
          : message;

    await logMvpEvent(req, "generate_failed", {
      provider: PROVIDER_NAME.KIE_AI,
      durationMs: Date.now() - startedAt,
      metadata: { message, generationId },
    });

    return jsonError(req, userMessage, status);
  }
}
