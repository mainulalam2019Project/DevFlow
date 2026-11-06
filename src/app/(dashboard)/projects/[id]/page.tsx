import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, Badge, ProgressBar } from "@/components/ui";
import { formatDate, label, priorityColor, statusColor } from "@/lib/utils";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { technologies: { include: { technology: true } }, tasks: true, activities: { orderBy: { date: "desc" }, take: 10 } },
  });
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <Link href="/projects" className="text-sm text-brand-600 hover:underline">← Back to projects</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        <div className="flex gap-2">
          <Badge className={statusColor(project.status)}>{label(project.status)}</Badge>
          <Badge className={priorityColor(project.priority)}>{label(project.priority)}</Badge>
        </div>
      </div>
      <p className="text-slate-500 dark:text-slate-400">{project.description}</p>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-sm"><span>Progress</span><span>{project.progress}%</span></div>
            <ProgressBar value={project.progress} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-slate-400">Start</p><p>{formatDate(project.startDate)}</p></div>
            <div><p className="text-slate-400">Deadline</p><p>{formatDate(project.deadline)}</p></div>
            <div><p className="text-slate-400">GitHub</p>{project.githubUrl ? <a className="text-brand-600 hover:underline" href={project.githubUrl} target="_blank" rel="noreferrer">Repository</a> : "—"}</div>
            <div><p className="text-slate-400">Live site</p>{project.liveUrl ? <a className="text-brand-600 hover:underline" href={project.liveUrl} target="_blank" rel="noreferrer">Visit</a> : "—"}</div>
          </div>
          <div>
            <h2 className="mb-2 font-semibold">Technologies</h2>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((t) => <Badge key={t.technologyId} className="bg-slate-100 text-slate-600 dark:bg-slate-800">{t.technology.name}</Badge>)}
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Tasks ({project.tasks.length})</h2>
          <ul className="space-y-2 text-sm">
            {project.tasks.slice(0, 8).map((t) => (
              <li key={t.id} className="flex justify-between border-b border-slate-100 pb-1 dark:border-slate-800">
                <span className="truncate">{t.title}</span>
                <Badge className={statusColor(t.status)}>{label(t.status)}</Badge>
              </li>
            ))}
            {project.tasks.length === 0 && <li className="text-slate-400">No tasks linked.</li>}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold">Activity timeline</h2>
        <ul className="space-y-2 text-sm">
          {project.activities.map((a) => (
            <li key={a.id} className="flex justify-between border-b border-slate-100 pb-1 dark:border-slate-800">
              <span>{label(a.type)} · {Math.round(a.duration / 60 * 10) / 10}h</span>
              <span className="text-slate-400">{formatDate(a.date)}</span>
            </li>
          ))}
          {project.activities.length === 0 && <li className="text-slate-400">No activity logged yet.</li>}
        </ul>
      </Card>
    </div>
  );
}
