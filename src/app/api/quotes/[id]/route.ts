import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { QuotationStatus } from "@prisma/client";

async function getPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try { return await verifyToken(token); } catch { return null; }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const quote = await prisma.quotation.findFirst({
    where: { id: Number(id), companyId: payload.companyId },
  });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.quotation.update({
    where: { id: Number(id) },
    data: { status: status as QuotationStatus },
  });

  return NextResponse.json({ quotation: updated });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { clientId, currency, issueDate, expiryDate, discount, notes, items, status, accentColor, bgColor, fontColor, fontFamily } = await req.json();

  const quote = await prisma.quotation.findFirst({
    where: { id: Number(id), companyId: payload.companyId },
  });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const subtotal = items.reduce((s: number, i: { quantity: number; unitPrice: number }) => s + i.quantity * i.unitPrice, 0);
  const discountAmt = (subtotal * (discount ?? 0)) / 100;
  const tax = items.reduce((s: number, i: { quantity: number; unitPrice: number; taxRate: number }) => s + i.quantity * i.unitPrice * (1 - (discount ?? 0) / 100) * (i.taxRate / 100), 0);
  const total = subtotal - discountAmt + tax;

  await prisma.quotationItem.deleteMany({ where: { quotationId: Number(id) } });

  const updated = await prisma.quotation.update({
    where: { id: Number(id) },
    data: {
      clientId,
      currency,
      issueDate: new Date(issueDate),
      expiryDate: new Date(expiryDate),
      subtotal,
      discount: discountAmt,
      tax,
      total,
      notes: notes || null,
      status: status as QuotationStatus,
      accentColor: accentColor || null,
      bgColor: bgColor || null,
      fontColor: fontColor || null,
      fontFamily: fontFamily || null,
      items: {
        create: items.map((i: { description: string; quantity: number; unitPrice: number; taxRate: number }) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          taxRate: i.taxRate,
          amount: i.quantity * i.unitPrice,
        })),
      },
    },
  });

  return NextResponse.json({ quotation: updated });
}
