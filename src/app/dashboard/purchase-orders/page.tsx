import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { PurchaseOrderStatus } from "@prisma/client";

const BADGE: Record<PurchaseOrderStatus, string> = {
  DRAFT:              "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  APPROVED:           "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  SENT:               "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400",
  PARTIALLY_RECEIVED: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  COMPLETED:          "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  CANCELLED:          "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

function fmt(v: number, currency: string) {
  return `${currency} ${v.toLocaleString("en-LS", { minimumFractionDigits: 2 })}`;
}

export default async function PurchaseOrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  type OrderRow = Awaited<ReturnType<typeof prisma.purchaseOrder.findMany<{
    include: { supplier: { select: { name: true } }; items: true }
  }>>>[number];

  let orders: OrderRow[] = [];

  if (token) {
    try {
      const payload = await verifyToken(token);
      orders = await prisma.purchaseOrder.findMany({
        where: { companyId: payload.companyId },
        orderBy: { createdAt: "desc" },
        include: { supplier: { select: { name: true } }, items: true },
      });
    } catch { /* middleware handles redirect */ }
  }

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Purchase Orders</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{orders.length} total</p>
        </div>
        <Link href="/dashboard/purchase-orders/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus size={15} /> New Purchase Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border py-20 flex flex-col items-center justify-center gap-3"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
            <ShoppingBag size={26} className="text-blue-600" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No purchase orders yet</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Create a purchase order to formally place orders with suppliers.</p>
          <Link href="/dashboard/purchase-orders/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors mt-1">
            <Plus size={14} /> New Purchase Order
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}>
                {["PO #", "Supplier", "Items", "Total", "Issue Date", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 font-medium" style={{ color: "var(--text-primary)" }}>{o.poNumber}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-secondary)" }}>{o.supplier.name}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>{o.items.length} item{o.items.length !== 1 ? "s" : ""}</td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(Number(o.total), o.currency)}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>{new Date(o.issueDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${BADGE[o.status]}`}>
                      {o.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/purchase-orders/${o.id}`} className="text-blue-600 hover:text-blue-700">
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
