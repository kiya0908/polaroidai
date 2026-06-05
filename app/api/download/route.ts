import { NextResponse, type NextRequest } from "next/server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

import { FluxHashids } from "@/db/dto/polaroid.dto";
import { prisma } from "@/db/prisma";
import { GENERATION_STATUS } from "@/lib/constants/generation";
import { getErrorMessage } from "@/lib/handle-error";
import { ratelimit } from "@/lib/redis";

export const dynamic = "force-dynamic";

const searchParamsSchema = z.object({
  fluxId: z.string(),
});

const getMime = (filename: string) =>
  filename
    .substring(filename.lastIndexOf(".") + 1, filename.length)
    .toLowerCase();

export async function GET(req: NextRequest) {
  const { success } = await ratelimit.limit(
    "download:image" + `_${req.ip ?? ""}`,
  );
  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }

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
    const { fluxId } = searchParamsSchema.parse(
      Object.fromEntries(url.searchParams),
    );
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

    if (!generation?.id || !generation.outputImageUrl) {
      return new Response("not found", { status: 404 });
    }

    if (generation.taskStatus !== GENERATION_STATUS.SUCCEEDED) {
      return new Response("generation status error", { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.polaroidai_PolaroidGeneration.update({
        where: { id: generation.id },
        data: {
          downloadNum: {
            increment: 1,
          },
        },
      });
      await tx.polaroidai_PolaroidDownloads.create({
        data: {
          polaroidId: generation.id,
          userId: user.id,
        },
      });
    });

    const blob = await fetch(generation.outputImageUrl).then((response) =>
      response.blob(),
    );
    const headers = new Headers();
    headers.set("Content-Type", blob.type);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(
        fluxId + `.${getMime(generation.outputImageUrl)}`,
      )}"`,
    );
    return new NextResponse(blob, { status: 200, statusText: "OK", headers });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 },
    );
  }
}