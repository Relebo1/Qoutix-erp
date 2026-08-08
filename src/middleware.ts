import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { UserRole, Permission, hasPermission } from "@/lib/enums";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/api/quotes", "/api/invoices", "/api/clients", "/api/products", "/api/payments", "/api/reports"];

// Route → required permission
const ROUTE_PERMISSIONS: { prefix: string; permission: Permission; methods?: string[] }[] = [
  { prefix: "/api/quotes",    permission: Permission.VIEW_QUOTE },
  { prefix: "/api/invoices",  permission: Permission.VIEW_INVOICE },
  { prefix: "/api/clients",   permission: Permission.VIEW_CLIENT },
  { prefix: "/api/products",  permission: Permission.VIEW_PRODUCT },
  { prefix: "/api/payments",  permission: Permission.RECORD_PAYMENT },
  { prefix: "/api/reports",   permission: Permission.VIEW_REPORTS },
  { prefix: "/dashboard/settings", permission: Permission.MANAGE_SETTINGS },
  { prefix: "/dashboard/users",    permission: Permission.MANAGE_USERS },
];

// Routes only OWNER or ADMIN can access
const ADMIN_ONLY_PREFIXES = ["/dashboard/settings", "/dashboard/users"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("token")?.value;
  if (!token) return redirectToLogin(req);

  try {
    const payload = await verifyToken(token);
    const role = payload.role as UserRole;

    // Admin-only check
    if (ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) {
      if (role !== UserRole.OWNER && role !== UserRole.ADMIN) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Permission check
    const match = ROUTE_PERMISSIONS.find((r) => pathname.startsWith(r.prefix));
    if (match && !hasPermission(role, match.permission)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Forward user info via headers
    const headers = new Headers(req.headers);
    headers.set("x-user-id", payload.sub);
    headers.set("x-user-email", payload.email);
    headers.set("x-user-role", role);
    headers.set("x-company-id", String(payload.companyId));

    return NextResponse.next({ request: { headers } });
  } catch {
    return redirectToLogin(req);
  }
}

function redirectToLogin(req: NextRequest) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/quotes/:path*", "/api/invoices/:path*", "/api/clients/:path*", "/api/products/:path*", "/api/payments/:path*", "/api/reports/:path*"],
};
