import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return <DashboardShell userName={user?.name ?? "User"}>{children}</DashboardShell>;
}
