"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, Button, Input, Textarea, Label } from "@/components/ui";

interface ProfileData {
  name: string; email: string; image: string | null;
  profile: {
    username: string | null; bio: string | null; university: string | null; degree: string | null;
    graduationYear: number | null; location: string | null; github: string | null; linkedin: string | null; portfolio: string | null;
  } | null;
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((d: ProfileData) => {
      setData(d);
      setForm({
        name: d.name ?? "", email: d.email ?? "", username: d.profile?.username ?? "", bio: d.profile?.bio ?? "",
        university: d.profile?.university ?? "", degree: d.profile?.degree ?? "", graduationYear: d.profile?.graduationYear ? String(d.profile.graduationYear) : "",
        location: d.profile?.location ?? "", github: d.profile?.github ?? "", linkedin: d.profile?.linkedin ?? "", portfolio: d.profile?.portfolio ?? "",
      });
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, graduationYear: form.graduationYear === "" ? null : Number(form.graduationYear) };
    const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { toast.error("Save failed"); return; }
    toast.success("Profile updated");
  };

  if (!data) return <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            {data.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-4 text-lg font-semibold">{data.name}</h2>
          <p className="text-sm text-slate-400">{data.profile?.username ? `@${data.profile.username}` : data.email}</p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{data.profile?.bio || "No bio yet."}</p>
          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-slate-400">University</dt><dd>{data.profile?.university ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Degree</dt><dd>{data.profile?.degree ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Graduation</dt><dd>{data.profile?.graduationYear ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Location</dt><dd>{data.profile?.location ?? "—"}</dd></div>
          </dl>
          <div className="mt-4 flex gap-3 text-sm">
            {data.profile?.github && <a className="text-brand-600 hover:underline" href={data.profile.github} target="_blank" rel="noreferrer">GitHub</a>}
            {data.profile?.linkedin && <a className="text-brand-600 hover:underline" href={data.profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
            {data.profile?.portfolio && <a className="text-brand-600 hover:underline" href={data.profile.portfolio} target="_blank" rel="noreferrer">Portfolio</a>}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            {[
              ["name", "Full name"], ["email", "Email"], ["username", "Username"], ["university", "University"],
              ["degree", "Degree"], ["graduationYear", "Graduation year"], ["location", "Location"], ["github", "GitHub URL"],
              ["linkedin", "LinkedIn URL"], ["portfolio", "Portfolio URL"],
            ].map(([key, labelText]) => (
              <div key={key}>
                <Label>{labelText}</Label>
                <Input value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div className="md:col-span-2">
              <Label>Bio</Label>
              <Textarea rows={3} value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div><Button type="submit">Save changes</Button></div>
          </form>
        </Card>
      </div>
    </div>
  );
}
