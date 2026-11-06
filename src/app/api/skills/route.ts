import { requireApiUserId } from "@/lib/session";
import { skillSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const skills = await prisma.skill.findMany({ where: { userId }, orderBy: { proficiency: "desc" } });
  return NextResponse.json(skills);
}

export async function POST(req: NextRequest) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const parsed = skillSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const d = parsed.data;
  const skill = await prisma.skill.create({
    data: {
      userId, name: d.name, category: d.category ?? "PROGRAMMING", proficiency: d.proficiency ?? 50,
      yearsExperience: d.yearsExperience ?? null, lastPracticed: d.lastPracticed ? new Date(d.lastPracticed) : null,
    },
  });
  return NextResponse.json(skill, { status: 201 });
}
