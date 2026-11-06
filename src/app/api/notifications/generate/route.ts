import { NextResponse } from "next/server";
import { requireApiUserId } from "@/lib/session";
import { generateNotificationsForUser } from "@/lib/notifications";

export async function POST() {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const processed = await generateNotificationsForUser(userId);
  return NextResponse.json({ ok: true, notificationsProcessed: processed });
}
