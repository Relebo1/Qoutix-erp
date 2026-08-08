import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { UserRole, CompanyUserStatus } from "@/lib/enums";
import { initDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  await initDb();

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      companyUsers: {
        where: { status: CompanyUserStatus.ACTIVE },
        include: { role: true, company: true },
        take: 1,
      },
    },
  });

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (!user.emailVerified) {
    return NextResponse.json({ error: "Please verify your email before signing in. Check your inbox for the verification link." }, { status: 403 });
  }

  const companyUser = user.companyUsers[0];
  if (!companyUser) {
    return NextResponse.json({ error: "No active company found" }, { status: 403 });
  }

  const role = companyUser.role.name as UserRole;

  const token = await signToken({
    sub: String(user.id),
    email: user.email,
    companyId: companyUser.companyId,
    role,
    emailVerified: true,
  });

  const res = NextResponse.json({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role,
      companyId: companyUser.companyId,
      companyName: companyUser.company.name,
    },
  });

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}
