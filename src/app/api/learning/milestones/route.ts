import { requireApiUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const { milestoneId, done } = await req.json();
  const milestone = await prisma.learningMilestone.findFirst({ where: { id: milestoneId, goal: { userId } } });
  if (!milestone) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.learningMilestone.update({ where: { id: milestoneId }, data: { done: Boolean(done) } });
  return NextResponse.json(updated);
}
