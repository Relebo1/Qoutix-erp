import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Receipt, ArrowRight } from "lucide-react";
import { InvoiceStatus } from "@prisma/client";

const BADGE: Record<InvoiceStatus, string> = {
  DRAFT:     "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  SENT:      "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  VIEWED:    "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400",
  PARTIAL:   "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  PAID:      "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  OVERDUE:   "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  CANCELLED: "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

function fmt(val: number | string, currency: string) {
  return `${currency} ${Number(val).toLocaleString("en-LS", { minimumFractionDigits: 2 })}`;
}

export default async function InvoicesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let invoices: {
    id: number;
    invoiceNumber: string;
    status: InvoiceStatus;
    total: number | string;
    currency: string;
    issueDate: Date;
    dueDate: Date;
    client: { companyName: string };
  }[] = [];

  if (token) {
    try {
      const payload = await verifyToken(token);
      invoices = (await prisma.invoice.findMany({
        where: { companyId: payload.companyId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, invoiceNumber: true, status: true, total: true,
          currency: true, issueDate: true, dueDate: true,
          client: { select: { companyName: true } },
        },
      })).map((inv) => ({ ...inv, total: Number(inv.total) }));
    } catch { /* middleware handles redirect */ }
  }

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Invoices</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{invoices.length} total</p>
        </div>
        <Link href="/dashboard/invoices/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus size={15} /> New Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-xl border py-20 flex flex-col items-center justify-center gap-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950 flex items-center justify-center">
            <Receipt size={26} className="text-violet-600" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No invoices yet</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Create your first invoice to start tracking payments.</p>
          <Link href="/dashboard/invoices/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors mt-1">
            <Plus size={14} /> New Invoice
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}>
                {["Invoice #", "Client", "Amount", "Issue Date", "Due Date", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 font-medium" style={{ color: "var(--text-primary)" }}>{inv.invoiceNumber}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-secondary)" }}>{inv.client.companyName}</td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(inv.total, inv.currency)}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-muted)" }}>{new Date(inv.issueDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-muted)" }}>{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${BADGE[inv.status]}`}>{inv.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/invoices/${inv.id}`} className="text-blue-600 hover:text-blue-700">
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
