import { requireApiUserId } from "@/lib/session";
import { applicationSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const q = req.nextUrl.searchParams.get("q");
  const status = req.nextUrl.searchParams.get("status");
  const apps = await prisma.jobApplication.findMany({
    where: { userId, ...(status ? { status: status as never } : {}), ...(q ? { OR: [{ company: { contains: q, mode: "insensitive" } }, { position: { contains: q, mode: "insensitive" } }] } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(apps);
}

export async function POST(req: NextRequest) {
  const userId = await requireApiUserId();
  if (userId instanceof NextResponse) return userId;
  const parsed = applicationSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const d = parsed.data;
  const app = await prisma.jobApplication.create({
    data: {
      userId, company: d.company, position: d.position, location: d.location ?? null,
      jobType: d.jobType ?? null, applicationDate: d.applicationDate ? new Date(d.applicationDate) : null,
      deadline: d.deadline ? new Date(d.deadline) : null, status: d.status ?? "SAVED",
      salary: d.salary ?? null, jobUrl: d.jobUrl || null, notes: d.notes ?? null, contactPerson: d.contactPerson ?? null,
    },
  });
  return NextResponse.json(app, { status: 201 });
}
