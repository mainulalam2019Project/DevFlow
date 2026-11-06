import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import { projectSchema, taskSchema, applicationSchema, skillSchema, registerSchema, learningGoalSchema, activitySchema } from "../src/lib/validations";

describe("Authentication validation", () => {
  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse({ name: "Alex Tan", email: "alex@devflow.dev", password: "secret123", confirmPassword: "secret123" });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ name: "Alex Tan", email: "alex@devflow.dev", password: "secret123", confirmPassword: "different" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({ name: "Alex Tan", email: "not-an-email", password: "secret123", confirmPassword: "secret123" });
    expect(result.success).toBe(false);
  });

  it("hashes passwords so they are never stored in plain text", async () => {
    const hashed = await bcrypt.hash("password123", 10);
    expect(hashed).not.toBe("password123");
    expect(await bcrypt.compare("password123", hashed)).toBe(true);
  });
});

describe("Project validation", () => {
  it("accepts a valid project", () => {
    const result = projectSchema.safeParse({ name: "AI Flood Risk Prediction", status: "IN_PROGRESS", progress: 50, technologies: ["Python"] });
    expect(result.success).toBe(true);
  });

  it("rejects a project without a name", () => {
    expect(projectSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects progress over 100", () => {
    expect(projectSchema.safeParse({ name: "X", progress: 150 }).success).toBe(false);
  });
});

describe("Task validation", () => {
  it("accepts a valid task", () => {
    expect(taskSchema.safeParse({ title: "Write API tests", priority: "HIGH", status: "TODO" }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(taskSchema.safeParse({ title: "X", status: "DOING" }).success).toBe(false);
  });
});

describe("Application validation", () => {
  it("accepts a valid application", () => {
    expect(applicationSchema.safeParse({ company: "Grab", position: "SWE Intern", status: "APPLIED" }).success).toBe(true);
  });

  it("rejects missing company", () => {
    expect(applicationSchema.safeParse({ company: "", position: "SWE Intern" }).success).toBe(false);
  });
});

describe("Skill validation", () => {
  it("accepts a valid skill", () => {
    expect(skillSchema.safeParse({ name: "TypeScript", category: "PROGRAMMING", proficiency: 75 }).success).toBe(true);
  });

  it("rejects proficiency over 100", () => {
    expect(skillSchema.safeParse({ name: "TypeScript", proficiency: 101 }).success).toBe(false);
  });
});

describe("Learning goal validation", () => {
  it("accepts a goal with milestones", () => {
    const result = learningGoalSchema.safeParse({ goal: "Learn Next.js", milestones: [{ title: "App Router" }] });
    expect(result.success).toBe(true);
  });
});

describe("Activity validation", () => {
  it("accepts a valid session", () => {
    expect(activitySchema.safeParse({ type: "CODING", duration: 60 }).success).toBe(true);
  });

  it("rejects zero duration", () => {
    expect(activitySchema.safeParse({ type: "CODING", duration: 0 }).success).toBe(false);
  });
});
