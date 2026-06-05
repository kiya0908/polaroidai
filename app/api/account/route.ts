import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@clerk/nextjs/server";

// 强制动态渲染，避免在构建时预渲染
export const dynamic = 'force-dynamic';
import { Ratelimit } from "@upstash/ratelimit";

import { AccountHashids } from "@/db/dto/account.dto";
import { getUserCredit } from "@/db/queries/account";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  console.time("stat");
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  // console.timeLog("stat");

  // const ratelimit = new Ratelimit({
  //   redis,
  //   limiter: Ratelimit.slidingWindow(5, "5 s"),
  //   analytics: true,
  // });
  // const { success } = await ratelimit.limit(
  //   "account:info" + `_${req.ip ?? ""}`,
  // );
  console.timeLog("stat");

  // if (!success) {
  //   return new Response("Too Many Requests", {
  //     status: 429,
  //   });
  // }

  const accountInfo = await getUserCredit(userId);
  console.timeEnd("stat");

  return NextResponse.json({
    ...accountInfo,
    id: AccountHashids.encode(accountInfo.id),
  });
}
