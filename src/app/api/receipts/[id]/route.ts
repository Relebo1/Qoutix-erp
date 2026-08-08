import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { ReceiptStatus } from "@prisma/client";

async function getPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try { return await verifyToken(token); } catch { return null; }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const receipt = await prisma.receipt.findFirst({
    where: { id: Number(id), companyId: payload.companyId },
    include: {
      payment: true,
      invoice: { include: { items: true } },
      client:  true,
      company: true,
    },
  });

  if (!receipt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ receipt });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const receipt = await prisma.receipt.findFirst({
    where: { id: Number(id), companyId: payload.companyId },
  });
  if (!receipt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (receipt.status === ReceiptStatus.VOIDED) {
    return NextResponse.json({ error: "Receipt is already voided." }, { status: 400 });
  }

  const updated = await prisma.receipt.update({
    where: { id: Number(id) },
    data: { status: status as ReceiptStatus },
  });

  return NextResponse.json({ receipt: updated });
}
