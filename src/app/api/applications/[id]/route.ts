import { requireApiUserId } from "@/lib/session";
import { applicationSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const { id } = await ctx.params;
  const app = await prisma.jobApplication.findFirst({ where: { id, userId } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(app);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const { id } = await ctx.params;
  const existing = await prisma.jobApplication.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = applicationSchema.partial().safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const d = parsed.data;
  const app = await prisma.jobApplication.update({
    where: { id },
    data: {
      ...d,
      applicationDate: d.applicationDate !== undefined ? (d.applicationDate ? new Date(d.applicationDate) : null) : undefined,
      deadline: d.deadline !== undefined ? (d.deadline ? new Date(d.deadline) : null) : undefined,
      jobUrl: d.jobUrl !== undefined ? d.jobUrl || null : undefined,
    },
  });
  return NextResponse.json(app);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const { id } = await ctx.params;
  const existing = await prisma.jobApplication.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.jobApplication.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
