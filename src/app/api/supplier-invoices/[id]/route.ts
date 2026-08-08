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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const invoice = await prisma.supplierInvoice.findFirst({
      where: { id: Number(id), companyId: payload.companyId },
      include: {
        supplier: true,
        purchaseOrder: { select: { id: true, poNumber: true } },
      },
    });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ invoice });
  } catch (err: any) {
    console.error("Supplier invoice GET error:", err);
    return NextResponse.json({ error: "Failed to fetch supplier invoice" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { status } = await req.json();

    const invoice = await prisma.supplierInvoice.findFirst({ where: { id: Number(id), companyId: payload.companyId } });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.supplierInvoice.update({
      where: { id: Number(id) },
      data: { status: status as SupplierInvoiceStatus },
    });
    return NextResponse.json({ invoice: updated });
  } catch (err: any) {
    console.error("Supplier invoice PATCH error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to update supplier invoice" }, { status: 500 });
  }
}
