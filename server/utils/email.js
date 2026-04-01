import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "BetterThanYou <noreply@betterthanyou.gg>";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export async function sendVerificationEmail({ email, token }) {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your BetterThanYou account",
    html: `
      <h2>Welcome to BetterThanYou!</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

export async function sendPasswordResetEmail({ email, token }) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your BetterThanYou password",
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `,
  });
}
