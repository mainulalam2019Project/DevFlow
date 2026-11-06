"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, Badge, Button, EmptyState, Input, Textarea, Label, ProgressBar } from "@/components/ui";
import { formatDate, label } from "@/lib/utils";

interface Milestone { id: string; title: string; done: boolean }
interface Goal {
  id: string; goal: string; description: string | null; category: string | null; progress: number;
  targetDate: string | null; resources: string | null; status: string; milestones: Milestone[];
}

const emptyForm = { goal: "", description: "", category: "", targetDate: "", resources: "", milestones: "" };

export default function LearningPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/learning");
    setGoals(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      targetDate: form.targetDate || null,
      milestones: form.milestones.split("\n").map((t) => t.trim()).filter(Boolean).map((title) => ({ title })),
    };
    const res = await fetch("/api/learning", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { toast.error("Save failed"); return; }
    toast.success("Learning goal added");
    setShowForm(false); setForm(emptyForm); load();
  };

  const toggleMilestone = async (m: Milestone) => {
    await fetch("/api/learning/milestones", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ milestoneId: m.id, done: !m.done }) });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    await fetch(`/api/learning/${id}`, { method: "DELETE" });
    toast.success("Goal deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Learning Center</h1>
        <Button onClick={() => { setForm(emptyForm); setShowForm((v) => !v); }}>+ New Goal</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div><Label>Goal</Label><Input required value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="Learn Next.js" /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Web" /></div>
            <div><Label>Target date</Label><Input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} /></div>
            <div><Label>Resources</Label><Input value={form.resources} onChange={(e) => setForm({ ...form, resources: e.target.value })} placeholder="Docs, course links..." /></div>
            <div className="md:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Milestones (one per line)</Label><Textarea rows={4} value={form.milestones} onChange={(e) => setForm({ ...form, milestones: e.target.value })} placeholder={"App Router\nServer Components\nAPI Routes"} /></div>
            <div className="flex gap-2"><Button type="submit">Create</Button><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button></div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">{[0, 1].map((i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />)}</div>
      ) : goals.length === 0 ? (
        <EmptyState title="No learning goals yet" description="Create a learning goal and break it into milestones." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {goals.map((g) => {
            const done = g.milestones.filter((m) => m.done).length;
            const pct = g.milestones.length ? Math.round((done / g.milestones.length) * 100) : g.progress;
            return (
              <Card key={g.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{g.goal}</h3>
                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800">{label(g.status)}</Badge>
                </div>
                {g.description && <p className="text-sm text-slate-500 dark:text-slate-400">{g.description}</p>}
                <div className="space-y-1">
                  <ProgressBar value={pct} />
                  <p className="text-xs text-slate-400">{pct}% · Target {formatDate(g.targetDate)}</p>
                </div>
                {g.milestones.length > 0 && (
                  <ul className="space-y-1.5 text-sm">
                    {g.milestones.map((m) => (
                      <li key={m.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={m.done} onChange={() => toggleMilestone(m)} aria-label={`Milestone ${m.title}`} />
                        <span className={m.done ? "line-through opacity-60" : ""}>{m.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Button variant="danger" onClick={() => remove(g.id)}>Delete</Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
