import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { PaymentMethod } from "@prisma/client";
import { recordPayment } from "@/lib/payments";

async function getPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try { return await verifyToken(token); } catch { return null; }
}

export async function GET() {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payments = await prisma.payment.findMany({
    where: { companyId: payload.companyId },
    orderBy: { paymentDate: "desc" },
    include: {
      invoice: { select: { invoiceNumber: true, currency: true, client: { select: { companyName: true } } } },
      receipt: { select: { id: true, receiptNumber: true } },
    },
  });

  return NextResponse.json({ payments });
}

export async function POST(req: NextRequest) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { invoiceId, amount, paymentMethod, reference, paymentDate, notes } = await req.json();

  if (!invoiceId || !amount || !paymentMethod || !paymentDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (Number(amount) <= 0) {
    return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 });
  }

  try {
    const { payment } = await recordPayment({
      companyId: payload.companyId,
      invoiceId: Number(invoiceId),
      amount: Number(amount),
      paymentMethod: paymentMethod as PaymentMethod,
      paymentDate: new Date(paymentDate),
      reference: reference || null,
      notes: notes || null,
      recordedBy: Number(payload.sub),
    });
    return NextResponse.json({ payment }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to record payment.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
