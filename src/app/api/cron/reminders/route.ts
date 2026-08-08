import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus, QuotationStatus } from "@prisma/client";

// Protect with a shared secret in production: check Authorization header
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dayMs = 86_400_000;
  const in1 = new Date(today.getTime() + dayMs);
  const in3 = new Date(today.getTime() + 3 * dayMs);
  const over3 = new Date(today.getTime() - 3 * dayMs);
  const over7 = new Date(today.getTime() - 7 * dayMs);
  const over14 = new Date(today.getTime() - 14 * dayMs);

  let created = 0;

  // ── 1. Invoice send-deadline reminders (plannedSendDate) ──────────────────
  const draftInvoices = await prisma.invoice.findMany({
    where: {
      status: InvoiceStatus.DRAFT,
      plannedSendDate: { not: null },
    },
    include: {
      company: { include: { companyUsers: { include: { user: true } } } },
    },
  });

  for (const inv of draftInvoices) {
    const psd = inv.plannedSendDate!;
    const psdDay = new Date(psd.getFullYear(), psd.getMonth(), psd.getDate());
    const diffDays = Math.round((psdDay.getTime() - today.getTime()) / dayMs);

    let title: string | null = null;
    if (diffDays === 3) title = `Send reminder: ${inv.invoiceNumber} due to send in 3 days`;
    else if (diffDays === 1) title = `Send reminder: ${inv.invoiceNumber} due to send tomorrow`;
    else if (diffDays === 0) title = `Send reminder: ${inv.invoiceNumber} should be sent today`;

    if (!title) continue;

    for (const cu of inv.company.companyUsers) {
      const exists = await prisma.notification.findFirst({
        where: { userId: cu.userId, title, createdAt: { gte: today } },
      });
      if (exists) continue;
      await prisma.notification.create({
        data: {
          userId: cu.userId,
          type: "SEND_REMINDER",
          title,
          message: `Invoice ${inv.invoiceNumber} has a planned send date of ${psd.toLocaleDateString()}.`,
          link: `/dashboard/invoices/${inv.id}`,
        },
      });
      created++;
    }
  }

  // ── 2. Client payment reminders (overdue invoices) ────────────────────────
  const unpaidInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
    },
    include: {
      company: { include: { companyUsers: { include: { user: true } } } },
    },
  });

  for (const inv of unpaidInvoices) {
    const dueDay = new Date(inv.dueDate.getFullYear(), inv.dueDate.getMonth(), inv.dueDate.getDate());
    const diffDays = Math.round((today.getTime() - dueDay.getTime()) / dayMs); // positive = overdue

    let title: string | null = null;
    if (diffDays === -3) title = `Payment due soon: ${inv.invoiceNumber} due in 3 days`;
    else if (diffDays === 0) title = `Payment due today: ${inv.invoiceNumber}`;
    else if (diffDays === 3) title = `Overdue: ${inv.invoiceNumber} is 3 days overdue`;
    else if (diffDays === 7) title = `Overdue: ${inv.invoiceNumber} is 7 days overdue`;
    else if (diffDays === 14) title = `Overdue: ${inv.invoiceNumber} is 14 days overdue`;

    if (!title) continue;

    // Mark invoice OVERDUE if past due
    if (diffDays > 0 && inv.status !== InvoiceStatus.OVERDUE) {
      await prisma.invoice.update({ where: { id: inv.id }, data: { status: InvoiceStatus.OVERDUE } });
    }

    for (const cu of inv.company.companyUsers) {
      const exists = await prisma.notification.findFirst({
        where: { userId: cu.userId, title, createdAt: { gte: today } },
      });
      if (exists) continue;
      await prisma.notification.create({
        data: {
          userId: cu.userId,
          type: "PAYMENT_REMINDER",
          title,
          message: `Invoice ${inv.invoiceNumber} — due ${inv.dueDate.toLocaleDateString()}.`,
          link: `/dashboard/invoices/${inv.id}`,
        },
      });
      created++;
    }
  }

  // ── 3. Quotation expiry reminders ─────────────────────────────────────────
  const expiringQuotes = await prisma.quotation.findMany({
    where: {
      status: { in: [QuotationStatus.SENT, QuotationStatus.VIEWED] },
      expiryDate: { gte: in3, lte: new Date(in3.getTime() + dayMs - 1) },
    },
    include: { company: { include: { companyUsers: true } } },
  });

  for (const q of expiringQuotes) {
    const title = `Quotation ${q.quoteNumber} expires in 3 days`;
    for (const cu of q.company.companyUsers) {
      const exists = await prisma.notification.findFirst({
        where: { userId: cu.userId, title, createdAt: { gte: today } },
      });
      if (exists) continue;
      await prisma.notification.create({
        data: {
          userId: cu.userId,
          type: "QUOTE_EXPIRY",
          title,
          message: `Follow up with the client before the quotation expires on ${q.expiryDate.toLocaleDateString()}.`,
          link: `/dashboard/quotes/${q.id}`,
        },
      });
      created++;
    }
  }

  // suppress unused-var warnings
  void [over3, over7, over14, in1];

  return NextResponse.json({ ok: true, notificationsCreated: created });
}
