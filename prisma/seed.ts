import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@devflow.dev" },
    update: {},
    create: {
      name: "Alex Tan",
      email: "demo@devflow.dev",
      password,
      profile: {
        create: {
          username: "alextan",
          bio: "Software Engineering student passionate about full-stack development and AI.",
          university: "Asia Pacific University of Technology & Innovation",
          degree: "Bachelor of Software Engineering",
          graduationYear: 2027,
          location: "Kuala Lumpur, Malaysia",
          github: "https://github.com/alextan",
          linkedin: "https://linkedin.com/in/alextan",
          portfolio: "https://alextan.dev",
        },
      },
    },
  });

  const techs = ["React", "Next.js", "TypeScript", "Python", "Java", "PostgreSQL", "Flutter", "Tailwind CSS"];
  const techRecords: Record<string, { id: string }> = {};
  for (const name of techs) {
    techRecords[name] = await prisma.technology.upsert({ where: { name }, create: { name }, update: {} });
  }

  const projectsData = [
    { name: "AI Flood Risk Prediction", description: "ML system predicting flood risk using rainfall and river data.", status: "IN_PROGRESS", priority: "HIGH", progress: 65, techs: ["Python", "PostgreSQL"], githubUrl: "https://github.com/alextan/flood-risk" },
    { name: "Campus Food Ordering System", description: "Full-stack app for browsing menus and tracking orders.", status: "REVIEW", priority: "MEDIUM", progress: 85, techs: ["React", "Next.js", "PostgreSQL"], liveUrl: "https://campus-food.example.com" },
    { name: "Developer Portfolio", description: "Personal portfolio built with Next.js and Tailwind.", status: "COMPLETED", priority: "LOW", progress: 100, techs: ["Next.js", "Tailwind CSS"] },
    { name: "Mobile Expense Tracker", description: "Flutter app to track daily expenses with charts.", status: "PLANNING", priority: "MEDIUM", progress: 15, techs: ["Flutter"] },
  ] as const;

  const projects = [];
  for (const p of projectsData) {
    const existing = await prisma.project.findFirst({ where: { userId: user.id, name: p.name } });
    if (existing) {
      projects.push(existing);
      continue;
    }
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 45);
    const project = await prisma.project.create({
      data: {
        userId: user.id, name: p.name, description: p.description, status: p.status, priority: p.priority,
        progress: p.progress, githubUrl: "githubUrl" in p ? p.githubUrl : null, liveUrl: "liveUrl" in p ? p.liveUrl : null,
        startDate: new Date(), deadline,
      },
    });
    for (const t of p.techs) {
      await prisma.projectTechnology.create({ data: { projectId: project.id, technologyId: techRecords[t].id } });
    }
    projects.push(project);
  }

  const taskSeeds: Array<{ title: string; status: string; priority: string; labels: string[] }> = [
    { title: "Set up Prisma schema", status: "DONE", priority: "HIGH", labels: ["backend"] },
    { title: "Design landing page", status: "IN_PROGRESS", priority: "MEDIUM", labels: ["ui"] },
    { title: "Train flood model v2", status: "TODO", priority: "URGENT", labels: ["ml"] },
    { title: "Write API tests", status: "TODO", priority: "HIGH", labels: ["testing"] },
    { title: "Deploy to Vercel", status: "REVIEW", priority: "MEDIUM", labels: ["devops"] },
    { title: "Fix login redirect bug", status: "IN_PROGRESS", priority: "HIGH", labels: ["bug"] },
  ];
  for (const t of taskSeeds) {
    const existing = await prisma.task.findFirst({ where: { userId: user.id, title: t.title } });
    if (existing) continue;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    await prisma.task.create({
      data: { userId: user.id, title: t.title, status: t.status as never, priority: t.priority as never, labels: t.labels, projectId: projects[0]?.id, deadline },
    });
  }

  const apps = [
    { company: "Grab", position: "Software Engineer Intern", location: "Kuala Lumpur", jobType: "Internship", status: "INTERVIEW", salary: "RM 1,800/mo" },
    { company: "Shopee", position: "Full Stack Developer Intern", location: "Petaling Jaya", jobType: "Internship", status: "APPLIED" },
    { company: "Fave", position: "Mobile Developer Intern", location: "Singapore", jobType: "Internship", status: "ASSESSMENT" },
    { company: "AirAsia", position: "AI/ML Intern", location: "Sepang", jobType: "Internship", status: "SAVED" },
    { company: "Microsoft", position: "Software Engineering Intern", location: "Kuala Lumpur", jobType: "Internship", status: "OFFER", salary: "RM 3,500/mo" },
  ];
  for (const a of apps) {
    const existing = await prisma.jobApplication.findFirst({ where: { userId: user.id, company: a.company, position: a.position } });
    if (existing) continue;
    await prisma.jobApplication.create({
      data: { userId: user.id, company: a.company, position: a.position, location: a.location, jobType: a.jobType, status: a.status as never, salary: "salary" in a ? a.salary : null, applicationDate: new Date() },
    });
  }

  const skills = [
    { name: "JavaScript", category: "PROGRAMMING", proficiency: 85, years: 3 },
    { name: "TypeScript", category: "PROGRAMMING", proficiency: 75, years: 2 },
    { name: "React", category: "FRONTEND", proficiency: 80, years: 2.5 },
    { name: "Next.js", category: "FRONTEND", proficiency: 70, years: 1.5 },
    { name: "Python", category: "PROGRAMMING", proficiency: 78, years: 3 },
    { name: "Java", category: "PROGRAMMING", proficiency: 65, years: 2 },
    { name: "PostgreSQL", category: "DATABASE", proficiency: 60, years: 1 },
    { name: "Git", category: "TOOLS", proficiency: 85, years: 3 },
  ];
  for (const s of skills) {
    const existing = await prisma.skill.findFirst({ where: { userId: user.id, name: s.name } });
    if (existing) continue;
    await prisma.skill.create({ data: { userId: user.id, name: s.name, category: s.category as never, proficiency: s.proficiency, yearsExperience: s.years, lastPracticed: new Date() } });
  }

  const goalSeeds = [
    { goal: "Learn Next.js", category: "Web", resources: "nextjs.org/docs", milestones: ["App Router", "Server Components", "API Routes", "Authentication", "Deployment"] },
    { goal: "Master PostgreSQL", category: "Database", resources: "postgresql.org docs", milestones: ["Joins & indexes", "Transactions", "Prisma integration"] },
  ];
  for (const g of goalSeeds) {
    const existing = await prisma.learningGoal.findFirst({ where: { userId: user.id, goal: g.goal } });
    if (existing) continue;
    const target = new Date();
    target.setDate(target.getDate() + 60);
    await prisma.learningGoal.create({
      data: {
        userId: user.id, goal: g.goal, category: g.category, resources: g.resources, targetDate: target,
        status: "IN_PROGRESS", progress: 20,
        milestones: { create: g.milestones.map((title, i) => ({ title, done: i < 1 })) },
      },
    });
  }

  const typeCycle = ["CODING", "STUDY", "PROJECT", "LEARNING"] as const;
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const existing = await prisma.activity.findFirst({ where: { userId: user.id, date } });
    if (existing) continue;
    await prisma.activity.create({
      data: { userId: user.id, type: typeCycle[i % 4], duration: 30 + (i % 5) * 30, date, projectId: projects[i % projects.length]?.id },
    });
  }

  const notifCount = await prisma.notification.count({ where: { userId: user.id } });
  if (notifCount === 0) {
    await prisma.notification.createMany({
      data: [
        { userId: user.id, title: "Task deadline approaching", message: "'Train flood model v2' is due in 7 days." },
        { userId: user.id, title: "Interview tomorrow", message: "Software Engineer Intern interview with Grab." },
        { userId: user.id, title: "Application deadline", message: "Shopee internship application closes soon." },
      ],
    });
  }

  console.log("Seed complete. Demo login: demo@devflow.dev / password123");
}

main().finally(() => prisma.$disconnect());
