import { requireApiUserId } from "@/lib/session";
import { learningGoalSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const { id } = await ctx.params;
  const existing = await prisma.learningGoal.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = learningGoalSchema.partial().safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const d = parsed.data;
  const { milestones: _ignored, ...rest } = d;
  void _ignored;
  const goal = await prisma.learningGoal.update({
    where: { id },
    data: {
      ...rest,
      targetDate: d.targetDate !== undefined ? (d.targetDate ? new Date(d.targetDate) : null) : undefined,
    },
    include: { milestones: true },
  });
  return NextResponse.json(goal);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const { id } = await ctx.params;
  const existing = await prisma.learningGoal.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.learningGoal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
