"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, Badge, Button, EmptyState, Input, Select, Textarea, Label } from "@/components/ui";
import { formatDate, label, statusColor } from "@/lib/utils";

interface Application {
  id: string; company: string; position: string; location: string | null; jobType: string | null;
  applicationDate: string | null; deadline: string | null; status: string; salary: string | null; jobUrl: string | null; notes: string | null; contactPerson: string | null;
}

const STATUSES = ["SAVED", "APPLIED", "ASSESSMENT", "INTERVIEW", "TECHNICAL_INTERVIEW", "OFFER", "REJECTED"];
const emptyForm = { company: "", position: "", location: "", jobType: "", applicationDate: "", deadline: "", status: "SAVED", salary: "", jobUrl: "", notes: "", contactPerson: "" };

export default function CareerPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/applications?q=${encodeURIComponent(q)}`);
    setApps(await res.json());
    setLoading(false);
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (a: Application) => {
    setEditing(a);
    setForm({
      company: a.company, position: a.position, location: a.location ?? "", jobType: a.jobType ?? "",
      applicationDate: a.applicationDate ? a.applicationDate.slice(0, 10) : "", deadline: a.deadline ? a.deadline.slice(0, 10) : "",
      status: a.status, salary: a.salary ?? "", jobUrl: a.jobUrl ?? "", notes: a.notes ?? "", contactPerson: a.contactPerson ?? "",
    });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, applicationDate: form.applicationDate || null, deadline: form.deadline || null };
    const res = await fetch(editing ? `/api/applications/${editing.id}` : "/api/applications", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { toast.error("Save failed"); return; }
    toast.success(editing ? "Application updated" : "Application added");
    setShowForm(false); setEditing(null); setForm(emptyForm); load();
  };

  const moveStatus = async (a: Application, status: string) => {
    await fetch(`/api/applications/${a.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    toast.success("Application deleted");
    load();
  };

  const month = new Date().getMonth();
  const thisMonth = apps.filter((a) => a.applicationDate && new Date(a.applicationDate).getMonth() === month).length;
  const interviews = apps.filter((a) => ["INTERVIEW", "TECHNICAL_INTERVIEW"].includes(a.status)).length;
  const offers = apps.filter((a) => a.status === "OFFER").length;
  const responded = apps.filter((a) => a.status !== "SAVED" && a.status !== "APPLIED").length;
  const responseRate = apps.length ? Math.round((responded / apps.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Career Tracker</h1>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm((v) => !v); }}>+ Add Application</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card><p className="text-2xl font-bold">{thisMonth}</p><p className="text-xs text-slate-400">This month</p></Card>
        <Card><p className="text-2xl font-bold">{interviews}</p><p className="text-xs text-slate-400">Interviews</p></Card>
        <Card><p className="text-2xl font-bold">{offers}</p><p className="text-xs text-slate-400">Offers</p></Card>
        <Card><p className="text-2xl font-bold">{responseRate}%</p><p className="text-xs text-slate-400">Response rate</p></Card>
        <Card><p className="text-2xl font-bold">{apps.length ? Math.round((offers / apps.length) * 100) : 0}%</p><p className="text-xs text-slate-400">Conversion</p></Card>
      </div>

      <Input placeholder="Search company or position..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />

      {showForm && (
        <Card>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div><Label>Company</Label><Input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><Label>Position</Label><Input required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div><Label>Job type</Label><Input value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} placeholder="Internship / Full-time" /></div>
            <div><Label>Applied on</Label><Input type="date" value={form.applicationDate} onChange={(e) => setForm({ ...form, applicationDate: e.target.value })} /></div>
            <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
            <div><Label>Status</Label><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select></div>
            <div><Label>Salary</Label><Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="RM 2,000/mo" /></div>
            <div><Label>Job URL</Label><Input value={form.jobUrl} onChange={(e) => setForm({ ...form, jobUrl: e.target.value })} /></div>
            <div><Label>Contact person</Label><Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="flex gap-2"><Button type="submit">{editing ? "Update" : "Create"}</Button><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button></div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />)}</div>
      ) : apps.length === 0 ? (
        <EmptyState title="No applications yet" description="Start tracking your internship and job applications." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-4 lg:grid-cols-2">
          {STATUSES.filter((s) => s !== "REJECTED").map((col) => (
            <div key={col} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
              <h2 className="mb-3 text-sm font-semibold">{label(col)} <span className="text-slate-400">({apps.filter((a) => a.status === col).length})</span></h2>
              <div className="space-y-2">
                {apps.filter((a) => a.status === col).map((a) => (
                  <div key={a.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <p className="font-medium">{a.position}</p>
                    <p className="text-xs text-slate-400">{a.company} · {a.location ?? "Remote"}</p>
                    <p className="text-xs text-slate-400">Applied {formatDate(a.applicationDate)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      <Badge className={statusColor(a.status)}>{label(a.status)}</Badge>
                      <select aria-label="Move status" value={a.status} onChange={(e) => moveStatus(a, e.target.value)} className="ml-auto rounded border border-slate-200 bg-transparent px-1 py-0.5 text-xs dark:border-slate-700">
                        {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                      </select>
                      <button onClick={() => openEdit(a)} className="text-xs text-brand-600 hover:underline">Edit</button>
                      <button onClick={() => remove(a.id)} className="text-xs text-red-500 hover:underline">Del</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
