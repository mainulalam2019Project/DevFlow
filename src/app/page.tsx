import Link from "next/link";
import {
  BarChart3, KanbanSquare, GraduationCap, BellRing, Search, Layers,
  CheckCircle2, ArrowRight, Code2, Briefcase, Target,
} from "lucide-react";

const features = [
  { icon: Layers, title: "Project Management", desc: "Plan, track, and ship software projects with statuses, priorities, deadlines and progress." },
  { icon: KanbanSquare, title: "Task Boards", desc: "List and Kanban views for tasks with priorities, labels and due dates." },
  { icon: Briefcase, title: "Career Tracker", desc: "Track internships and jobs from saved to offer with a visual pipeline." },
  { icon: GraduationCap, title: "Skills & Learning", desc: "Visualize technical skills and break learning goals into milestones." },
  { icon: BarChart3, title: "Productivity Analytics", desc: "Coding sessions, study streaks and weekly reports that show real progress." },
  { icon: BellRing, title: "Smart Reminders", desc: "Never miss a task deadline, interview or application cutoff again." },
  { icon: Search, title: "Global Search", desc: "Find any project, task or application instantly with ⌘K." },
  { icon: Target, title: "Goal Tracking", desc: "Set targets, measure completion, and grow consistently every week." },
];

const steps = [
  { title: "Create your workspace", desc: "Sign up and set up your developer profile in under a minute." },
  { title: "Add projects & goals", desc: "Bring your projects, internships, skills and learning goals into one place." },
  { title: "Track and improve", desc: "Log activity, review analytics, and compound your growth every week." },
];

const testimonials = [
  { name: "Aisyah Rahman", role: "Software Engineering Student", quote: "DevFlow replaced my messy Notion pages and spreadsheets. I finally see where my hours actually go." },
  { name: "Daniel Kim", role: "Junior Frontend Developer", quote: "The internship pipeline tracker helped me land two interviews within a month." },
  { name: "Priya Nair", role: "CS Undergraduate", quote: "Weekly productivity reports keep me consistent. It feels like a real SaaS, not a school project." },
];

const faqs = [
  { q: "Is DevFlow free to use?", a: "Yes. The core workspace is free for students. A Pro tier with advanced analytics is coming later." },
  { q: "Do I need to set up a database?", a: "For self-hosting you need PostgreSQL, but the setup is a single migration command." },
  { q: "Can I import my existing data?", a: "CSV import for projects and applications is on the roadmap." },
  { q: "Does it work on mobile?", a: "Yes. The dashboard is fully responsive on phones and tablets." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-bold tracking-tight text-brand-600 dark:text-brand-400">DevFlow</Link>
          <div className="hidden items-center gap-6 text-sm text-slate-600 md:flex dark:text-slate-400">
            <a href="#features" className="hover:text-brand-600">Features</a>
            <a href="#how" className="hover:text-brand-600">How it works</a>
            <a href="#pricing" className="hover:text-brand-600">Pricing</a>
            <a href="#faq" className="hover:text-brand-600">FAQ</a>
          </div>
          <div className="flex gap-2">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900">Log in</Link>
            <Link href="/register" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500">Get Started</Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center">
        <p className="font-mono text-sm text-brand-600 dark:text-brand-400">For students, juniors & engineers</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">Build Better. Track Smarter. Grow Faster.</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-500 dark:text-slate-400">One workspace for managing your software projects, skills, productivity, and developer career.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-500">Get Started <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/login" className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900">View Demo</Link>
        </div>
        <p className="mt-3 text-xs text-slate-400">Demo account: demo@devflow.dev / password123</p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 md:grid-cols-4">
            {["Active Projects|6", "Completed Tasks|48", "Coding Hours|126h", "Applications|17"].map((s) => {
              const [k, v] = s.split("|");
              return (
                <div key={k} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-2xl font-bold">{v}</p>
                  <p className="text-xs text-slate-500">{k}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex h-40 items-end gap-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            {[40, 70, 55, 90, 65, 80, 95].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-brand-500/80" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold tracking-tight">Everything a dev student needs</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">From first commit to first job, DevFlow keeps the whole journey organized.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <Icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
              <p className="font-mono text-brand-600">0{i + 1}</p>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Productivity analytics that actually help</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">See exactly how your study and coding hours trend across the week. Spot your most productive days and double down on what works.</p>
            <ul className="mt-6 space-y-2 text-sm">
              {["Daily, weekly and monthly activity reports", "Time broken down by category", "Productivity streaks and goals"].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
            <div className="flex h-48 items-end gap-3">
              {[2, 4, 6, 3, 7, 5, 8].map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-brand-500/80" style={{ height: `${h * 10}%` }} />
                  <span className="text-xs text-slate-400">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold tracking-tight">Track your developer career</h2>
        <p className="mt-2 max-w-xl text-slate-500 dark:text-slate-400">Move internship applications through a real pipeline: Saved → Applied → Assessment → Interview → Offer. Measure your response and conversion rates over time.</p>
        <div className="mt-8 grid gap-3 md:grid-cols-5">
          {["Saved", "Applied", "Assessment", "Interview", "Offer"].map((stage, i) => (
            <div key={stage} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm font-semibold">{stage}</p>
              <p className="mt-6 text-2xl font-bold text-brand-600">{[3, 8, 4, 2, 1][i]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold tracking-tight">Loved by student developers</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
              <blockquote className="text-sm text-slate-600 dark:text-slate-300">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold">{t.name} <span className="font-normal text-slate-400">— {t.role}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold tracking-tight">Pricing</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-8 dark:border-slate-800">
            <h3 className="font-semibold">Student</h3>
            <p className="mt-2 text-4xl font-bold">$0<span className="text-base font-normal text-slate-400">/mo</span></p>
            <ul className="mt-6 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>Unlimited projects & tasks</li><li>Career pipeline & analytics</li><li>Skills & learning tracker</li>
            </ul>
            <Link href="/register" className="mt-6 inline-block rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900">Get Started</Link>
          </div>
          <div className="rounded-xl border-2 border-brand-600 p-8">
            <h3 className="font-semibold text-brand-600">Pro</h3>
            <p className="mt-2 text-4xl font-bold">$8<span className="text-base font-normal text-slate-400">/mo</span></p>
            <ul className="mt-6 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>Everything in Student</li><li>Advanced analytics & exports</li><li>Team workspaces (soon)</li>
            </ul>
            <Link href="/register" className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-500">Join Pro Waitlist</Link>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-3xl font-bold tracking-tight">FAQ</h2>
        <div className="mt-8 divide-y divide-slate-200 dark:divide-slate-800">
          {faqs.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-2xl bg-brand-600 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold">Start building your dev journey today</h2>
          <p className="mt-3 text-brand-100">Free for students. Set up in minutes.</p>
          <Link href="/register" className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">Create your account</Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 dark:text-slate-400">
          <p className="font-bold text-brand-600 dark:text-brand-400">DevFlow</p>
          <p>© {new Date().getFullYear()} DevFlow. Built for developers.</p>
          <a href="https://github.com" className="flex items-center gap-1 hover:text-brand-600"><Code2 className="h-4 w-4" /> GitHub</a>
        </div>
      </footer>
    </div>
  );
}
