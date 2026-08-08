import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { PurchaseOrderStatus } from "@prisma/client";

async function getPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try { return await verifyToken(token); } catch { return null; }
}

export async function GET() {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.purchaseOrder.findMany({
    where: { companyId: payload.companyId },
    orderBy: { createdAt: "desc" },
    include: {
      supplier: { select: { id: true, name: true } },
      items: true,
    },
  });

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { supplierId, rfqId, issueDate, expectedDate, currency, notes, items, status } = await req.json();

  if (!supplierId) return NextResponse.json({ error: "Supplier is required." }, { status: 400 });
  if (!items?.length) return NextResponse.json({ error: "At least one item is required." }, { status: 400 });

  const count = await prisma.purchaseOrder.count({ where: { companyId: payload.companyId } });
  const poNumber = `PO-${String(count + 1).padStart(4, "0")}`;

  const subtotal = items.reduce((sum: number, i: { quantity: number; unitPrice: number }) =>
    sum + i.quantity * i.unitPrice, 0);
  const tax = items.reduce((sum: number, i: { quantity: number; unitPrice: number; taxRate: number }) =>
    sum + i.quantity * i.unitPrice * (i.taxRate / 100), 0);

  const order = await prisma.purchaseOrder.create({
    data: {
      companyId: payload.companyId,
      supplierId: Number(supplierId),
      rfqId: rfqId ? Number(rfqId) : null,
      poNumber,
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      currency: currency ?? "LSL",
      subtotal,
      tax,
      total: subtotal + tax,
      status: status === "SENT" ? PurchaseOrderStatus.SENT : PurchaseOrderStatus.DRAFT,
      notes: notes || null,
      createdBy: Number(payload.sub),
      items: {
        create: items.map((i: { description: string; quantity: number; unitPrice: number; taxRate?: number; unit?: string }) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          taxRate: i.taxRate ?? 0,
          amount: i.quantity * i.unitPrice,
          unit: i.unit || null,
        })),
      },
    },
    include: { items: true, supplier: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ order }, { status: 201 });
}
