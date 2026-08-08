import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { SupplierStatus } from "@prisma/client";

async function getPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try { return await verifyToken(token); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const search = req.nextUrl.searchParams.get("search") ?? "";
  const category = req.nextUrl.searchParams.get("category") ?? "";

  const suppliers = await prisma.supplier.findMany({
    where: {
      companyId: payload.companyId,
      ...(search ? { name: { contains: search } } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: [{ isPreferred: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ suppliers });
}

export async function POST(req: NextRequest) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    name, contactPerson, email, phone, address, category,
    productsServices, paymentTerms, vatNumber, taxNumber,
    isPreferred, notes,
  } = await req.json();

  if (!name || !contactPerson) {
    return NextResponse.json({ error: "Name and contact person are required." }, { status: 400 });
  }

  try {
    const supplier = await prisma.supplier.create({
      data: {
        companyId: payload.companyId,
        name, contactPerson,
        email: email || null,
        phone: phone || null,
        address: address || null,
        category: category || null,
        productsServices: productsServices || null,
        paymentTerms: paymentTerms || null,
        vatNumber: vatNumber || null,
        taxNumber: taxNumber || null,
        isPreferred: isPreferred ?? false,
        notes: notes || null,
        status: SupplierStatus.ACTIVE,
      },
    });
    return NextResponse.json({ supplier }, { status: 201 });
  } catch (err: any) {
    console.error("Supplier create error:", err);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}
