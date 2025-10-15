import { NextResponse, type NextRequest } from "next/server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { z } from "zod";

import { FluxHashids } from "@/db/dto/flux.dto";
import { prisma } from "@/db/prisma";
import { env } from "@/env.mjs";
import { getErrorMessage } from "@/lib/handle-error";
import { redis } from "@/lib/redis";

// 获取nano-banana结果的函数
async function getNanoBananaResult(taskId: string) {
  try {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${env.NANO_BANANA_API_KEY}`);

    const response = await fetch(`${env.NANO_BANANA_API_URL}/v1/draw/result`, {
      method: "POST",
      headers,
      body: JSON.stringify({ id: taskId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching nano-banana result:", error);
    return null;
  }
}

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
    return new Response("Too Many Requests", {
      status: 429,
    });
  }
  try {
    const data = await req.json();
    const { fluxId } = QueryTaskSchema.parse(data);
    const [id] = FluxHashids.decode(fluxId);
    if (!id) {
      return new Response("not found", {
        status: 404,
      });
    }
    const fluxData = await prisma.fluxData.findUnique({
      where: {
        id: id as number,
      },
    });

    if (!fluxData || !fluxData?.id) {
      return new Response("not found", {
        status: 404,
      });
    }

    // 如果任务还在处理中，查询nano-banana的结果
    if (fluxData.taskStatus === "processing" && fluxData.replicateId) {
      const nanoBananaResult = await getNanoBananaResult(fluxData.replicateId);

      if (nanoBananaResult && nanoBananaResult.code === 0) {
        const resultData = nanoBananaResult.data;

        // 根据官方文档的状态映射
        let taskStatus = "processing";
        if (resultData.status === "succeeded") {
          taskStatus = "succeeded";
        } else if (resultData.status === "failed") {
          taskStatus = "failed";
        }

        // 更新数据库记录
        if (taskStatus !== "processing") {
          await prisma.fluxData.update({
            where: { id: fluxData.id },
            data: {
              taskStatus,
              imageUrl: taskStatus === "succeeded" && resultData.results?.[0]?.url ? resultData.results[0].url : null,
              errorMsg: taskStatus === "failed" ? resultData.failure_reason || resultData.error : null,
              executeEndTime: new Date(),
            },
          });

          // 重新获取更新后的数据
          const updatedFluxData = await prisma.fluxData.findUnique({
            where: { id: fluxData.id },
          });

          if (updatedFluxData) {
            const { executeEndTime, executeStartTime, loraUrl, ...rest } = updatedFluxData;
            return NextResponse.json({
              data: {
                ...rest,
                executeTime:
                  executeEndTime && executeStartTime
                    ? `${executeEndTime.getTime() - executeStartTime.getTime()}`
                    : 0,
                id: FluxHashids.encode(updatedFluxData.id),
              },
            });
          }
        }
      }
    }
    const { executeEndTime, executeStartTime, loraUrl, ...rest } = fluxData;
    return NextResponse.json({
      data: {
        ...rest,
        executeTime:
          executeEndTime && executeStartTime
            ? `${executeEndTime.getTime() - executeStartTime.getTime()}`
            : 0,
        id: FluxHashids.encode(fluxData.id),
      },
    });
  } catch (error) {
    console.log("error-->", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 },
    );
  }
}
