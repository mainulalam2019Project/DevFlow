import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export const PROJECT_STATUSES = ["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED", "ARCHIVED"] as const;
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;
export const APPLICATION_STATUSES = ["SAVED", "APPLIED", "ASSESSMENT", "INTERVIEW", "TECHNICAL_INTERVIEW", "OFFER", "REJECTED"] as const;
export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export function label(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function priorityColor(p: string) {
  switch (p) {
    case "URGENT": return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
    case "HIGH": return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
    case "MEDIUM": return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    default: return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
}

export function statusColor(s: string) {
  switch (s) {
    case "COMPLETED": case "DONE": case "OFFER": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
    case "IN_PROGRESS": case "APPLIED": return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    case "REVIEW": case "ASSESSMENT": case "INTERVIEW": case "TECHNICAL_INTERVIEW": return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
    case "REJECTED": case "ARCHIVED": return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
    default: return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
}
