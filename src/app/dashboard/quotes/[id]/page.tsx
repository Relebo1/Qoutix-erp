import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { QuotationStatus, QuotationDocType } from "@prisma/client";
import DocumentTemplate from "@/components/document/DocumentTemplate";
import QuoteStatusActions from "./QuoteStatusActions";
import DocActions from "@/components/document/DocActions";
import ActivityFeed from "@/components/ActivityFeed";
import EmailHistory from "@/components/EmailHistory";

const BADGE: Record<QuotationStatus, string> = {
  DRAFT:     "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  SENT:      "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  VIEWED:    "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400",
  ACCEPTED:  "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  REJECTED:  "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  EXPIRED:   "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  CONVERTED: "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400",
  CANCELLED: "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

const DOC_LABELS: Record<QuotationDocType, string> = {
  QUOTATION:        "QUOTATION",
  PROFORMA_INVOICE: "PROFORMA INVOICE",
  SALES_ORDER:      "SALES ORDER",
};

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) notFound();

  const payload = await verifyToken(token);

  const quote = await prisma.quotation.findFirst({
    where: { id: Number(id), companyId: payload.companyId },
    include: { client: true, items: true, company: true, invoices: { select: { id: true, invoiceNumber: true, status: true } } },
  });

  if (!quote) notFound();

  const lineItems = quote.items.map((i) => ({
    description: i.description,
    quantity: Number(i.quantity),
    unitPrice: Number(i.unitPrice),
    taxRate: Number(i.taxRate),
  }));

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/quotes" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
            <ChevronLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{quote.quoteNumber}</h1>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${BADGE[quote.status]}`}>{quote.status}</span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{quote.client.companyName}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <DocActions
            docNumber={quote.quoteNumber}
            recipientEmail={quote.client.email ?? ""}
            recipientName={quote.client.companyName}
            subject={`${DOC_LABELS[quote.docType]} ${quote.quoteNumber} from ${quote.company.name}`}
            body={`Dear ${quote.client.contactName || quote.client.companyName},\n\nPlease find attached ${DOC_LABELS[quote.docType]} ${quote.quoteNumber}.\n\nKind regards,\n${quote.company.name}`}
            docType="QUOTATION"
            docId={quote.id}
          />
          <QuoteStatusActions quoteId={quote.id} status={quote.status} docType={quote.docType} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
      {/* Document preview */}
      <div id="document-preview" className="lg:col-span-2">
        <DocumentTemplate
          type="QUOTATION"
          docLabel={DOC_LABELS[quote.docType]}
          accentColor={quote.accentColor ?? quote.company.brandColor ?? "#111827"}
          bgColor={quote.bgColor ?? quote.company.brandBgColor ?? "#ffffff"}
          fontColor={quote.fontColor ?? "#111827"}
          fontFamily={quote.fontFamily ?? "'Segoe UI', Arial, sans-serif"}
          logo={quote.company.logo ?? null}
          companyName={quote.company.name}
          companyAddress={quote.company.address ?? ""}
          companyEmail={quote.company.email ?? ""}
          companyPhone={quote.company.phone ?? ""}
          clientName={quote.client.companyName}
          clientAddress={quote.client.address ?? ""}
          clientEmail={quote.client.email ?? ""}
          docNumber={quote.quoteNumber}
          issueDate={new Date(quote.issueDate).toLocaleDateString()}
          expiryOrDueDate={new Date(quote.expiryDate).toLocaleDateString()}
          currency={quote.currency}
          items={lineItems}
          discount={Number(quote.discount) > 0 ? (Number(quote.discount) / Number(quote.subtotal)) * 100 : 0}
          notes={quote.notes ?? ""}
        />
      </div>

      {/* Right panel */}
      <div className="space-y-4">

        {/* Linked invoice */}
        {quote.invoices.length > 0 && (
          <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Linked Documents</p>
            {quote.invoices.map((inv) => (
              <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg border hover:border-blue-400 transition-colors"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{inv.invoiceNumber}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400">{inv.status}</span>
              </Link>
            ))}
          </div>
        )}

        <ActivityFeed events={[
          { label: "Created", date: quote.createdAt.toISOString(), color: "bg-gray-400" },
          ...(quote.status !== "DRAFT" ? [{ label: `Marked as ${quote.status}`, date: quote.updatedAt.toISOString(), color:
            quote.status === "ACCEPTED" ? "bg-emerald-500" :
            quote.status === "REJECTED" ? "bg-red-500" :
            quote.status === "CONVERTED" ? "bg-violet-500" :
            quote.status === "CANCELLED" ? "bg-gray-500" : "bg-blue-500"
          }] : []),
        ]} />
        <EmailHistory docType="QUOTATION" docId={quote.id} />
      </div>
      </div>
    </div>
  );
}
