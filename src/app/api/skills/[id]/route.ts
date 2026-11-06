import { requireApiUserId } from "@/lib/session";
import { skillSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const { id } = await ctx.params;
  const existing = await prisma.skill.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = skillSchema.partial().safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const d = parsed.data;
  const skill = await prisma.skill.update({
    where: { id },
    data: { ...d, lastPracticed: d.lastPracticed !== undefined ? (d.lastPracticed ? new Date(d.lastPracticed) : null) : undefined },
  });
  return NextResponse.json(skill);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const { id } = await ctx.params;
  const existing = await prisma.skill.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.skill.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
