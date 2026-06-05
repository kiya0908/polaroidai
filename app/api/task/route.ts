import { NextResponse, type NextRequest } from "next/server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { z } from "zod";

import { FluxHashids } from "@/db/dto/polaroid.dto";
import { prisma } from "@/db/prisma";
import { GENERATION_STATUS } from "@/lib/constants/generation";
import { getErrorMessage } from "@/lib/handle-error";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, "5 s"),
});

function getKey(id: string) {
  return `task:query:${id}`;
}

const QueryTaskSchema = z.object({
  fluxId: z.string(),
});

function toLegacyTaskStatus(status: string) {
  if (status === GENERATION_STATUS.SUCCEEDED) return "succeeded";
  if (status === GENERATION_STATUS.FAILED) return "failed";
  return "processing";
}

export async function POST(req: NextRequest) {
  const { userId } = auth();

  const user = await currentUser();
  if (!userId || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { success } = await ratelimit.limit(
    getKey(userId) + `_${req.ip ?? ""}`,
  );
  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }

  try {
    const data = await req.json();
    const { fluxId } = QueryTaskSchema.parse(data);
    const [id] = FluxHashids.decode(fluxId);
    if (!id) {
      return new Response("not found", { status: 404 });
    }

    const generation = await prisma.polaroidai_PolaroidGeneration.findFirst({
      where: {
        id: id as number,
        userId,
      },
    });

    if (!generation?.id) {
      return new Response("not found", { status: 404 });
    }

    return NextResponse.json({
      data: {
        ...generation,
        imageUrl: generation.outputImageUrl,
        inputPrompt: generation.inputContent,
        aspectRatio: "1:1",
        model: generation.providerName ?? "kie_ai",
        taskStatus: toLegacyTaskStatus(generation.taskStatus),
        executeTime:
          generation.executeEndTime && generation.executeStartTime
            ? `${generation.executeEndTime - generation.executeStartTime}`
            : 0,
        id: FluxHashids.encode(generation.id),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 },
    );
  }
}