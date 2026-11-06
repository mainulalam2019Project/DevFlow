"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        password: data.get("password"),
        confirmPassword: data.get("confirmPassword"),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Registration failed.");
      return;
    }
    router.push("/login?registered=1");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Link href="/" className="text-xl font-bold text-brand-600 dark:text-brand-400">DevFlow</Link>
        <h1 className="mt-6 text-2xl font-bold">Create your account</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-300">{error}</p>}
          {([["name", "Full name", "text"], ["email", "Email", "email"], ["password", "Password", "password"], ["confirmPassword", "Confirm password", "password"]] as const).map(([id, label, type]) => (
            <div key={id}>
              <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
              <input id={id} name={id} type={type} required minLength={id === "password" || id === "confirmPassword" ? 6 : 2} className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700" />
            </div>
          ))}
          <button disabled={loading} className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60">
            {loading ? "Creating..." : "Sign up"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Have an account? <Link href="/login" className="font-medium text-brand-600 hover:underline">Log in</Link></p>
      </div>
    </div>
  );
}
