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

async function nextRFQNumber(companyId: number): Promise<string> {
  const result = await prisma.$queryRaw<{ max: bigint | null }[]>`
    SELECT MAX(CAST(SUBSTRING(rfq_number, 5) AS UNSIGNED)) as max
    FROM rfqs
    WHERE company_id = ${companyId} AND rfq_number LIKE 'RFQ-%'
  `;
  const max = Number(result[0]?.max ?? 0);
  return `RFQ-${String(max + 1).padStart(4, "0")}`;
}

export async function GET() {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rfqs = await prisma.rFQ.findMany({
    where: { companyId: payload.companyId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      suppliers: { include: { supplier: { select: { id: true, name: true } } } },
    },
  });

  return NextResponse.json({ rfqs });
}

export async function POST(req: NextRequest) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { deliveryDate, currency, notes, items, supplierIds, accentColor, bgColor, fontColor, fontFamily } = await req.json();

  if (!items?.length) return NextResponse.json({ error: "At least one item is required." }, { status: 400 });
  if (!supplierIds?.length) return NextResponse.json({ error: "Select at least one supplier." }, { status: 400 });

  try {
    const rfqNumber = await nextRFQNumber(payload.companyId);

    const rfq = await prisma.rFQ.create({
      data: {
        companyId: payload.companyId,
        rfqNumber,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        currency: currency ?? "LSL",
        status: RFQStatus.DRAFT,
        notes: notes || null,
        accentColor: accentColor || null,
        bgColor: bgColor || null,
        fontColor: fontColor || null,
        fontFamily: fontFamily || null,
        createdBy: Number(payload.sub),
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

    return NextResponse.json({ rfq }, { status: 201 });
  } catch (err: any) {
    console.error("RFQ create error:", err);
    return NextResponse.json({ error: "Failed to create RFQ" }, { status: 500 });
  }
}
