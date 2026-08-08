import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Receipt } from "lucide-react";
import { InvoiceStatus } from "@prisma/client";
import DocumentTemplate from "@/components/document/DocumentTemplate";
import InvoiceStatusActions from "./InvoiceStatusActions";
import DocActions from "@/components/document/DocActions";
import ActivityFeed from "@/components/ActivityFeed";
import PaymentPanel from "./PaymentPanel";
import EmailHistory from "@/components/EmailHistory";

const BADGE: Record<InvoiceStatus, string> = {
  DRAFT:     "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  SENT:      "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  VIEWED:    "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400",
  PARTIAL:   "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  PAID:      "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  OVERDUE:   "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  CANCELLED: "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) notFound();

  const payload = await verifyToken(token);

  const invoice = await prisma.invoice.findFirst({
    where: { id: Number(id), companyId: payload.companyId },
    include: {
      client: true,
      items: true,
      company: true,
      payments: { orderBy: { paymentDate: "asc" } },
      quotation: { select: { id: true, quoteNumber: true, status: true, docType: true } },
      receipts: { select: { id: true, receiptNumber: true, status: true } },
    },
  });

  if (!invoice) notFound();

  const totalPaid = invoice.payments.reduce((s, p) => s + Number(p.amount), 0);
  const remaining = Math.max(Number(invoice.total) - totalPaid, 0);
  const paidPct = Number(invoice.total) > 0 ? Math.min((totalPaid / Number(invoice.total)) * 100, 100) : 0;

  const lineItems = invoice.items.map((i) => ({
    description: i.description,
    quantity: Number(i.quantity),
    unitPrice: Number(i.price),
    taxRate: Number(i.tax) > 0 && Number(i.price) > 0 && Number(i.quantity) > 0
      ? (Number(i.tax) / (Number(i.quantity) * Number(i.price))) * 100
      : 0,
  }));

  const canPay = [InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE].includes(invoice.status);

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/invoices" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
            <ChevronLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{invoice.invoiceNumber}</h1>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${BADGE[invoice.status]}`}>{invoice.status}</span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{invoice.client.companyName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <DocActions
            docNumber={invoice.invoiceNumber}
            recipientEmail={invoice.client.email ?? ""}
            recipientName={invoice.client.companyName}
            subject={`Invoice ${invoice.invoiceNumber} from ${invoice.company.name}`}
            body={`Dear ${invoice.client.contactName || invoice.client.companyName},\n\nPlease find attached Invoice ${invoice.invoiceNumber} for ${invoice.currency} ${Number(invoice.total).toLocaleString("en-LS", { minimumFractionDigits: 2 })}, due ${new Date(invoice.dueDate).toLocaleDateString()}.\n\nKind regards,\n${invoice.company.name}`}
            docType="INVOICE"
            docId={invoice.id}
          />
          {invoice.status === InvoiceStatus.PAID && (
            <Link
              href={`/dashboard/invoices/${invoice.id}/receipt`}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-emerald-400 hover:text-emerald-600"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
            >
              <Receipt size={14} /> View Receipt
            </Link>
          )}
          <InvoiceStatusActions
            invoiceId={invoice.id}
            status={invoice.status}
            plannedSendDate={invoice.plannedSendDate?.toISOString() ?? null}
            remaining={remaining}
            currency={invoice.currency}
            invoiceNumber={invoice.invoiceNumber}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Document preview */}
        <div id="document-preview" className="lg:col-span-2">
          <DocumentTemplate
            type="INVOICE"
            accentColor={invoice.accentColor ?? invoice.company.brandColor ?? "#111827"}
            bgColor={invoice.bgColor ?? invoice.company.brandBgColor ?? "#ffffff"}
            fontColor={invoice.fontColor ?? "#111827"}
            fontFamily={invoice.fontFamily ?? "'Segoe UI', Arial, sans-serif"}
            logo={invoice.company.logo ?? null}
            companyName={invoice.company.name}
            companyAddress={invoice.company.address ?? ""}
            companyEmail={invoice.company.email ?? ""}
            companyPhone={invoice.company.phone ?? ""}
            clientName={invoice.client.companyName}
            clientAddress={invoice.client.address ?? ""}
            clientEmail={invoice.client.email ?? ""}
            docNumber={invoice.invoiceNumber}
            issueDate={new Date(invoice.issueDate).toLocaleDateString()}
            expiryOrDueDate={new Date(invoice.dueDate).toLocaleDateString()}
            currency={invoice.currency}
            items={lineItems}
            discount={Number(invoice.discount) > 0 && Number(invoice.subtotal) > 0
              ? (Number(invoice.discount) / Number(invoice.subtotal)) * 100
              : 0}
            notes={invoice.notes ?? ""}
          />
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Linked documents */}
          {(invoice.quotation || invoice.receipts.length > 0) && (
            <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Linked Documents</p>
              {invoice.quotation && (
                <Link href={`/dashboard/quotes/${invoice.quotation.id}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border hover:border-blue-400 transition-colors"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{invoice.quotation.quoteNumber}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400">{invoice.quotation.status}</span>
                </Link>
              )}
              {invoice.receipts.map((r) => (
                <Link key={r.id} href={`/dashboard/receipts/${r.id}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border hover:border-emerald-400 transition-colors"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{r.receiptNumber}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">{r.status}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Financial summary */}
          <div className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Financial Summary</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Invoice Total</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{invoice.currency} {Number(invoice.total).toLocaleString("en-LS", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Paid</span>
                <span className="font-semibold text-emerald-600">{invoice.currency} {totalPaid.toLocaleString("en-LS", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Outstanding</span>
                <span className={`font-semibold ${remaining > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                  {invoice.currency} {remaining.toLocaleString("en-LS", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                <span>Payment Progress</span>
                <span>{paidPct.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${paidPct}%`, backgroundColor: paidPct >= 100 ? "#10b981" : "#f59e0b" }}
                />
              </div>
            </div>
          </div>

          {/* Payment history + record payment button */}
          <PaymentPanel
            invoiceId={invoice.id}
            invoiceNumber={invoice.invoiceNumber}
            currency={invoice.currency}
            remaining={remaining}
            canPay={canPay}
            payments={invoice.payments.map((p) => ({
              id: p.id,
              amount: Number(p.amount),
              paymentMethod: p.paymentMethod,
              paymentDate: p.paymentDate.toISOString(),
              reference: p.reference,
            }))}
          />

          {/* Activity feed */}
          <ActivityFeed events={[
            { label: "Created", date: invoice.createdAt.toISOString(), color: "bg-gray-400" },
            ...(invoice.status !== "DRAFT" ? [{ label: `Marked as ${invoice.status}`, date: invoice.updatedAt.toISOString(), color:
              invoice.status === "PAID" ? "bg-emerald-500" :
              invoice.status === "PARTIAL" ? "bg-amber-500" :
              invoice.status === "OVERDUE" ? "bg-red-500" :
              invoice.status === "CANCELLED" ? "bg-gray-500" : "bg-blue-500"
            }] : []),
          ]} />
          <EmailHistory docType="INVOICE" docId={invoice.id} />
        </div>
      </div>
    </div>
  );
}
