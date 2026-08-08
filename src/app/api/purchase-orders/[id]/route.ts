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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const order = await prisma.purchaseOrder.findFirst({
      where: { id: Number(id), companyId: payload.companyId },
      include: {
        supplier: true,
        items: true,
        supplierInvoices: { select: { id: true, invoiceNumber: true, total: true, status: true } },
      },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (err: any) {
    console.error("PO GET error:", err);
    return NextResponse.json({ error: "Failed to fetch purchase order" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { status } = await req.json();

    const order = await prisma.purchaseOrder.findFirst({ where: { id: Number(id), companyId: payload.companyId } });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.purchaseOrder.update({
      where: { id: Number(id) },
      data: { status: status as PurchaseOrderStatus },
    });
    return NextResponse.json({ order: updated });
  } catch (err: any) {
    console.error("PO PATCH error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to update purchase order" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const order = await prisma.purchaseOrder.findFirst({ where: { id: Number(id), companyId: payload.companyId } });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (order.status !== PurchaseOrderStatus.DRAFT) {
      return NextResponse.json({ error: "Only draft orders can be deleted." }, { status: 400 });
    }
    await prisma.purchaseOrder.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("PO DELETE error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to delete purchase order" }, { status: 500 });
  }
}
