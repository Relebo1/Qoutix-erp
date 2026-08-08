import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

async function getCompanyId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const payload = await verifyToken(token);
    return payload.companyId;
  } catch { return null; }
}

export async function GET() {
  const companyId = await getCompanyId();
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    select: { id: true, companyName: true, contactName: true, email: true, phone: true, address: true, industry: true },
  });

  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const companyId = await getCompanyId();
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { companyName, contactName, email, phone, address, industry, notes } = await req.json();

  if (!companyName || !contactName) {
    return NextResponse.json({ error: "Company name and contact name are required" }, { status: 400 });
  }

  try {
    const client = await prisma.client.create({
      data: { companyId, companyName, contactName, email: email || null, phone: phone || null, address: address || null, industry: industry || null, notes: notes || null },
    });
    return NextResponse.json({ client }, { status: 201 });
  } catch (err: any) {
    console.error("Client create error:", err);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
