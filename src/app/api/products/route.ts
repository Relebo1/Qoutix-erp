import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

async function getPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try { return await verifyToken(token); } catch { return null; }
}

export async function GET() {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { companyId: payload.companyId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true, price: true, taxRate: true, unit: true },
  });

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, price, taxRate, unit } = await req.json();
  if (!name || price === undefined) return NextResponse.json({ error: "Name and price are required" }, { status: 400 });

  const product = await prisma.product.create({
    data: {
      companyId: payload.companyId,
      name,
      description: description || null,
      price,
      taxRate: taxRate ?? 0,
      unit: unit || null,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
