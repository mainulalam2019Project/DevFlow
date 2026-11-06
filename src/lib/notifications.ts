import { prisma } from "@/lib/prisma";

export const NotificationType = {
  TASK_DUE: "TASK_DUE",
  TASK_OVERDUE: "TASK_OVERDUE",
  PROJECT_DUE: "PROJECT_DUE",
  APPLICATION_DEADLINE: "APPLICATION_DEADLINE",
  INTERVIEW: "INTERVIEW",
  LEARNING_DEADLINE: "LEARNING_DEADLINE",
  SYSTEM: "SYSTEM",
} as const;

interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message?: string | null;
  relatedEntityId?: string | null;
  relatedEntityType?: string | null;
}

const DEDUPE_WINDOW_HOURS = 20;

/**
 * Creates a notification unless an unread notification of the same type for the
 * same entity was created within the dedupe window. Keeps the job idempotent.
 */
export async function createNotification(input: CreateNotificationInput) {
  const since = new Date(Date.now() - DEDUPE_WINDOW_HOURS * 60 * 60 * 1000);
  const existing = await prisma.notification.findFirst({
    where: {
      userId: input.userId,
      type: input.type,
      relatedEntityId: input.relatedEntityId ?? null,
      createdAt: { gte: since },
    },
  });
  if (existing) return null;
  return prisma.notification.create({ data: input });
}

export const createTaskDeadlineNotification = (userId: string, task: { id: string; title: string; deadline: Date | null }, overdue: boolean) =>
  createNotification({
    userId,
    type: overdue ? NotificationType.TASK_OVERDUE : NotificationType.TASK_DUE,
    title: overdue ? `Task overdue: ${task.title}` : `Task due soon: ${task.title}`,
    message: task.deadline ? `Deadline ${task.deadline.toUTCString()}` : null,
    relatedEntityId: task.id,
    relatedEntityType: "task",
  });

export const createProjectDeadlineNotification = (userId: string, project: { id: string; name: string; deadline: Date | null }) =>
  createNotification({
    userId,
    type: NotificationType.PROJECT_DUE,
    title: `Project deadline approaching: ${project.name}`,
    message: project.deadline ? `Due ${project.deadline.toUTCString()}` : null,
    relatedEntityId: project.id,
    relatedEntityType: "project",
  });

export const createApplicationDeadlineNotification = (userId: string, app: { id: string; company: string; position: string; deadline: Date | null }) =>
  createNotification({
    userId,
    type: NotificationType.APPLICATION_DEADLINE,
    title: `Application deadline: ${app.position} @ ${app.company}`,
    message: app.deadline ? `Closes ${app.deadline.toUTCString()}` : null,
    relatedEntityId: app.id,
    relatedEntityType: "application",
  });

export const createInterviewNotification = (userId: string, app: { id: string; company: string; position: string }) =>
  createNotification({
    userId,
    type: NotificationType.INTERVIEW,
    title: `Interview stage: ${app.position} @ ${app.company}`,
    message: "Your application moved to the interview stage.",
    relatedEntityId: app.id,
    relatedEntityType: "application",
  });

export const createLearningDeadlineNotification = (userId: string, goal: { id: string; goal: string; targetDate: Date | null }) =>
  createNotification({
    userId,
    type: NotificationType.LEARNING_DEADLINE,
    title: `Learning goal deadline: ${goal.goal}`,
    message: goal.targetDate ? `Target ${goal.targetDate.toUTCString()}` : null,
    relatedEntityId: goal.id,
    relatedEntityType: "learning",
  });

/**
 * Scans a user's data and creates notifications for:
 *  - tasks due within 2 days (and overdue tasks not done)
 *  - projects due within 3 days
 *  - application deadlines within 3 days
 *  - applications currently in INTERVIEW / TECHNICAL_INTERVIEW status
 *  - learning goals with target date within 3 days
 * Idempotent via createNotification's dedupe window.
 */
export async function generateNotificationsForUser(userId: string) {
  const now = new Date();
  const in2 = new Date(now.getTime() + 2 * 86400000);
  const in3 = new Date(now.getTime() + 3 * 86400000);

  const [tasks, overdueTasks, projects, applications, interviews, goals] = await Promise.all([
    prisma.task.findMany({ where: { userId, status: { not: "DONE" }, deadline: { gte: now, lte: in2 } }, select: { id: true, title: true, deadline: true } }),
    prisma.task.findMany({ where: { userId, status: { not: "DONE" }, deadline: { lt: now } }, select: { id: true, title: true, deadline: true }, take: 20 }),
    prisma.project.findMany({ where: { userId, status: { notIn: ["COMPLETED", "ARCHIVED"] }, deadline: { gte: now, lte: in3 } }, select: { id: true, name: true, deadline: true } }),
    prisma.jobApplication.findMany({ where: { userId, deadline: { gte: now, lte: in3 } }, select: { id: true, company: true, position: true, deadline: true } }),
    prisma.jobApplication.findMany({ where: { userId, status: { in: ["INTERVIEW", "TECHNICAL_INTERVIEW"] } }, select: { id: true, company: true, position: true } }),
    prisma.learningGoal.findMany({ where: { userId, status: { not: "COMPLETED" }, targetDate: { gte: now, lte: in3 } }, select: { id: true, goal: true, targetDate: true } }),
  ]);

  const created: string[] = [];
  const push = (n: { id: string } | null) => { if (n) created.push(n.id); };
  for (const t of tasks) push(await createTaskDeadlineNotification(userId, t, false));
  for (const t of overdueTasks) push(await createTaskDeadlineNotification(userId, t, true));
  for (const p of projects) push(await createProjectDeadlineNotification(userId, p));
  for (const a of applications) push(await createApplicationDeadlineNotification(userId, a));
  for (const i of interviews) push(await createInterviewNotification(userId, i));
  for (const g of goals) push(await createLearningDeadlineNotification(userId, g));
  return created.length;
}

export async function generateNotificationsForAllUsers() {
  const users = await prisma.user.findMany({ select: { id: true } });
  let total = 0;
  for (const u of users) total += await generateNotificationsForUser(u.id);
  return total;
}
