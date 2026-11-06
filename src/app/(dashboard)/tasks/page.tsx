"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor, KeyboardSensor,
  useDraggable, useDroppable, useSensor, useSensors, closestCenter,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Card, Badge, Button, EmptyState, Input, Select, Textarea, Label } from "@/components/ui";
import { formatDate, label, priorityColor, statusColor } from "@/lib/utils";

interface Task {
  id: string; title: string; description: string | null; status: string; priority: string;
  deadline: string | null; labels: string[]; project?: { id: string; name: string } | null;
}
interface Project { id: string; name: string }

const emptyForm = { title: "", description: "", status: "TODO", priority: "MEDIUM", deadline: "", projectId: "", labels: "" };

const KANBAN = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

function DraggableTaskCard({ t, onEdit, onDelete }: { t: Task; onEdit: (t: Task) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: t.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`touch-none rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950 ${isDragging ? "opacity-40" : ""}`}
    >
      <p className="font-medium">{t.title}</p>
      <p className="text-xs text-slate-400">{t.project?.name ?? "No project"} · {formatDate(t.deadline)}</p>
      <div className="mt-2 flex items-center justify-between">
        <Badge className={priorityColor(t.priority)}>{label(t.priority)}</Badge>
        <div className="flex gap-1">
          <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onEdit(t)} className="text-xs text-brand-600 hover:underline">Edit</button>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onDelete(t.id)} className="text-xs text-red-500 hover:underline">Del</button>
        </div>
      </div>
    </div>
  );
}

function DroppableColumn({ id, title, count, children }: { id: string; title: string; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`rounded-xl border p-3 transition-colors ${isOver ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/30" : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50"}`}>
      <h2 className="mb-3 text-sm font-semibold">{title} <span className="text-slate-400">({count})</span></h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [view, setView] = useState<"list" | "kanban">("kanban");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    const [tasksRes, projectsRes] = await Promise.all([
      fetch(`/api/tasks?q=${encodeURIComponent(q)}&status=${statusFilter}`),
      fetch("/api/projects"),
    ]);
    setTasks(await tasksRes.json());
    setProjects(await projectsRes.json());
    setLoading(false);
  }, [q, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (t: Task) => {
    setEditing(t);
    setForm({ title: t.title, description: t.description ?? "", status: t.status, priority: t.priority, deadline: t.deadline ? t.deadline.slice(0, 10) : "", projectId: t.project?.id ?? "", labels: t.labels.join(", ") });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, deadline: form.deadline || null, projectId: form.projectId || null, labels: form.labels.split(",").map((l) => l.trim()).filter(Boolean) };
    const res = await fetch(editing ? `/api/tasks/${editing.id}` : "/api/tasks", {
      method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    if (!res.ok) { toast.error("Save failed"); return; }
    toast.success(editing ? "Task updated" : "Task created");
    setShowForm(false); setEditing(null); setForm(emptyForm); load();
  };

  const toggleDone = async (t: Task) => {
    await fetch(`/api/tasks/${t.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: t.status === "DONE" ? "TODO" : "DONE" }) });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    toast.success("Task deleted");
    load();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleDragStart = (e: DragStartEvent) => {
    setActiveTask(tasks.find((t) => t.id === e.active.id) ?? null);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveTask(null);
    const task = tasks.find((t) => t.id === e.active.id);
    const target = e.over?.id as string | undefined;
    if (!task || !target || !KANBAN.includes(target) || task.status === target) return;

    const previous = tasks;
    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: target } : t)));
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: target }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Moved to ${label(target)}`);
    } catch {
      setTasks(previous);
      toast.error("Could not update task status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <div className="flex gap-2">
          <Button variant={view === "kanban" ? "primary" : "secondary"} onClick={() => setView("kanban")}>Kanban</Button>
          <Button variant={view === "list" ? "primary" : "secondary"} onClick={() => setView("list")}>List</Button>
          <Button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm((v) => !v); }}>+ New Task</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search tasks..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-[180px]">
          <option value="">All statuses</option>
          {KANBAN.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </Select>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Status</Label><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{KANBAN.map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select></div>
            <div><Label>Priority</Label><Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{["LOW", "MEDIUM", "HIGH", "URGENT"].map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select></div>
            <div><Label>Project</Label><Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}><option value="">No project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
            <div><Label>Labels (comma separated)</Label><Input value={form.labels} onChange={(e) => setForm({ ...form, labels: e.target.value })} placeholder="bug, ui, ..." /></div>
            <div className="flex gap-2 md:col-span-2"><Button type="submit">{editing ? "Update" : "Create"}</Button><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button></div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />)}</div>
      ) : tasks.length === 0 ? (
        <EmptyState title="No tasks yet" description="Create your first task to start organizing your work." />
      ) : view === "kanban" ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {KANBAN.map((col) => (
              <DroppableColumn key={col} id={col} title={label(col)} count={tasks.filter((t) => t.status === col).length}>
                {tasks.filter((t) => t.status === col).map((t) => (
                  <DraggableTaskCard key={t.id} t={t} onEdit={openEdit} onDelete={remove} />
                ))}
              </DroppableColumn>
            ))}
          </div>
          <DragOverlay>
            {activeTask && (
              <div className="w-64 rounded-lg border border-brand-500 bg-white p-3 text-sm shadow-lg dark:bg-slate-950">
                <p className="font-medium">{activeTask.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <Card key={t.id} className="flex flex-wrap items-center justify-between gap-3 !p-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={t.status === "DONE"} onChange={() => toggleDone(t)} aria-label="Complete task" />
                <div>
                  <p className={`font-medium ${t.status === "DONE" ? "line-through opacity-60" : ""}`}>{t.title}</p>
                  <p className="text-xs text-slate-400">{t.project?.name ?? "No project"} · Due {formatDate(t.deadline)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColor(t.status)}>{label(t.status)}</Badge>
                <Badge className={priorityColor(t.priority)}>{label(t.priority)}</Badge>
                <Button variant="secondary" onClick={() => openEdit(t)}>Edit</Button>
                <Button variant="danger" onClick={() => remove(t.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
