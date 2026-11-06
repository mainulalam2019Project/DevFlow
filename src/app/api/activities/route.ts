import { requireApiUserId } from "@/lib/session";
import { activitySchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const activities = await prisma.activity.findMany({ where: { userId }, include: { project: { select: { name: true } } }, orderBy: { date: "desc" } });
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const parsed = activitySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const d = parsed.data;
  const activity = await prisma.activity.create({
    data: { userId, type: d.type, duration: d.duration, projectId: d.projectId || null, date: d.date ? new Date(d.date) : new Date(), notes: d.notes ?? null },
  });
  return NextResponse.json(activity, { status: 201 });
}
