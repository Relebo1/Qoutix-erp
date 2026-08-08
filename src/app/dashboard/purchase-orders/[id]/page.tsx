import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { PurchaseOrderStatus } from "@prisma/client";
import POActions from "./POActions";
import DocumentTemplate from "@/components/document/DocumentTemplate";
import DownloadPdfButton from "@/components/document/DownloadPdfButton";

const BADGE: Record<PurchaseOrderStatus, string> = {
  DRAFT:              "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  APPROVED:           "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  SENT:               "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400",
  PARTIALLY_RECEIVED: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  COMPLETED:          "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  CANCELLED:          "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

const SI_BADGE: Record<string, string> = {
  PENDING:   "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  APPROVED:  "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  PAID:      "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  OVERDUE:   "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  CANCELLED: "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

function fmt(v: number | string, currency: string) {
  return `${currency} ${Number(v).toLocaleString("en-LS", { minimumFractionDigits: 2 })}`;
}

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) notFound();

  const payload = await verifyToken(token);
  const [order, company] = await Promise.all([
    prisma.purchaseOrder.findFirst({
      where: { id: Number(id), companyId: payload.companyId },
      include: {
        supplier: true,
        items: true,
        supplierInvoices: { select: { id: true, invoiceNumber: true, total: true, status: true, dueDate: true } },
        rfq: { select: { id: true, rfqNumber: true, status: true } },
      },
    }),
    prisma.company.findUnique({
      where: { id: payload.companyId },
      select: { name: true, address: true, email: true, phone: true, logo: true, brandColor: true, brandBgColor: true, brandFontColor: true, brandFontFamily: true },
    }),
  ]);

  if (!order || !company) notFound();

  const lineItems = order.items.map((i) => ({
    description: i.description + (i.unit ? ` (${i.unit})` : ""),
    quantity: Number(i.quantity),
    unitPrice: Number(i.unitPrice),
    taxRate: Number(i.taxRate),
  }));

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/purchase-orders" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
            <ChevronLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{order.poNumber}</h1>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${BADGE[order.status]}`}>
                {order.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {order.supplier.name} · {new Date(order.issueDate).toLocaleDateString()}
              {order.expectedDate ? ` · Expected ${new Date(order.expectedDate).toLocaleDateString()}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DownloadPdfButton docNumber={order.poNumber} />
          <POActions poId={order.id} status={order.status} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Document preview */}
        <div id="document-preview" className="lg:col-span-2">
          <DocumentTemplate
            type="QUOTATION"
            docLabel="PURCHASE ORDER"
            accentColor={company.brandColor ?? "#111827"}
            bgColor={company.brandBgColor ?? "#ffffff"}
            fontColor={company.brandFontColor ?? "#111827"}
            fontFamily={company.brandFontFamily ?? "'Segoe UI', Arial, sans-serif"}
            logo={company.logo ?? null}
            companyName={company.name}
            companyAddress={company.address ?? ""}
            companyEmail={company.email ?? ""}
            companyPhone={company.phone ?? ""}
            clientName={order.supplier.name}
            clientAddress={order.supplier.address ?? ""}
            clientEmail={order.supplier.email ?? ""}
            docNumber={order.poNumber}
            issueDate={new Date(order.issueDate).toLocaleDateString()}
            expiryOrDueDate={order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : "—"}
            currency={order.currency}
            items={lineItems}
            discount={0}
            notes={order.notes ?? ""}
          />
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Source RFQ */}
          {order.rfq && (
            <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Linked Documents</p>
              <Link href={`/dashboard/rfqs/${order.rfq.id}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg border hover:border-blue-400 transition-colors"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{order.rfq.rfqNumber}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400">{order.rfq.status.replace("_", " ")}</span>
              </Link>
            </div>
          )}
          <div className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Supplier</p>
            <div className="space-y-1 text-sm">
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>{order.supplier.name}</p>
              <p style={{ color: "var(--text-muted)" }}>{order.supplier.contactPerson}</p>
              {order.supplier.email && <p style={{ color: "var(--text-muted)" }}>{order.supplier.email}</p>}
              {order.supplier.phone && <p style={{ color: "var(--text-muted)" }}>{order.supplier.phone}</p>}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-xl border p-5 space-y-2" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Summary</p>
            {[
              { label: "Subtotal", value: fmt(Number(order.subtotal), order.currency) },
              { label: "Tax", value: fmt(Number(order.tax), order.currency) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm" style={{ color: "var(--text-secondary)" }}>
                <span>{label}</span><span>{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold pt-2 border-t" style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}>
              <span>Total</span><span>{fmt(Number(order.total), order.currency)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Notes</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{order.notes}</p>
            </div>
          )}

          {/* Supplier invoices */}
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Supplier Invoices</p>
              <Link href={`/dashboard/supplier-invoices/new?poId=${order.id}`}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <Plus size={12} /> Add Invoice
              </Link>
            </div>
            {order.supplierInvoices.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>No supplier invoices yet</p>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {order.supplierInvoices.map((si) => (
                  <Link key={si.id} href={`/dashboard/supplier-invoices/${si.id}`}
                    className="px-5 py-3 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{si.invoiceNumber}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Due {new Date(si.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(Number(si.total), order.currency)}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${SI_BADGE[si.status]}`}>{si.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
