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

export async function GET() {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contracts = await prisma.contract.findMany({
    where: { companyId: payload.companyId },
    orderBy: { endDate: "asc" },
    include: { supplier: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ contracts });
}

export async function POST(req: NextRequest) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { supplierId, serviceType, startDate, endDate, renewalDate, value, currency, notes, accentColor, bgColor, fontColor, fontFamily, title, description, billingFrequency, paymentTerms, paymentDueDays, governingLaw, noticePeriod, supplierRegNumber, companyRegNumber } = await req.json();

  if (!supplierId) return NextResponse.json({ error: "Supplier is required." }, { status: 400 });
  if (!serviceType) return NextResponse.json({ error: "Service type is required." }, { status: 400 });
  if (!startDate || !endDate) return NextResponse.json({ error: "Start and end dates are required." }, { status: 400 });

  const count = await prisma.contract.count({ where: { companyId: payload.companyId } });
  const contractNumber = `CON-${String(count + 1).padStart(4, "0")}`;

  // Auto-set status based on dates
  const now = new Date();
  const end = new Date(endDate);
  const daysToExpiry = Math.floor((end.getTime() - now.getTime()) / 86400000);
  let status: ContractStatus = ContractStatus.ACTIVE;
  if (end < now) status = ContractStatus.EXPIRED;
  else if (daysToExpiry <= 30) status = ContractStatus.EXPIRING_SOON;

  const contract = await prisma.contract.create({
    data: {
      companyId: payload.companyId,
      supplierId: Number(supplierId),
      contractNumber,
      serviceType,
      startDate: new Date(startDate),
      endDate: end,
      renewalDate: renewalDate ? new Date(renewalDate) : null,
      value: value ? Number(value) : null,
      currency: currency ?? "LSL",
      status,
      notes: notes || null,
      accentColor: accentColor || null,
      bgColor: bgColor || null,
      fontColor: fontColor || null,
      fontFamily: fontFamily || null,
      title: title || null,
      description: description || null,
      billingFrequency: billingFrequency || null,
      paymentTerms: paymentTerms || null,
      paymentDueDays: paymentDueDays ? Number(paymentDueDays) : null,
      governingLaw: governingLaw || null,
      noticePeriod: noticePeriod ? Number(noticePeriod) : null,
      supplierRegNumber: supplierRegNumber || null,
      companyRegNumber: companyRegNumber || null,
    },
    include: { supplier: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ contract }, { status: 201 });
}
