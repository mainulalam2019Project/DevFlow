import { requireApiUserId } from "@/lib/session";
import { profileSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const parsed = profileSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const d = parsed.data;
  await prisma.user.update({ where: { id: userId }, data: { name: d.name, email: d.email } });
  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId, username: d.username ?? null, bio: d.bio ?? null, university: d.university ?? null,
      degree: d.degree ?? null, graduationYear: d.graduationYear ?? null, location: d.location ?? null,
      github: d.github ?? null, linkedin: d.linkedin ?? null, portfolio: d.portfolio ?? null,
    },
    update: {
      username: d.username ?? null, bio: d.bio ?? null, university: d.university ?? null,
      degree: d.degree ?? null, graduationYear: d.graduationYear ?? null, location: d.location ?? null,
      github: d.github ?? null, linkedin: d.linkedin ?? null, portfolio: d.portfolio ?? null,
    },
  });
  return NextResponse.json({ ok: true });
}
