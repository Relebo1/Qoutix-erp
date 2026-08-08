import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Users, Mail, Phone, MapPin, Building2, ArrowRight } from "lucide-react";

export default async function ClientsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let clients: {
    id: number;
    companyName: string;
    contactName: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    industry: string | null;
    _count: { quotations: number; invoices: number };
  }[] = [];

  if (token) {
    try {
      const payload = await verifyToken(token);
      clients = await prisma.client.findMany({
        where: { companyId: payload.companyId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
          phone: true,
          address: true,
          industry: true,
          _count: { select: { quotations: true, invoices: true } },
        },
      });
    } catch { /* middleware handles redirect */ }
  }

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Clients</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {clients.length} {clients.length === 1 ? "client" : "clients"}
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} /> Add Client
        </Link>
      </div>

      {/* Empty state */}
      {clients.length === 0 ? (
        <div className="rounded-xl border py-20 flex flex-col items-center justify-center gap-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
            <Users size={26} className="text-blue-600" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No clients yet</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Add your first client to start creating quotes and invoices.</p>
          <Link href="/dashboard/clients/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors mt-1">
            <Plus size={14} /> Add Client
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/clients/${c.id}`}
              className="rounded-xl border p-5 flex flex-col gap-3 hover:border-blue-400 transition-colors group"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              {/* Avatar + name */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">{c.companyName[0].toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-blue-600 transition-colors" style={{ color: "var(--text-primary)" }}>{c.companyName}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{c.contactName}</p>
                  </div>
                </div>
                <ArrowRight size={15} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-0.5" />
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                {c.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={12} style={{ color: "var(--text-muted)" }} className="flex-shrink-0" />
                    <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{c.email}</span>
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={12} style={{ color: "var(--text-muted)" }} className="flex-shrink-0" />
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{c.phone}</span>
                  </div>
                )}
                {c.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={12} style={{ color: "var(--text-muted)" }} className="flex-shrink-0" />
                    <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{c.address}</span>
                  </div>
                )}
                {c.industry && (
                  <div className="flex items-center gap-2">
                    <Building2 size={12} style={{ color: "var(--text-muted)" }} className="flex-shrink-0" />
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{c.industry}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{c._count.quotations}</span> quotes
                </span>
                <span className="w-px h-3" style={{ backgroundColor: "var(--border)" }} />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{c._count.invoices}</span> invoices
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
