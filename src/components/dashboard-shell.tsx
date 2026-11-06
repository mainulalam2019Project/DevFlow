"use client";

import { useState } from "react";
import { Sidebar, navItems } from "./sidebar";
import { Topbar } from "./topbar";
import { Toaster } from "sonner";

export function DashboardShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuToggle={() => setOpen(true)} userName={userName} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export { navItems };
