import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await verifyToken(token).catch(() => null);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const docType = searchParams.get("docType");
  const docId   = Number(searchParams.get("docId"));

  if (!docType || !docId) return NextResponse.json({ logs: [] });

  const logs = await prisma.emailLog.findMany({
    where: { companyId: payload.companyId, docType, docId },
    orderBy: { sentAt: "desc" },
  });

  return NextResponse.json({ logs });
}
