import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  applyMvpCookies,
  getMvpIdentity,
  logMvpEvent,
} from "@/lib/mvp-events";

export const dynamic = "force-dynamic";

const EventSchema = z.object({
  eventType: z.enum(["page_view", "composition_tab_click"]),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = EventSchema.parse(await req.json());
    await logMvpEvent(req, body.eventType, { metadata: body.metadata });
    const response = NextResponse.json({ success: true });
    applyMvpCookies(response, getMvpIdentity(req));
    return response;
  } catch {
    const response = NextResponse.json(
      { success: false, error: { message: "Invalid event" } },
      { status: 400 },
    );
    applyMvpCookies(response, getMvpIdentity(req));
    return response;
  }
}
