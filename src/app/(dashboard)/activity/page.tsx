"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, Badge, Button, EmptyState, Input, Select, Textarea, Label } from "@/components/ui";
import { formatDate, label } from "@/lib/utils";

interface Activity { id: string; type: string; duration: number; date: string; notes: string | null; project?: { name: string } | null }
interface Project { id: string; name: string }

const TYPES = ["STUDY", "CODING", "PROJECT", "LEARNING"];
const emptyForm = { type: "CODING", duration: "60", projectId: "", date: "", notes: "" };

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    const [a, p] = await Promise.all([fetch("/api/activities"), fetch("/api/projects")]);
    setActivities(await a.json());
    setProjects(await p.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { type: form.type, duration: Number(form.duration), projectId: form.projectId || null, date: form.date || null, notes: form.notes || null };
    const res = await fetch("/api/activities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { toast.error("Save failed"); return; }
    toast.success("Activity logged");
    setShowForm(false); setForm(emptyForm); load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/activities/${id}`, { method: "DELETE" });
    toast.success("Activity deleted");
    load();
  };

  const totalMinutes = activities.reduce((s, a) => s + a.duration, 0);
  const byType = TYPES.map((t) => ({ type: t, minutes: activities.filter((a) => a.type === t).reduce((s, a) => s + a.duration, 0) })).filter((x) => x.minutes > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
        <Button onClick={() => { setForm(emptyForm); setShowForm((v) => !v); }}>+ Log Activity</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {byType.map((x) => (
          <Card key={x.type}><p className="text-xl font-bold">{Math.round(x.minutes / 60 * 10) / 10}h</p><p className="text-xs text-slate-400">{label(x.type)}</p></Card>
        ))}
        <Card><p className="text-xl font-bold">{Math.round(totalMinutes / 60 * 10) / 10}h</p><p className="text-xs text-slate-400">Total tracked</p></Card>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div><Label>Type</Label><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}</Select></div>
            <div><Label>Duration (minutes)</Label><Input type="number" min={1} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
            <div><Label>Project</Label><Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}><option value="">None</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="flex gap-2"><Button type="submit">Log</Button><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button></div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      ) : activities.length === 0 ? (
        <EmptyState title="No activity logged" description="Log your study and coding sessions to build your productivity streak." />
      ) : (
        <div className="space-y-2">
          {activities.map((a) => (
            <Card key={a.id} className="!p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Badge className="bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">{label(a.type)}</Badge>
                <div>
                  <p className="font-medium">{a.duration} min {a.project?.name ? `· ${a.project.name}` : ""}</p>
                  <p className="text-xs text-slate-400">{formatDate(a.date)}{a.notes ? ` · ${a.notes}` : ""}</p>
                </div>
              </div>
              <Button variant="danger" onClick={() => remove(a.id)}>Delete</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
