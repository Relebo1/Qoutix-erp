import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { QuotationStatus, QuotationDocType } from "@prisma/client";

async function getPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try { return await verifyToken(token); } catch { return null; }
}

export async function GET() {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quotations = await prisma.quotation.findMany({
    where: { companyId: payload.companyId },
    orderBy: { createdAt: "desc" },
    include: { client: { select: { companyName: true } } },
  });

  return NextResponse.json({ quotations });
}

export async function POST(req: NextRequest) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId, currency, issueDate, expiryDate, discount, notes, items, status, docType, accentColor, bgColor, fontColor, fontFamily } = await req.json();

  if (!clientId || !issueDate || !expiryDate || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const count = await prisma.quotation.count({ where: { companyId: payload.companyId } });
  const quoteNumber = `QUO-${String(count + 1).padStart(4, "0")}`;

  const subtotal = items.reduce((s: number, i: { quantity: number; unitPrice: number }) => s + i.quantity * i.unitPrice, 0);
  const discountAmt = (subtotal * (discount ?? 0)) / 100;
  const tax = items.reduce((s: number, i: { quantity: number; unitPrice: number; taxRate: number }) => s + i.quantity * i.unitPrice * (1 - (discount ?? 0) / 100) * (i.taxRate / 100), 0);
  const total = subtotal - discountAmt + tax;

  const quotation = await prisma.quotation.create({
    data: {
      companyId: payload.companyId,
      clientId,
      quoteNumber,
      issueDate: new Date(issueDate),
      expiryDate: new Date(expiryDate),
      currency: currency ?? "LSL",
      subtotal,
      discount: discountAmt,
      tax,
      total,
      status: (status as QuotationStatus) ?? QuotationStatus.DRAFT,
      docType: (docType as QuotationDocType) ?? QuotationDocType.QUOTATION,
      createdBy: Number(payload.sub),
      notes: notes || null,
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

  return NextResponse.json({ quotation }, { status: 201 });
}
