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

export async function GET() {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: Number(payload.sub) },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await req.json();
  const where = ids?.length
    ? { id: { in: ids as number[] }, userId: Number(payload.sub) }
    : { userId: Number(payload.sub), read: false };

  await prisma.notification.updateMany({ where, data: { read: true } });
  return NextResponse.json({ ok: true });
}
