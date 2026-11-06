import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { WeeklyChart, PipelineChart, ProjectProgressChart, DistributionPie } from "@/components/charts";
import { label } from "@/lib/utils";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function AnalyticsPage() {
  const userId = await requireUserId();
  const [projects, tasks, applications, skills, activities, learningGoals] = await Promise.all([
    prisma.project.findMany({ where: { userId } }),
    prisma.task.findMany({ where: { userId } }),
    prisma.jobApplication.findMany({ where: { userId } }),
    prisma.skill.findMany({ where: { userId } }),
    prisma.activity.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 365 }),
    prisma.learningGoal.findMany({ where: { userId } }),
  ]);

  const completedProjects = projects.filter((p) => p.status === "COMPLETED").length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const codingHours = Math.round(activities.filter((a) => a.type === "CODING" || a.type === "PROJECT").reduce((s, a) => s + a.duration, 0) / 60);
  const learningHours = Math.round(activities.filter((a) => a.type === "LEARNING" || a.type === "STUDY").reduce((s, a) => s + a.duration, 0) / 60);
  const interviewRate = applications.length ? Math.round((applications.filter((a) => ["INTERVIEW", "TECHNICAL_INTERVIEW", "OFFER"].includes(a.status)).length / applications.length) * 100) : 0;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return startOfDay(d);
  });
  const weekly = days.map((d) => ({
    day: d.toLocaleDateString("en-US", { weekday: "short" }),
    hours: Math.round((activities.filter((a) => startOfDay(a.date).getTime() === d.getTime()).reduce((s, a) => s + a.duration, 0) / 60) * 10) / 10,
  }));

  const pipeline = ["SAVED", "APPLIED", "ASSESSMENT", "INTERVIEW", "TECHNICAL_INTERVIEW", "OFFER", "REJECTED"].map((s) => ({
    status: label(s), count: applications.filter((a) => a.status === s).length,
  }));
  const projectProgress = projects.slice(0, 8).map((p) => ({ name: p.name.slice(0, 16), progress: p.progress }));
  const taskCompletion = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"].map((s) => ({ name: label(s), value: tasks.filter((t) => t.status === s).length }));
  const skillDistribution = skills.reduce<Array<{ name: string; value: number }>>((acc, s) => {
    const found = acc.find((x) => x.name === label(s.category));
    if (found) found.value++;
    else acc.push({ name: label(s.category), value: 1 });
    return acc;
  }, []);
  const learningProgress = learningGoals.map((g) => ({ name: label(g.status), value: 1 }));

  const metrics = [
    { label: "Total Projects", value: projects.length },
    { label: "Completed Projects", value: completedProjects },
    { label: "Tasks Completed", value: completedTasks },
    { label: "Completion Rate", value: `${completionRate}%` },
    { label: "Coding Hours", value: `${codingHours}h` },
    { label: "Learning Hours", value: `${learningHours}h` },
    { label: "Applications", value: applications.length },
    { label: "Interview Rate", value: `${interviewRate}%` },
    { label: "Skills", value: skills.length },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}><p className="text-2xl font-bold">{m.value}</p><p className="text-xs text-slate-400">{m.label}</p></Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><h2 className="mb-4 font-semibold">Productivity over time</h2><WeeklyChart data={weekly} /></Card>
        <Card><h2 className="mb-4 font-semibold">Career pipeline</h2><PipelineChart data={pipeline} /></Card>
        <Card><h2 className="mb-4 font-semibold">Project progress</h2><ProjectProgressChart data={projectProgress} /></Card>
        <Card><h2 className="mb-4 font-semibold">Task completion</h2><DistributionPie data={taskCompletion} /></Card>
        <Card><h2 className="mb-4 font-semibold">Skill distribution</h2><DistributionPie data={skillDistribution} /></Card>
        <Card><h2 className="mb-4 font-semibold">Learning progress</h2><DistributionPie data={learningProgress.length ? learningProgress : [{ name: "None", value: 1 }]} /></Card>
      </div>
    </div>
  );
}
