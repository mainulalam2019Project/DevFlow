"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, Badge, Button, EmptyState, Input, Select, Label, ProgressBar } from "@/components/ui";
import { formatDate, label } from "@/lib/utils";

interface Skill { id: string; name: string; category: string; proficiency: number; yearsExperience: number | null; lastPracticed: string | null }

const CATEGORIES = ["PROGRAMMING", "FRONTEND", "BACKEND", "DATABASE", "DEVOPS", "CLOUD", "TOOLS", "SOFT_SKILLS"];
const emptyForm = { name: "", category: "PROGRAMMING", proficiency: "50", yearsExperience: "", lastPracticed: "" };

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/skills");
    setSkills(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (s: Skill) => {
    setEditing(s);
    setForm({ name: s.name, category: s.category, proficiency: String(s.proficiency), yearsExperience: s.yearsExperience != null ? String(s.yearsExperience) : "", lastPracticed: s.lastPracticed ? s.lastPracticed.slice(0, 10) : "" });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, proficiency: Number(form.proficiency), yearsExperience: form.yearsExperience === "" ? null : Number(form.yearsExperience), lastPracticed: form.lastPracticed || null };
    const res = await fetch(editing ? `/api/skills/${editing.id}` : "/api/skills", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { toast.error("Save failed"); return; }
    toast.success(editing ? "Skill updated" : "Skill added");
    setShowForm(false); setEditing(null); setForm(emptyForm); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    await fetch(`/api/skills/${id}`, { method: "DELETE" });
    toast.success("Skill deleted");
    load();
  };

  const byCategory = CATEGORIES.map((c) => ({ category: c, skills: skills.filter((s) => s.category === c) })).filter((g) => g.skills.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm((v) => !v); }}>+ Add Skill</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Category</Label><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}</Select></div>
            <div><Label>Proficiency (%)</Label><Input type="number" min={0} max={100} value={form.proficiency} onChange={(e) => setForm({ ...form, proficiency: e.target.value })} /></div>
            <div><Label>Years of experience</Label><Input type="number" step="0.5" min={0} value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })} /></div>
            <div><Label>Last practiced</Label><Input type="date" value={form.lastPracticed} onChange={(e) => setForm({ ...form, lastPracticed: e.target.value })} /></div>
            <div className="flex items-end gap-2"><Button type="submit">{editing ? "Update" : "Add"}</Button><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button></div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />)}</div>
      ) : skills.length === 0 ? (
        <EmptyState title="No skills yet" description="Add your technical skills to track your growth over time." />
      ) : (
        byCategory.map((group) => (
          <div key={group.category}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">{label(group.category)}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.skills.map((s) => (
                <Card key={s.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{s.name}</h3>
                    <Badge className="bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">{s.proficiency}%</Badge>
                  </div>
                  <ProgressBar value={s.proficiency} />
                  <p className="text-xs text-slate-400">{s.yearsExperience != null ? `${s.yearsExperience} yrs · ` : ""}Last practiced {formatDate(s.lastPracticed)}</p>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => openEdit(s)}>Edit</Button>
                    <Button variant="danger" onClick={() => remove(s.id)}>Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
