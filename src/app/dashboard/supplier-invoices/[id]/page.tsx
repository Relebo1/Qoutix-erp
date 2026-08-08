import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SupplierInvoiceStatus } from "@prisma/client";
import SIActions from "./SIActions";
import DocumentTemplate from "@/components/document/DocumentTemplate";
import DocActions from "@/components/document/DocActions";

const BADGE: Record<SupplierInvoiceStatus, string> = {
  PENDING:   "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  APPROVED:  "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  PAID:      "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  OVERDUE:   "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  CANCELLED: "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

function fmt(v: number | string, currency: string) {
  return `${currency} ${Number(v).toLocaleString("en-LS", { minimumFractionDigits: 2 })}`;
}

export default async function SupplierInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) notFound();

  const payload = await verifyToken(token);
  const [invoice, company] = await Promise.all([
    prisma.supplierInvoice.findFirst({
      where: { id: Number(id), companyId: payload.companyId },
      include: {
        supplier: true,
        purchaseOrder: { select: { id: true, poNumber: true } },
      },
    }),
    prisma.company.findUnique({
      where: { id: payload.companyId },
      select: { name: true, address: true, email: true, phone: true, logo: true, brandColor: true, brandBgColor: true },
    }),
  ]);

  if (!invoice || !company) notFound();

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/supplier-invoices" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
            <ChevronLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{invoice.invoiceNumber}</h1>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${BADGE[invoice.status]}`}>{invoice.status}</span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {invoice.supplier.name} · Due {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DocActions
            docNumber={invoice.invoiceNumber}
            recipientEmail={invoice.supplier.email ?? ""}
            recipientName={invoice.supplier.name}
            subject={`Supplier Invoice ${invoice.invoiceNumber}`}
            body={`Dear ${invoice.supplier.contactPerson || invoice.supplier.name},\n\nPlease find attached Supplier Invoice ${invoice.invoiceNumber}.\n\nKind regards,\n${company.name}`}
          />
          <SIActions invoiceId={invoice.id} status={invoice.status} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Document preview */}
        <div id="document-preview" className="lg:col-span-2">
          <DocumentTemplate
            type="INVOICE"
            docLabel="SUPPLIER INVOICE"
            accentColor={company.brandColor ?? "#111827"}
            bgColor={company.brandBgColor ?? "#ffffff"}
            logo={company.logo ?? null}
            companyName={invoice.supplier.name}
            companyAddress={invoice.supplier.address ?? ""}
            companyEmail={invoice.supplier.email ?? ""}
            companyPhone={invoice.supplier.phone ?? ""}
            clientName={company.name}
            clientAddress={company.address ?? ""}
            clientEmail={company.email ?? ""}
            docNumber={invoice.invoiceNumber}
            issueDate={new Date(invoice.invoiceDate).toLocaleDateString()}
            expiryOrDueDate={new Date(invoice.dueDate).toLocaleDateString()}
            currency={invoice.currency}
            items={[{ description: invoice.purchaseOrder ? `PO: ${invoice.purchaseOrder.poNumber}` : "Services / Goods", quantity: 1, unitPrice: Number(invoice.amount), taxRate: Number(invoice.amount) > 0 ? (Number(invoice.tax) / Number(invoice.amount)) * 100 : 0 }]}
            discount={0}
            notes={invoice.notes ?? ""}
          />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Invoice Details</p>
            <div className="space-y-2 text-sm">
              {[
                { label: "Invoice Date", value: new Date(invoice.invoiceDate).toLocaleDateString(), href: null },
                { label: "Due Date", value: new Date(invoice.dueDate).toLocaleDateString(), href: null },
                { label: "Currency", value: invoice.currency, href: null },
                ...(invoice.purchaseOrder ? [{ label: "Purchase Order", value: invoice.purchaseOrder.poNumber, href: `/dashboard/purchase-orders/${invoice.purchaseOrder.id}` }] : []),
              ].map(({ label, value, href }) => (
                <div key={label} className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  {href
                    ? <Link href={href} className="font-medium hover:text-blue-600 hover:underline transition-colors" style={{ color: "var(--text-primary)" }}>{value}</Link>
                    : <span className="font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
                  }
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-5 space-y-2" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Amounts</p>
            {[
              { label: "Amount", value: fmt(Number(invoice.amount), invoice.currency) },
              { label: "Tax", value: fmt(Number(invoice.tax), invoice.currency) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm" style={{ color: "var(--text-secondary)" }}>
                <span>{label}</span><span>{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold pt-2 border-t" style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}>
              <span>Total</span><span>{fmt(Number(invoice.total), invoice.currency)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Notes</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
