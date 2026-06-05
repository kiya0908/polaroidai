import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error: "Legacy Flux task webhook is disabled. KIE.ai generation status is handled by /api/mvp-generate/status.",
    },
    { status: 410 },
  );
}