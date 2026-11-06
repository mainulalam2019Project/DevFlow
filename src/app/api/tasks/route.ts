import { requireApiUserId } from "@/lib/session";
import { taskSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q");
  const status = searchParams.get("status");
  const projectId = searchParams.get("projectId");
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      ...(status ? { status: status as never } : {}),
      ...(projectId ? { projectId } : {}),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const parsed = taskSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const d = parsed.data;
  const task = await prisma.task.create({
    data: {
      userId,
      title: d.title,
      description: d.description ?? null,
      status: d.status ?? "TODO",
      priority: d.priority ?? "MEDIUM",
      deadline: d.deadline ? new Date(d.deadline) : null,
      projectId: d.projectId || null,
      labels: d.labels ?? [],
    },
  });
  return NextResponse.json(task, { status: 201 });
}
