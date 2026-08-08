import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?verified=invalid", req.url));
  }

  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token, emailVerified: false },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/login?verified=invalid", req.url));
  }

  if (user.emailVerifyExpiry && user.emailVerifyExpiry < new Date()) {
    return NextResponse.redirect(new URL("/login?verified=expired", req.url));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null, emailVerifyExpiry: null },
  });

  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}
