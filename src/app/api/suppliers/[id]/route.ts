import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { SupplierStatus } from "@prisma/client";

async function getPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try { return await verifyToken(token); } catch { return null; }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supplier = await prisma.supplier.findFirst({
    where: { id: Number(id), companyId: payload.companyId },
    include: {
      rfqSuppliers: {
        include: { rfq: { select: { rfqNumber: true, status: true, createdAt: true, deliveryDate: true } } },
        orderBy: { rfq: { createdAt: "desc" } },
        take: 10,
      },
    },
  });

  if (!supplier) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ supplier });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const {
    name, contactPerson, email, phone, address, category,
    productsServices, paymentTerms, vatNumber, taxNumber,
    isPreferred, notes,
  } = await req.json();

  if (!name || !contactPerson) {
    return NextResponse.json({ error: "Name and contact person are required." }, { status: 400 });
  }

  const supplier = await prisma.supplier.updateMany({
    where: { id: Number(id), companyId: payload.companyId },
    data: {
      name, contactPerson,
      email: email || null,
      phone: phone || null,
      address: address || null,
      category: category || null,
      productsServices: productsServices || null,
      paymentTerms: paymentTerms || null,
      vatNumber: vatNumber || null,
      taxNumber: taxNumber || null,
      isPreferred: isPreferred ?? false,
      notes: notes || null,
    },
  });

  if (!supplier.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const updated = await prisma.supplier.updateMany({
    where: { id: Number(id), companyId: payload.companyId },
    data: { status: status as SupplierStatus },
  });

  if (!updated.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
