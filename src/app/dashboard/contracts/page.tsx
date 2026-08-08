import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, FileCheck, ArrowRight, AlertTriangle } from "lucide-react";
import { ContractStatus } from "@prisma/client";

const BADGE: Record<ContractStatus, string> = {
  ACTIVE:        "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  EXPIRING_SOON: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  EXPIRED:       "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  CANCELLED:     "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

function fmt(v: number | null, currency: string) {
  if (v == null) return "—";
  return `${currency} ${v.toLocaleString("en-LS", { minimumFractionDigits: 2 })}`;
}

export default async function ContractsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  type ContractRow = Awaited<ReturnType<typeof prisma.contract.findMany<{
    include: { supplier: { select: { name: true } } }
  }>>>[number];

  let contracts: ContractRow[] = [];

  if (token) {
    try {
      const payload = await verifyToken(token);
      contracts = await prisma.contract.findMany({
        where: { companyId: payload.companyId },
        orderBy: { endDate: "asc" },
        include: { supplier: { select: { name: true } } },
      });
    } catch { /* middleware handles redirect */ }
  }

  const expiringSoon = contracts.filter((c) => c.status === ContractStatus.EXPIRING_SOON);

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Contracts</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{contracts.length} total</p>
        </div>
        <Link href="/dashboard/contracts/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus size={15} /> New Contract
        </Link>
      </div>

      {expiringSoon.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <span className="font-semibold">{expiringSoon.length} contract{expiringSoon.length !== 1 ? "s" : ""}</span> expiring within 30 days.
          </p>
        </div>
      )}

      {contracts.length === 0 ? (
        <div className="rounded-xl border py-20 flex flex-col items-center justify-center gap-3"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
            <FileCheck size={26} className="text-blue-600" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No contracts yet</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Track recurring service agreements with your suppliers.</p>
          <Link href="/dashboard/contracts/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors mt-1">
            <Plus size={14} /> New Contract
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}>
                {["Contract #", "Supplier", "Service", "Value", "End Date", "Renewal", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 font-medium" style={{ color: "var(--text-primary)" }}>{c.contractNumber}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-secondary)" }}>{c.supplier.name}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>{c.serviceType}</td>
                  <td className="px-5 py-3.5 text-xs font-medium" style={{ color: "var(--text-primary)" }}>{fmt(c.value ? Number(c.value) : null, c.currency)}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>{new Date(c.endDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    {c.renewalDate ? new Date(c.renewalDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${BADGE[c.status]}`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/contracts/${c.id}`} className="text-blue-600 hover:text-blue-700">
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
