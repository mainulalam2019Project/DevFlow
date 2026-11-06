"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, Badge, Button, EmptyState, Input, Select, Textarea, Label, ProgressBar } from "@/components/ui";
import { formatDate, label, priorityColor, statusColor } from "@/lib/utils";

interface Project {
  id: string; name: string; description: string | null; status: string; priority: string;
  deadline: string | null; progress: number; githubUrl: string | null; liveUrl: string | null;
  technologies: Array<{ technology: { name: string } }>;
}

const emptyForm = { name: "", description: "", status: "PLANNING", priority: "MEDIUM", deadline: "", githubUrl: "", liveUrl: "", progress: "0", technologies: "" };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?q=${encodeURIComponent(q)}&status=${status}`);
      if (!res.ok) throw new Error("Failed to load projects");
      setProjects(await res.json());
      setError("");
    } catch {
      setError("Could not load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description ?? "", status: p.status, priority: p.priority,
      deadline: p.deadline ? p.deadline.slice(0, 10) : "", githubUrl: p.githubUrl ?? "", liveUrl: p.liveUrl ?? "",
      progress: String(p.progress), technologies: p.technologies.map((t) => t.technology.name).join(", "),
    });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      progress: Number(form.progress),
      technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
      deadline: form.deadline || null,
    };
    const res = await fetch(editing ? `/api/projects/${editing.id}` : "/api/projects", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error ?? "Save failed");
      return;
    }
    toast.success(editing ? "Project updated" : "Project created");
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    toast.success("Project deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm((v) => !v); }}>+ New Project</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search projects..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[180px]">
          <option value="">All statuses</option>
          {["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED", "ARCHIVED"].map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </Select>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Status</Label><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED", "ARCHIVED"].map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select></div>
            <div><Label>Priority</Label><Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{["LOW", "MEDIUM", "HIGH", "URGENT"].map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select></div>
            <div><Label>GitHub URL</Label><Input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..." /></div>
            <div><Label>Live URL</Label><Input value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} placeholder="https://..." /></div>
            <div><Label>Progress (%)</Label><Input type="number" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} /></div>
            <div><Label>Technologies (comma separated)</Label><Input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="React, Next.js, ..." /></div>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-300">{error}</p>}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />)}</div>
      ) : projects.length === 0 ? (
        <EmptyState title="No projects yet" description="Create your first project to start tracking your development journey." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/projects/${p.id}`} className="font-semibold hover:text-brand-600">{p.name}</Link>
                <Badge className={statusColor(p.status)}>{label(p.status)}</Badge>
              </div>
              <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{p.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.technologies.map((t) => <Badge key={t.technology.name} className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t.technology.name}</Badge>)}
              </div>
              <div className="space-y-1">
                <ProgressBar value={p.progress} />
                <p className="text-xs text-slate-400">{p.progress}% · Deadline {formatDate(p.deadline)}</p>
              </div>
              <div className="flex items-center justify-between">
                <Badge className={priorityColor(p.priority)}>{label(p.priority)}</Badge>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => openEdit(p)}>Edit</Button>
                  <Button variant="danger" onClick={() => remove(p.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
