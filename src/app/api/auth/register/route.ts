import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { UserRole, CompanyUserStatus } from "@/lib/enums";
import { initDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  await initDb();

  const { firstName, lastName, email, password, companyName } =
    await req.json();

  if (!firstName || !lastName || !email || !password || !companyName) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const ownerRole = await prisma.role.findUnique({
    where: { name: UserRole.OWNER },
  });
  if (!ownerRole) {
    return NextResponse.json({ error: "Roles not seeded" }, { status: 500 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      companyUsers: {
        create: {
          status: CompanyUserStatus.ACTIVE,
          role: { connect: { id: ownerRole.id } },
          company: {
            create: { name: companyName },
          },
        },
      },
    },
    include: { companyUsers: { include: { company: true } } },
  });

  const companyUser = user.companyUsers[0];

  const token = await signToken({
    sub: String(user.id),
    email: user.email,
    companyId: companyUser.companyId,
    role: UserRole.OWNER,
  });

  const res = NextResponse.json(
    {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: UserRole.OWNER,
        companyId: companyUser.companyId,
        companyName: companyUser.company.name,
      },
    },
    { status: 201 }
  );

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}
