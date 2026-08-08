import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { QuotationStatus, InvoiceStatus } from "@prisma/client";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await verifyToken(token);
  const { id } = await params;

  const quote = await prisma.quotation.findFirst({
    where: { id: Number(id), companyId: payload.companyId },
    include: { items: true },
  });

  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (quote.status !== QuotationStatus.ACCEPTED) {
    return NextResponse.json({ error: "Only accepted quotes can be converted" }, { status: 400 });
  }

  const result = await prisma.$queryRaw<{ max: bigint | null }[]>`
    SELECT MAX(CAST(SUBSTRING(invoice_number, 5) AS UNSIGNED)) as max
    FROM invoices
    WHERE company_id = ${payload.companyId} AND invoice_number LIKE 'INV-%'
  `;
  const invoiceNumber = `INV-${String(Number(result[0]?.max ?? 0) + 1).padStart(4, "0")}`;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  try {
    const invoice = await prisma.invoice.create({
      data: {
        companyId: payload.companyId,
        clientId: quote.clientId,
        quotationId: quote.id,
        invoiceNumber,
        issueDate: new Date(),
        dueDate,
        currency: quote.currency,
        subtotal: quote.subtotal,
        tax: quote.tax,
        discount: quote.discount,
        total: quote.total,
        status: InvoiceStatus.DRAFT,
        notes: quote.notes,
        items: {
          create: quote.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            price: i.unitPrice,
            tax: Number(i.quantity) * Number(i.unitPrice) * (Number(i.taxRate) / 100),
            amount: i.amount,
          })),
        },
      },
    });

    await prisma.quotation.update({
      where: { id: quote.id },
      data: { status: QuotationStatus.CONVERTED },
    });

    return NextResponse.json({ invoiceId: invoice.id }, { status: 201 });
  } catch (err: any) {
    console.error("Invoice convert error:", err);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
