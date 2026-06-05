import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";

import { prisma } from "@/db/prisma";
import { getKieImageDownloadUrl } from "@/lib/ai/providers/kie";
import { PROVIDER_NAME } from "@/lib/constants/generation";
import {
  applyMvpCookies,
  getMvpIdentity,
  logMvpEvent,
} from "@/lib/mvp-events";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4 * 1024;

const DownloadSchema = z.object({
  taskId: z.string().trim().min(1).max(120),
  imageUrl: z.string().url(),
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

async function readBody(req: NextRequest) {
  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    throw new Error("Request body is too large");
  }

  return DownloadSchema.parse(JSON.parse(raw));
}

export async function POST(req: NextRequest) {
  let taskId: string | undefined;
  let generationId: number | undefined;

  try {
    const input = await readBody(req);
    taskId = input.taskId;
    const generation = await prisma.polaroidai_PolaroidGeneration.findUnique({
      where: { providerTaskId: input.taskId },
      select: { id: true },
    });
    generationId = generation?.id;

    const result = await getKieImageDownloadUrl({
      taskId: input.taskId,
      url: input.imageUrl,
    });

    await logMvpEvent(req, "download_click", {
      taskId: input.taskId,
      provider: PROVIDER_NAME.KIE_AI,
      metadata: { success: true, generationId },
    });

    return jsonResponse(req, {
      success: true,
      data: {
        downloadUrl: result.downloadUrl,
        expiresInSeconds: result.expiresInSeconds,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create download URL";

    await logMvpEvent(req, "download_click", {
      taskId,
      provider: PROVIDER_NAME.KIE_AI,
      metadata: { success: false, message, generationId },
    });

    return jsonResponse(
      req,
      { success: false, error: { message } },
      { status: 400 },
    );
  }
}
