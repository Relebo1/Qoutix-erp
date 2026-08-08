import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { ContractStatus } from "@prisma/client";

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
  const contract = await prisma.contract.findFirst({
    where: { id: Number(id), companyId: payload.companyId },
    include: { supplier: true },
  });

  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ contract });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const contract = await prisma.contract.findFirst({ where: { id: Number(id), companyId: payload.companyId } });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.contract.update({
    where: { id: Number(id) },
    data: { status: status as ContractStatus },
  });

  return NextResponse.json({ contract: updated });
}
