import { NextRequest, NextResponse } from "next/server";
import { generateNotificationsForAllUsers } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  const processed = await generateNotificationsForAllUsers();
  return NextResponse.json({ ok: true, notificationsProcessed: processed });
}

export const POST = GET;
