import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { RFQStatus } from "@prisma/client";

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
    const rfq = await prisma.rFQ.findFirst({
      where: { id: Number(id), companyId: payload.companyId },
      include: {
        items: true,
        suppliers: { include: { supplier: true }, orderBy: { supplier: { name: "asc" } } },
      },
    });
    if (!rfq) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ rfq });
  } catch (err: any) {
    console.error("RFQ GET error:", err);
    return NextResponse.json({ error: "Failed to fetch RFQ" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();

    const rfq = await prisma.rFQ.findFirst({ where: { id: Number(id), companyId: payload.companyId } });
    if (!rfq) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.type === "RECORD_QUOTE") {
      const { supplierId, quotedPrice, notes } = body;
      await prisma.rFQSupplier.updateMany({
        where: { rfqId: Number(id), supplierId: Number(supplierId) },
        data: { quotedPrice: Number(quotedPrice), notes: notes || null, respondedAt: new Date() },
      });
      if (rfq.status === RFQStatus.SENT) {
        await prisma.rFQ.update({ where: { id: Number(id) }, data: { status: RFQStatus.RESPONSES_RECEIVED } });
      }
      return NextResponse.json({ ok: true });
    }

    if (body.type === "AWARD") {
      await prisma.rFQ.update({
        where: { id: Number(id) },
        data: { awardedSupplierId: Number(body.supplierId), status: RFQStatus.CLOSED },
      });
      return NextResponse.json({ ok: true });
    }

    if (body.status) {
      await prisma.rFQ.update({ where: { id: Number(id) }, data: { status: body.status as RFQStatus } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err: any) {
    console.error("RFQ PATCH error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to update RFQ" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { deliveryDate, currency, notes, items, supplierIds, accentColor, bgColor, fontColor, fontFamily } = await req.json();

    const rfq = await prisma.rFQ.findFirst({ where: { id: Number(id), companyId: payload.companyId } });
    if (!rfq) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (rfq.status !== RFQStatus.DRAFT) return NextResponse.json({ error: "Only draft RFQs can be edited." }, { status: 400 });

    await prisma.rFQItem.deleteMany({ where: { rfqId: Number(id) } });
    await prisma.rFQSupplier.deleteMany({ where: { rfqId: Number(id) } });

    const updated = await prisma.rFQ.update({
      where: { id: Number(id) },
      data: {
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        currency: currency ?? "LSL",
        notes: notes || null,
        accentColor: accentColor || null,
        bgColor: bgColor || null,
        fontColor: fontColor || null,
        fontFamily: fontFamily || null,
        items: {
          create: items.map((i: { description: string; quantity: number; unit?: string }) => ({
            description: i.description,
            quantity: i.quantity,
            unit: i.unit || null,
          })),
        },
        suppliers: {
          create: (supplierIds as number[]).map((sid) => ({ supplierId: sid })),
        },
      },
      include: { items: true, suppliers: { include: { supplier: { select: { id: true, name: true } } } } },
    });
    return NextResponse.json({ rfq: updated });
  } catch (err: any) {
    console.error("RFQ PUT error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to update RFQ" }, { status: 500 });
  }
}
