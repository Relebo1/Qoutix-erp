import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { SupplierInvoiceStatus } from "@prisma/client";

async function getPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try { return await verifyToken(token); } catch { return null; }
}

export async function GET() {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await prisma.supplierInvoice.findMany({
    where: { companyId: payload.companyId },
    orderBy: { createdAt: "desc" },
    include: {
      supplier: { select: { id: true, name: true } },
      purchaseOrder: { select: { id: true, poNumber: true } },
    },
  });

  return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { supplierId, purchaseOrderId, invoiceNumber, invoiceDate, dueDate, currency, amount, tax, notes } = await req.json();

  if (!supplierId) return NextResponse.json({ error: "Supplier is required." }, { status: 400 });
  if (!invoiceNumber) return NextResponse.json({ error: "Invoice number is required." }, { status: 400 });
  if (!amount || Number(amount) <= 0) return NextResponse.json({ error: "Amount must be greater than 0." }, { status: 400 });

  const taxAmount = Number(tax ?? 0);
  try {
    const invoice = await prisma.supplierInvoice.create({
      data: {
        companyId: payload.companyId,
        supplierId: Number(supplierId),
        purchaseOrderId: purchaseOrderId ? Number(purchaseOrderId) : null,
        invoiceNumber,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: new Date(dueDate),
        currency: currency ?? "LSL",
        amount: Number(amount),
        tax: taxAmount,
        total: Number(amount) + taxAmount,
        status: SupplierInvoiceStatus.PENDING,
        notes: notes || null,
      },
      include: {
        supplier: { select: { id: true, name: true } },
        purchaseOrder: { select: { id: true, poNumber: true } },
      },
    });
    return NextResponse.json({ invoice }, { status: 201 });
  } catch (err: any) {
    console.error("Supplier invoice create error:", err);
    return NextResponse.json({ error: "Failed to create supplier invoice" }, { status: 500 });
  }
}
