import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await verifyToken(token).catch(() => null);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();

  const from      = payload.email;
  const to        = formData.get("to") as string;
  const cc        = formData.get("cc") as string | null;
  const subject   = formData.get("subject") as string;
  const body      = formData.get("body") as string;
  const links     = JSON.parse((formData.get("links") as string) || "[]") as { label: string; url: string }[];
  const files     = formData.getAll("attachments") as File[];
  const docType   = (formData.get("docType") as string) || "";
  const docId     = Number(formData.get("docId") || 0);
  const docNumber = (formData.get("docNumber") as string) || "";

  if (!to || !subject || !body) {
    return NextResponse.json({ error: "To, subject and body are required" }, { status: 400 });
  }

  const linksHtml = links.length
    ? `<div style="margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb">
        <p style="font-size:13px;font-weight:600;color:#374151;margin:0 0 8px">Links</p>
        ${links.map((l) => `<a href="${l.url}" style="display:block;font-size:13px;color:#2563eb;margin-bottom:4px">${l.label || l.url}</a>`).join("")}
       </div>`
    : "";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb">
      <div style="white-space:pre-wrap;font-size:14px;color:#111827;line-height:1.6">${body.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
      ${linksHtml}
      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb" />
      <p style="font-size:11px;color:#9ca3af">Sent via Quotix</p>
    </div>
  `;

  const attachments = await Promise.all(
    files.map(async (file) => ({
      filename: file.name,
      content:  Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    }))
  );

  let status: "SENT" | "FAILED" = "SENT";
  let sendError: string | null = null;

  try {
    await createTransport().sendMail({
      from:    `"Quotix" <${process.env.SMTP_USER}>`,
      replyTo: from,
      to,
      cc:      cc || undefined,
      subject,
      html,
      attachments,
    });
  } catch (err: any) {
    console.error("Email send error:", err?.message ?? err);
    status = "FAILED";
    sendError = "Failed to send email. Please try again.";
  }

  // Record log regardless of outcome
  if (docType && docId) {
    await prisma.emailLog.create({
      data: {
        companyId: payload.companyId,
        userId:    Number(payload.sub),
        docType,
        docId,
        docNumber,
        sender:    from,
        recipient: to,
        cc:        cc || null,
        subject,
        status,
      },
    }).catch(() => {/* non-fatal */});
  }

  if (sendError) return NextResponse.json({ error: sendError }, { status: 500 });
  return NextResponse.json({ ok: true, sender: from });
}
