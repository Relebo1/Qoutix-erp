import { NextResponse } from "next/server";
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

  const receipts = await prisma.receipt.findMany({
    where: { companyId: payload.companyId },
    orderBy: { createdAt: "desc" },
    include: {
      payment: { select: { paymentNumber: true, paymentMethod: true, reference: true, paymentDate: true } },
      invoice: { select: { invoiceNumber: true } },
      client:  { select: { companyName: true } },
    },
  });

  return NextResponse.json({ receipts });
}
