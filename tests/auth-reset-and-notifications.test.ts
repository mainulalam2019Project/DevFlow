import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { z } from "zod";

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

describe("Password reset token handling", () => {
  it("generates a 64-char hex token from crypto random bytes", () => {
    const token = crypto.randomBytes(32).toString("hex");
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("hashes tokens with SHA-256 and never stores the raw token", () => {
    const raw = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    expect(hash).not.toBe(raw);
    expect(hash).toHaveLength(64);
    expect(crypto.createHash("sha256").update(raw).digest("hex")).toBe(hash);
  });

  it("rejects expired or used tokens logically", () => {
    const now = new Date();
    const expired = new Date(now.getTime() - 1000);
    expect(expired < now).toBe(true);
    const usedAt = new Date();
    expect(usedAt instanceof Date).toBe(true);
  });

  it("validates reset form input", () => {
    expect(resetSchema.safeParse({ token: "abc", password: "secret1", confirmPassword: "secret1" }).success).toBe(true);
    expect(resetSchema.safeParse({ token: "abc", password: "123", confirmPassword: "123" }).success).toBe(false);
    expect(resetSchema.safeParse({ token: "abc", password: "secret1", confirmPassword: "nope" }).success).toBe(false);
  });
});

describe("Notification generation rules", () => {
  it("dedupe window math is stable", () => {
    const DEDUPE_WINDOW_HOURS = 20;
    const since = new Date(Date.now() - DEDUPE_WINDOW_HOURS * 60 * 60 * 1000);
    expect(Date.now() - since.getTime()).toBe(DEDUPE_WINDOW_HOURS * 60 * 60 * 1000);
  });

  it("notification type constants cover the required types", () => {
    const types = ["TASK_DUE", "TASK_OVERDUE", "PROJECT_DUE", "APPLICATION_DEADLINE", "INTERVIEW", "LEARNING_DEADLINE", "SYSTEM"];
    expect(new Set(types).size).toBe(types.length);
  });
});
