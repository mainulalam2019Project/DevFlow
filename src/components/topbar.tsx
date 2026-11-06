"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { GlobalSearch } from "./global-search";
import Link from "next/link";

export function Topbar({ onMenuToggle, userName }: { onMenuToggle: () => void; userName: string }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string | null; read: boolean; createdAt: string; relatedEntityType: string | null; relatedEntityId: string | null }>>([]);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    const res = await fetch("/api/notifications");
    if (res.ok) setNotifications(await res.json());
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setNotifOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;
  const [nowTs] = useState(() => Date.now());

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    load();
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, read: true }) });
    load();
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
    load();
  };

  const hrefFor = (n: { relatedEntityType: string | null; relatedEntityId: string | null }) => {
    if (!n.relatedEntityType || !n.relatedEntityId) return null;
    switch (n.relatedEntityType) {
      case "project": return `/projects/${n.relatedEntityId}`;
      case "task": return "/tasks";
      case "application": return "/career";
      case "learning": return "/learning";
      default: return null;
    }
  };

  const relativeTime = (iso: string, now: number) => {
    const diff = now - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <button className="md:hidden" onClick={onMenuToggle} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      <button onClick={() => setSearchOpen(true)} className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900">
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="ml-auto hidden rounded border border-slate-200 px-1.5 text-xs sm:inline dark:border-slate-700">⌘K</kbd>
      </button>
      <div className="relative" ref={ref}>
        <button aria-label="Notifications" onClick={() => { setNotifOpen((v) => !v); load(); }} className="relative rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          <Bell className="h-4 w-4" />
          {unread > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white">{unread}</span>}
        </button>
        {notifOpen && (
          <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between px-2 py-1">
              <p className="text-sm font-semibold">Notifications</p>
              <button onClick={markAllRead} className="text-xs text-brand-600 hover:underline">Mark all read</button>
            </div>
            <div className="max-h-80 overflow-auto">
              {notifications.length === 0 && <p className="px-2 py-6 text-center text-sm text-slate-400">No notifications</p>}
              {notifications.map((n) => {
                const href = hrefFor(n);
                const inner = (
                  <>
                    <p className="font-medium">{n.title}</p>
                    {n.message && <p className="text-xs text-slate-500">{n.message}</p>}
                    <p className="mt-0.5 text-[11px] text-slate-400">{relativeTime(n.createdAt, nowTs)}</p>
                  </>
                );
                return (
                  <div key={n.id} className={`group rounded-lg px-2 py-2 text-sm ${n.read ? "opacity-60" : ""}`}>
                    {href ? (
                      <Link href={href} onClick={() => { markRead(n.id); setNotifOpen(false); }} className="block">{inner}</Link>
                    ) : (
                      <button className="block w-full text-left" onClick={() => markRead(n.id)}>{inner}</button>
                    )}
                    <div className="mt-1 flex gap-2 text-[11px]">
                      {!n.read && <button onClick={() => markRead(n.id)} className="text-brand-600 hover:underline">Mark read</button>}
                      <button onClick={(e) => deleteNotification(n.id, e)} className="text-red-500 hover:underline">Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <ThemeToggle />
      <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300" aria-label="Profile">
        {userName.charAt(0).toUpperCase()}
      </Link>
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
