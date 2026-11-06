import { requireApiUserId } from "@/lib/session";
import { learningGoalSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const goals = await prisma.learningGoal.findMany({ where: { userId }, include: { milestones: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const parsed = learningGoalSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const d = parsed.data;
  const goal = await prisma.learningGoal.create({
    data: {
      userId, goal: d.goal, description: d.description ?? null, category: d.category ?? null,
      progress: d.progress ?? 0, targetDate: d.targetDate ? new Date(d.targetDate) : null,
      resources: d.resources ?? null, status: d.status ?? "NOT_STARTED",
      milestones: d.milestones ? { create: d.milestones.map((m) => ({ title: m.title, done: m.done ?? false })) } : undefined,
    },
    include: { milestones: true },
  });
  return NextResponse.json(goal, { status: 201 });
}
