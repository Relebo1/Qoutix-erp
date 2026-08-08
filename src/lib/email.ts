import nodemailer from "nodemailer";

function createTransport() {
  return nodemailer.createTransport({
    host:       process.env.SMTP_HOST,
    port:       Number(process.env.SMTP_PORT),
    secure:     Number(process.env.SMTP_PORT) === 465,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function send(to: string, subject: string, html: string) {
  try {
    await createTransport().sendMail({ from: process.env.SMTP_FROM, to, subject, html });
  } catch (err: any) {
    console.error(`Email send failed [${subject}] → ${to}:`, err?.message ?? err);
  }
}

export async function sendVerificationEmail(to: string, firstName: string, token: string) {
  const link = `${APP_URL}/api/auth/verify-email?token=${token}`;
  return send(to, "Verify your Quotix email address", `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
      <h2 style="margin:0 0 8px;color:#111827;font-size:20px">Hi ${firstName}, verify your email</h2>
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px">Click the button below to verify your email address. This link expires in 24 hours.</p>
      <a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none">Verify Email</a>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">If you didn't create a Quotix account, you can safely ignore this email.</p>
    </div>
  `);
}

export async function sendPasswordResetEmail(to: string, firstName: string, token: string) {
  const link = `${APP_URL}/reset-password?token=${token}`;
  return send(to, "Reset your Quotix password", `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
      <h2 style="margin:0 0 8px;color:#111827;font-size:20px">Hi ${firstName}, reset your password</h2>
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px">Click the button below to set a new password. This link expires in 1 hour.</p>
      <a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none">Reset Password</a>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
  `);
}

export async function sendQuotationEmail(to: string, contactName: string, quoteNumber: string, senderEmail: string) {
  return send(to, `${quoteNumber} — Quotation from Quotix`, `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
      <h2 style="margin:0 0 8px;color:#111827;font-size:20px">Hi ${contactName},</h2>
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px">Please find your quotation <strong>${quoteNumber}</strong> attached. Feel free to reach out if you have any questions.</p>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">Sent via Quotix · Reply to ${senderEmail}</p>
    </div>
  `);
}
