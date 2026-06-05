import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Legacy generation API is disabled. Please use /api/mvp-generate/start.",
    },
    { status: 410 },
  );
}
