import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Users2, Star, ArrowRight, Archive } from "lucide-react";
import { SupplierStatus } from "@prisma/client";

const STATUS_BADGE: Record<SupplierStatus, string> = {
  ACTIVE:   "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  ARCHIVED: "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

export default async function SuppliersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let suppliers: Awaited<ReturnType<typeof prisma.supplier.findMany>> = [];

  if (token) {
    try {
      const payload = await verifyToken(token);
      suppliers = await prisma.supplier.findMany({
        where: { companyId: payload.companyId },
        orderBy: [{ isPreferred: "desc" }, { name: "asc" }],
      });
    } catch { /* middleware handles redirect */ }
  }

  const active = suppliers.filter((s) => s.status === SupplierStatus.ACTIVE);
  const archived = suppliers.filter((s) => s.status === SupplierStatus.ARCHIVED);

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Suppliers</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {active.length} active · {archived.length} archived
          </p>
        </div>
        <Link href="/dashboard/suppliers/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus size={15} /> New Supplier
        </Link>
      </div>

      {suppliers.length === 0 ? (
        <div className="rounded-xl border py-20 flex flex-col items-center justify-center gap-3"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
            <Users2 size={26} className="text-blue-600" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No suppliers yet</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Add your first supplier to start managing procurement.</p>
          <Link href="/dashboard/suppliers/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors mt-1">
            <Plus size={14} /> New Supplier
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}>
                {["Supplier", "Contact", "Category", "Payment Terms", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {s.isPreferred && <Star size={13} className="text-amber-500 flex-shrink-0" fill="currentColor" />}
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-secondary)" }}>
                    <p>{s.contactPerson}</p>
                    {s.email && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.email}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>{s.category ?? "—"}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>{s.paymentTerms ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {s.status === SupplierStatus.ARCHIVED && <Archive size={12} className="text-gray-400" />}
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[s.status]}`}>{s.status}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/suppliers/${s.id}`} className="text-blue-600 hover:text-blue-700">
                      <ArrowRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
