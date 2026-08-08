import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { InvoiceStatus } from "@prisma/client";

async function getPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try { return await verifyToken(token); } catch { return null; }
}

async function nextInvoiceNumber(companyId: number): Promise<string> {
  const result = await prisma.$queryRaw<{ max: bigint | null }[]>`
    SELECT MAX(CAST(SUBSTRING(invoice_number, 5) AS UNSIGNED)) as max
    FROM invoices
    WHERE company_id = ${companyId} AND invoice_number LIKE 'INV-%'
  `;
  const max = Number(result[0]?.max ?? 0);
  return `INV-${String(max + 1).padStart(4, "0")}`;
}

export async function GET() {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await prisma.invoice.findMany({
    where: { companyId: payload.companyId },
    orderBy: { createdAt: "desc" },
    include: { client: { select: { companyName: true } } },
  });

  return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId, currency, issueDate, dueDate, plannedSendDate, discount, notes, items, status, accentColor, bgColor, fontColor, fontFamily } = await req.json();

  if (!clientId || !issueDate || !dueDate || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const subtotal = items.reduce((s: number, i: { quantity: number; unitPrice: number }) => s + i.quantity * i.unitPrice, 0);
  const discountAmt = (subtotal * (discount ?? 0)) / 100;
  const tax = items.reduce((s: number, i: { quantity: number; unitPrice: number; taxRate: number }) => s + i.quantity * i.unitPrice * (1 - (discount ?? 0) / 100) * (i.taxRate / 100), 0);
  const total = subtotal - discountAmt + tax;

  try {
    const invoiceNumber = await nextInvoiceNumber(payload.companyId);

    const invoice = await prisma.invoice.create({
      data: {
        companyId: payload.companyId,
        clientId,
        invoiceNumber,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        currency: currency ?? "LSL",
        subtotal,
        discount: discountAmt,
        tax,
        total,
        status: (status as InvoiceStatus) ?? InvoiceStatus.DRAFT,
        plannedSendDate: plannedSendDate ? new Date(plannedSendDate) : null,
        notes: notes || null,
        accentColor: accentColor || null,
        bgColor: bgColor || null,
        fontColor: fontColor || null,
        fontFamily: fontFamily || null,
        items: {
          create: items.map((i: { description: string; quantity: number; unitPrice: number; taxRate: number }) => ({
            description: i.description,
            quantity: i.quantity,
            price: i.unitPrice,
            tax: i.quantity * i.unitPrice * (i.taxRate / 100),
            amount: i.quantity * i.unitPrice,
          })),
        },
      },
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (err: any) {
    console.error("Invoice create error:", err);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
