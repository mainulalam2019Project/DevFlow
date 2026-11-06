import Link from "next/link";
import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { WeeklyChart, TasksLineChart, ProjectProgressChart, PipelineChart } from "@/components/charts";
import { formatDate, label } from "@/lib/utils";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function lastNDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return startOfDay(d);
  });
}

export default async function DashboardPage() {
  const userId = await requireUserId();
  const [projects, tasks, applications, skills, activities, notifications] = await Promise.all([
    prisma.project.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.task.findMany({ where: { userId }, orderBy: { deadline: "asc" }, take: 8, include: { project: true } }),
    prisma.jobApplication.findMany({ where: { userId } }),
    prisma.skill.findMany({ where: { userId } }),
    prisma.activity.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 200 }),
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const activeProjects = projects.filter((p) => p.status === "IN_PROGRESS").length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const avgSkill = skills.length ? Math.round(skills.reduce((a, s) => a + s.proficiency, 0) / skills.length) : 0;

  const days = lastNDays(7);
  const weekly = days.map((d) => ({
    day: d.toLocaleDateString("en-US", { weekday: "short" }),
    hours: Math.round(activities.filter((a) => startOfDay(a.date).getTime() === d.getTime()).reduce((sum, a) => sum + a.duration, 0) / 60 * 10) / 10,
  }));

  const completedSeries = days.map((d) => ({
    day: d.toLocaleDateString("en-US", { weekday: "short" }),
    completed: tasks.filter((t) => t.status === "DONE" && startOfDay(t.updatedAt).getTime() === d.getTime()).length,
  }));

  const projectProgress = projects.slice(0, 6).map((p) => ({ name: p.name.length > 18 ? p.name.slice(0, 18) + "…" : p.name, progress: p.progress }));
  const pipeline = ["SAVED", "APPLIED", "ASSESSMENT", "INTERVIEW", "TECHNICAL_INTERVIEW", "OFFER", "REJECTED"].map((s) => ({
    status: label(s), count: applications.filter((a) => a.status === s).length,
  }));

  // streak: consecutive days (ending today/yesterday) with activity
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 60; i++) {
    const has = activities.some((a) => startOfDay(a.date).getTime() === startOfDay(cursor).getTime());
    if (!has) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const upcomingDeadlines = [
    ...tasks.filter((t) => t.deadline && t.status !== "DONE").map((t) => ({ id: t.id, title: t.title, date: t.deadline!, type: "Task" })),
    ...projects.filter((p) => p.deadline).map((p) => ({ id: p.id, title: p.name, date: p.deadline!, type: "Project" })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);

  const stats = [
    { label: "Active Projects", value: activeProjects },
    { label: "Completed Tasks", value: tasks.filter((t) => t.status === "DONE").length },
    { label: "Current Streak", value: `${streak}d` },
    { label: "Applications", value: applications.length },
    { label: "Skills Progress", value: `${avgSkill}%` },
    { label: "This Week", value: `${weekly.reduce((a, b) => a + b.hours, 0)}h` },
  ];

  void completedTasks;
  void notifications;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><h2 className="mb-4 font-semibold">Weekly Productivity (hours)</h2><WeeklyChart data={weekly} /></Card>
        <Card><h2 className="mb-4 font-semibold">Tasks Completed</h2><TasksLineChart data={completedSeries} /></Card>
        <Card><h2 className="mb-4 font-semibold">Project Progress</h2><ProjectProgressChart data={projectProgress} /></Card>
        <Card><h2 className="mb-4 font-semibold">Application Pipeline</h2><PipelineChart data={pipeline} /></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="mb-4 font-semibold">Today&apos;s Focus</h2>
          <ul className="space-y-2 text-sm">
            {tasks.filter((t) => t.status !== "DONE").slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="truncate">{t.title}</span>
                <span className="text-xs text-slate-400">{label(t.priority)}</span>
              </li>
            ))}
            {tasks.filter((t) => t.status !== "DONE").length === 0 && <li className="text-slate-400">Nothing scheduled — nice work!</li>}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Upcoming Deadlines</h2>
          <ul className="space-y-2 text-sm">
            {upcomingDeadlines.map((d) => (
              <li key={d.id} className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="truncate">{d.title} <span className="text-xs text-slate-400">({d.type})</span></span>
                <span className="text-xs text-slate-400">{formatDate(d.date)}</span>
              </li>
            ))}
            {upcomingDeadlines.length === 0 && <li className="text-slate-400">No upcoming deadlines.</li>}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link className="rounded-lg border border-slate-200 p-3 text-center transition hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900" href="/projects">+ Project</Link>
            <Link className="rounded-lg border border-slate-200 p-3 text-center transition hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900" href="/tasks">+ Task</Link>
            <Link className="rounded-lg border border-slate-200 p-3 text-center transition hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900" href="/career">+ Application</Link>
            <Link className="rounded-lg border border-slate-200 p-3 text-center transition hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900" href="/activity">Log Activity</Link>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 font-semibold">Recent Projects</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="rounded-lg border border-slate-200 p-4 transition hover:shadow-md dark:border-slate-800">
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-slate-400">{label(p.status)} · {p.progress}%</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
