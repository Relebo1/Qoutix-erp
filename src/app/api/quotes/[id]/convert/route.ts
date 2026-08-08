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

  const count = await prisma.invoice.count({ where: { companyId: payload.companyId } });
  const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

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

  // Mark quote as converted
  await prisma.quotation.update({
    where: { id: quote.id },
    data: { status: QuotationStatus.CONVERTED },
  });

  return NextResponse.json({ invoiceId: invoice.id }, { status: 201 });
}
