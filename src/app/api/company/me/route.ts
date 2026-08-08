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

export async function GET(req: NextRequest) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const noLogo = new URL(req.url).searchParams.get("noLogo") === "1";

  const company = await prisma.company.findUnique({
    where: { id: payload.companyId },
    select: { id: true, name: true, logo: !noLogo, email: true, phone: true, address: true, currency: true, website: true, vatNumber: true, registrationNumber: true, bankDetails: true, enabledModules: true, brandColor: true, brandBgColor: true, brandFontColor: true, brandFontFamily: true },
  });
  return NextResponse.json({ company });
}

export async function PATCH(req: NextRequest) {
  const payload = await getPayload();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, phone, address, website, currency, vatNumber, registrationNumber, bankDetails, logo, enabledModules, brandColor, brandBgColor, brandFontColor, brandFontFamily } = await req.json();

  const company = await prisma.company.update({
    where: { id: payload.companyId },
    data: {
      name:               name               || undefined,
      email:              email              || null,
      phone:              phone              || null,
      address:            address            || null,
      website:            website            || null,
      currency:           currency           || undefined,
      vatNumber:          vatNumber          || null,
      registrationNumber: registrationNumber || null,
      bankDetails:        bankDetails        || null,
      logo:               logo !== undefined ? logo : undefined,
      enabledModules:     enabledModules !== undefined ? enabledModules : undefined,
      brandColor:         brandColor         || undefined,
      brandBgColor:       brandBgColor       || undefined,
      brandFontColor:     brandFontColor     || undefined,
      brandFontFamily:    brandFontFamily    || undefined,
    },
  });

  return NextResponse.json({ company });
}
