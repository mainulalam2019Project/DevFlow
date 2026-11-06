import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED", "ARCHIVED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  startDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  githubUrl: z.string().url().optional().nullable().or(z.literal("")),
  liveUrl: z.string().url().optional().nullable().or(z.literal("")),
  progress: z.coerce.number().min(0).max(100).optional(),
  technologies: z.array(z.string()).optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  deadline: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  labels: z.array(z.string()).optional(),
});

export const applicationSchema = z.object({
  company: z.string().min(1).max(120),
  position: z.string().min(1).max(120),
  location: z.string().optional().nullable(),
  jobType: z.string().optional().nullable(),
  applicationDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  status: z.enum(["SAVED", "APPLIED", "ASSESSMENT", "INTERVIEW", "TECHNICAL_INTERVIEW", "OFFER", "REJECTED"]).optional(),
  salary: z.string().optional().nullable(),
  jobUrl: z.string().url().optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
});

export const skillSchema = z.object({
  name: z.string().min(1).max(60),
  category: z.enum(["PROGRAMMING", "FRONTEND", "BACKEND", "DATABASE", "DEVOPS", "CLOUD", "TOOLS", "SOFT_SKILLS"]).optional(),
  proficiency: z.coerce.number().min(0).max(100).optional(),
  yearsExperience: z.coerce.number().min(0).max(50).optional().nullable(),
  lastPracticed: z.string().optional().nullable(),
});

export const learningGoalSchema = z.object({
  goal: z.string().min(1).max(160),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().optional().nullable(),
  progress: z.coerce.number().min(0).max(100).optional(),
  targetDate: z.string().optional().nullable(),
  resources: z.string().optional().nullable(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).optional(),
  milestones: z.array(z.object({ title: z.string().min(1), done: z.boolean().optional() })).optional(),
});

export const activitySchema = z.object({
  type: z.enum(["STUDY", "CODING", "PROJECT", "LEARNING"]),
  duration: z.coerce.number().int().min(1).max(1440),
  projectId: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  username: z.string().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  university: z.string().optional().nullable(),
  degree: z.string().optional().nullable(),
  graduationYear: z.coerce.number().min(1900).max(2100).optional().nullable(),
  location: z.string().optional().nullable(),
  github: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  portfolio: z.string().optional().nullable(),
});
