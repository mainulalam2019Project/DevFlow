import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "DevFlow <no-reply@devflow.local>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!resend) {
    // Development fallback: no provider configured, log the link instead of sending.
    console.log(`[email] RESEND_API_KEY not set. Password reset link for ${to}: ${resetUrl}`);
    return { sent: false };
  }
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Reset your DevFlow password",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto">
        <h2>Reset your password</h2>
        <p>We received a request to reset your DevFlow password. This link expires in 30 minutes.</p>
        <p><a href="${resetUrl}" style="background:#2846e6;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Reset password</a></p>
        <p style="color:#64748b;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
      </div>`,
  });
  return { sent: true };
}

export function buildResetUrl(rawToken: string) {
  return `${APP_URL}/reset-password/${rawToken}`;
}
