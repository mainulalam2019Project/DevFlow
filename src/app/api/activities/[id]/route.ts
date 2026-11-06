import { requireApiUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const { id } = await ctx.params;
  const existing = await prisma.activity.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.activity.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
