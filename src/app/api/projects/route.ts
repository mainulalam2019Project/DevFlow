import { requireApiUserId } from "@/lib/session";
import { projectSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function syncTechnologies(projectId: string, names: string[]) {
  await prisma.projectTechnology.deleteMany({ where: { projectId } });
  for (const name of names) {
    const tech = await prisma.technology.upsert({ where: { name }, create: { name }, update: {} });
    await prisma.projectTechnology.create({ data: { projectId, technologyId: tech.id } });
  }
}

export async function GET(req: NextRequest) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q");
  const status = searchParams.get("status");
  const projects = await prisma.project.findMany({
    where: {
      userId,
      ...(status ? { status: status as never } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {}),
    },
    include: { technologies: { include: { technology: true } }, _count: { select: { tasks: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const parsed = projectSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const { technologies = [], ...data } = parsed.data;
  const project = await prisma.project.create({
    data: {
      userId,
      name: data.name,
      description: data.description ?? null,
      status: data.status ?? "PLANNING",
      priority: data.priority ?? "MEDIUM",
      startDate: data.startDate ? new Date(data.startDate) : null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      githubUrl: data.githubUrl || null,
      liveUrl: data.liveUrl || null,
      progress: data.progress ?? 0,
    },
  });
  await syncTechnologies(project.id, technologies);
  const full = await prisma.project.findUnique({ where: { id: project.id }, include: { technologies: { include: { technology: true } } } });
  return NextResponse.json(full, { status: 201 });
}

export { syncTechnologies };
