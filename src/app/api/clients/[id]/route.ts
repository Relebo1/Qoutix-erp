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
  const { companyName, contactName, email, phone, address, industry, notes } = await req.json();

  const client = await prisma.client.findFirst({ where: { id: Number(id), companyId: payload.companyId } });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.client.update({
    where: { id: Number(id) },
    data: { companyName, contactName, email: email || null, phone: phone || null, address: address || null, industry: industry || null, notes: notes || null },
  });
  return NextResponse.json({ client: updated });
}
