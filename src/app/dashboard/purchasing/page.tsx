import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users2, ClipboardList, TrendingDown, ArrowRight,
  Plus, Star, Clock, CheckCircle, AlertCircle, ShoppingBag, FileText, FileCheck, AlertTriangle,
} from "lucide-react";
import { RFQStatus, SupplierStatus, PurchaseOrderStatus, SupplierInvoiceStatus, ContractStatus } from "@prisma/client";

const PO_BADGE: Record<PurchaseOrderStatus, string> = {
  DRAFT:              "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  APPROVED:           "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  SENT:               "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400",
  PARTIALLY_RECEIVED: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  COMPLETED:          "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  CANCELLED:          "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

const RFQ_BADGE: Record<RFQStatus, string> = {
  DRAFT:              "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  SENT:               "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  RESPONSES_RECEIVED: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  CLOSED:             "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  CANCELLED:          "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

function RFQStatusIcon({ status }: { status: RFQStatus }) {
  if (status === RFQStatus.CLOSED) return <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />;
  if (status === RFQStatus.SENT || status === RFQStatus.RESPONSES_RECEIVED) return <Clock size={13} className="text-blue-500 flex-shrink-0" />;
  if (status === RFQStatus.CANCELLED) return <AlertCircle size={13} className="text-gray-400 flex-shrink-0" />;
  return <AlertCircle size={13} className="text-gray-400 flex-shrink-0" />;
}

function timeAgo(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  return `${Math.floor(diff / 86400)}d ago`;
}

export default async function PurchasingDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let companyId = 0;
  if (token) {
    try {
      const payload = await verifyToken(token);
      companyId = payload.companyId;
    } catch { /* middleware handles redirect */ }
  }

  const [
    activeSuppliers,
    preferredSuppliers,
    openRFQs,
    draftRFQs,
    closedRFQs,
    openPOs,
    pendingInvoices,
    expiringContracts,
    recentRFQs,
    recentSuppliers,
    recentPOs,
  ] = await Promise.all([
    prisma.supplier.count({ where: { companyId, status: SupplierStatus.ACTIVE } }),
    prisma.supplier.count({ where: { companyId, isPreferred: true } }),
    prisma.rFQ.count({ where: { companyId, status: { in: [RFQStatus.SENT, RFQStatus.RESPONSES_RECEIVED] } } }),
    prisma.rFQ.count({ where: { companyId, status: RFQStatus.DRAFT } }),
    prisma.rFQ.count({ where: { companyId, status: RFQStatus.CLOSED } }),
    prisma.purchaseOrder.count({ where: { companyId, status: { in: [PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.SENT, PurchaseOrderStatus.PARTIALLY_RECEIVED] } } }),
    prisma.supplierInvoice.count({ where: { companyId, status: { in: [SupplierInvoiceStatus.PENDING, SupplierInvoiceStatus.OVERDUE] } } }),
    prisma.contract.count({ where: { companyId, status: ContractStatus.EXPIRING_SOON } }),
    prisma.rFQ.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        suppliers: { include: { supplier: { select: { name: true } } } },
        items: true,
      },
    }),
    prisma.supplier.findMany({
      where: { companyId, status: SupplierStatus.ACTIVE },
      orderBy: [{ isPreferred: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
    prisma.purchaseOrder.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { supplier: { select: { name: true } } },
    }),
  ]);

  const stats = [
    {
      label: "Active Suppliers",
      value: String(activeSuppliers),
      sub: `${preferredSuppliers} preferred`,
      icon: Users2,
      color: "text-blue-700 dark:text-blue-300",
      bg: "bg-blue-50 dark:bg-blue-950",
      border: "border-blue-100 dark:border-blue-900",
      href: "/dashboard/suppliers",
    },
    {
      label: "Open RFQs",
      value: String(openRFQs),
      sub: `${draftRFQs} draft`,
      icon: ClipboardList,
      color: openRFQs > 0 ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300",
      bg: openRFQs > 0 ? "bg-amber-50 dark:bg-amber-950" : "bg-emerald-50 dark:bg-emerald-950",
      border: openRFQs > 0 ? "border-amber-100 dark:border-amber-900" : "border-emerald-100 dark:border-emerald-900",
      href: "/dashboard/rfqs",
    },
    {
      label: "Open Purchase Orders",
      value: String(openPOs),
      sub: `${closedRFQs} RFQs closed`,
      icon: ShoppingBag,
      color: openPOs > 0 ? "text-sky-700 dark:text-sky-300" : "text-emerald-700 dark:text-emerald-300",
      bg: openPOs > 0 ? "bg-sky-50 dark:bg-sky-950" : "bg-emerald-50 dark:bg-emerald-950",
      border: openPOs > 0 ? "border-sky-100 dark:border-sky-900" : "border-emerald-100 dark:border-emerald-900",
      href: "/dashboard/purchase-orders",
    },
    {
      label: "Pending Invoices",
      value: String(pendingInvoices),
      sub: expiringContracts > 0 ? `${expiringContracts} contract${expiringContracts !== 1 ? "s" : ""} expiring` : "All invoices reviewed",
      icon: pendingInvoices > 0 ? FileText : FileCheck,
      color: pendingInvoices > 0 ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300",
      bg: pendingInvoices > 0 ? "bg-red-50 dark:bg-red-950" : "bg-emerald-50 dark:bg-emerald-950",
      border: pendingInvoices > 0 ? "border-red-100 dark:border-red-900" : "border-emerald-100 dark:border-emerald-900",
      href: "/dashboard/supplier-invoices",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Purchasing
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Manage suppliers, RFQs and procurement.
          </p>
        </div>
        <Link
          href="/dashboard/rfqs/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0"
        >
          <Plus size={15} /> New RFQ
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`rounded-xl border p-4 ${s.bg} ${s.border} hover:shadow-sm transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              <s.icon size={16} className={s.color} strokeWidth={1.75} />
            </div>
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/rfqs/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <ClipboardList size={15} /> New RFQ
        </Link>
        <Link
          href="/dashboard/purchase-orders/new"
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-blue-400 hover:text-blue-600"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
        >
          <ShoppingBag size={15} /> New Purchase Order
        </Link>
        <Link
          href="/dashboard/suppliers/new"
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-blue-400 hover:text-blue-600"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
        >
          <Users2 size={15} /> Add Supplier
        </Link>
      </div>

      {/* Expiring contracts alert */}
      {expiringContracts > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <span className="font-semibold">{expiringContracts} contract{expiringContracts !== 1 ? "s" : ""}</span> expiring within 30 days.{" "}
            <Link href="/dashboard/contracts" className="underline">View contracts →</Link>
          </p>
        </div>
      )}

      {/* Tables */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent RFQs */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent RFQs</p>
            <Link href="/dashboard/rfqs" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {recentRFQs.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <ClipboardList size={28} className="mx-auto mb-2 text-gray-300 dark:text-gray-700" strokeWidth={1.5} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No RFQs yet</p>
              <Link href="/dashboard/rfqs/new" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Create your first RFQ</Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentRFQs.map((rfq) => (
                <Link key={rfq.id} href={`/dashboard/rfqs/${rfq.id}`}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <RFQStatusIcon status={rfq.status} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{rfq.rfqNumber}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {rfq.suppliers.map((s) => s.supplier.name).join(", ") || "No suppliers"} · {timeAgo(rfq.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${RFQ_BADGE[rfq.status]}`}>
                    {rfq.status.replace("_", " ")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent POs */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Purchase Orders</p>
            <Link href="/dashboard/purchase-orders" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {recentPOs.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <ShoppingBag size={28} className="mx-auto mb-2 text-gray-300 dark:text-gray-700" strokeWidth={1.5} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No purchase orders yet</p>
              <Link href="/dashboard/purchase-orders/new" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Create your first PO</Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentPOs.map((po) => (
                <Link key={po.id} href={`/dashboard/purchase-orders/${po.id}`}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{po.poNumber}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{po.supplier.name} · {timeAgo(po.createdAt)}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${PO_BADGE[po.status]}`}>
                    {po.status.replace("_", " ")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Suppliers */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Suppliers</p>
            <Link href="/dashboard/suppliers" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {recentSuppliers.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Users2 size={28} className="mx-auto mb-2 text-gray-300 dark:text-gray-700" strokeWidth={1.5} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No suppliers yet</p>
              <Link href="/dashboard/suppliers/new" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Add your first supplier</Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentSuppliers.map((s) => (
                <Link key={s.id} href={`/dashboard/suppliers/${s.id}`}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    {s.isPreferred && <Star size={12} className="text-amber-500 flex-shrink-0" fill="currentColor" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{s.name}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                        {s.contactPerson}{s.category ? ` · ${s.category}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex-shrink-0">ACTIVE</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
