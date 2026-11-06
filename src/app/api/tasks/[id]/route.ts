import { requireApiUserId } from "@/lib/session";
import { taskSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const { id } = await ctx.params;
  const task = await prisma.task.findFirst({ where: { id, userId }, include: { project: true } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const { id } = await ctx.params;
  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = taskSchema.partial().safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const d = parsed.data;
  const task = await prisma.task.update({
    where: { id },
    data: {
      ...d,
      deadline: d.deadline !== undefined ? (d.deadline ? new Date(d.deadline) : null) : undefined,
      projectId: d.projectId !== undefined ? d.projectId || null : undefined,
    },
  });
  return NextResponse.json(task);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const { id } = await ctx.params;
  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
