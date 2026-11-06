import { requireApiUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const notifications = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json(notifications);
}

export async function PATCH(req: NextRequest) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const { id, read, all } = await req.json();
  if (all) {
    await prisma.notification.updateMany({ where: { userId }, data: { read: true } });
    return NextResponse.json({ ok: true });
  }
  const n = await prisma.notification.findFirst({ where: { id, userId } });
  if (!n) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.notification.update({ where: { id }, data: { read: Boolean(read) } });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.notification.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
