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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, description, price, taxRate, unit } = await req.json();

  const product = await prisma.product.findFirst({ where: { id: Number(id), companyId: payload.companyId } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.product.update({
    where: { id: Number(id) },
    data: { name, description: description || null, price, taxRate: taxRate ?? 0, unit: unit || null },
  });
  return NextResponse.json({ product: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const product = await prisma.product.findFirst({ where: { id: Number(id), companyId: payload.companyId } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.product.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
