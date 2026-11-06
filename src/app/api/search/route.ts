import { requireApiUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ projects: [], tasks: [], applications: [], skills: [], learning: [] });
  const contains = { contains: q, mode: "insensitive" as const };
  const [projects, tasks, applications, skills, learning] = await Promise.all([
    prisma.project.findMany({ where: { userId, name: contains }, take: 5, select: { id: true, name: true } }),
    prisma.task.findMany({ where: { userId, title: contains }, take: 5, select: { id: true, title: true } }),
    prisma.jobApplication.findMany({ where: { userId, OR: [{ company: contains }, { position: contains }] }, take: 5, select: { id: true, company: true, position: true } }),
    prisma.skill.findMany({ where: { userId, name: contains }, take: 5, select: { id: true, name: true } }),
    prisma.learningGoal.findMany({ where: { userId, goal: contains }, take: 5, select: { id: true, goal: true } }),
  ]);
  return NextResponse.json({ projects, tasks, applications, skills, learning });
}
