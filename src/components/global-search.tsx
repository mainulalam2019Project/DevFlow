"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface Results {
  projects: Array<{ id: string; name: string }>;
  tasks: Array<{ id: string; title: string }>;
  applications: Array<{ id: string; company: string; position: string }>;
  skills: Array<{ id: string; name: string }>;
  learning: Array<{ id: string; goal: string }>;
}

const EMPTY: Results = { projects: [], tasks: [], applications: [], skills: [], learning: [] };

export function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Results>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!q.trim()) { setResults(EMPTY); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setResults(await res.json());
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const sections: Array<{ title: string; items: Array<{ href: string; label: string }> }> = [
    { title: "Projects", items: results.projects.map((p) => ({ href: `/projects/${p.id}`, label: p.name })) },
    { title: "Tasks", items: results.tasks.map((t) => ({ href: "/tasks", label: t.title })) },
    { title: "Applications", items: results.applications.map((a) => ({ href: "/career", label: `${a.position} @ ${a.company}` })) },
    { title: "Skills", items: results.skills.map((s) => ({ href: "/skills", label: s.name })) },
    { title: "Learning", items: results.learning.map((l) => ({ href: "/learning", label: l.goal })) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20" onClick={onClose}>
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-950" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects, tasks, applications..." className="flex-1 bg-transparent text-sm outline-none" />
          <button onClick={onClose} aria-label="Close search"><X className="h-4 w-4 text-slate-400" /></button>
        </div>
        <div className="max-h-96 overflow-auto py-2">
          {loading && <p className="py-4 text-center text-sm text-slate-400">Searching...</p>}
          {!loading && q && sections.every((s) => s.items.length === 0) && <p className="py-4 text-center text-sm text-slate-400">No results for &quot;{q}&quot;</p>}
          {sections.map((section) =>
            section.items.length > 0 && (
              <div key={section.title} className="py-1">
                <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{section.title}</p>
                {section.items.map((item) => (
                  <Link key={item.label} href={item.href} onClick={onClose} className="block rounded-lg px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-900">
                    {item.label}
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
