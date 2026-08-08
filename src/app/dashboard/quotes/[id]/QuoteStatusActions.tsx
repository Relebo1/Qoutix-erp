"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, CheckCircle, XCircle, Ban, Loader2, Pencil, Receipt, FileText } from "lucide-react";
import { QuotationStatus, QuotationDocType } from "@prisma/client";

const DOC_LABELS: Record<QuotationDocType, string> = {
  QUOTATION:        "Quotation",
  PROFORMA_INVOICE: "Proforma Invoice",
  SALES_ORDER:      "Sales Order",
};

export default function QuoteStatusActions({
  quoteId,
  status,
  docType,
}: {
  quoteId: number;
  status: QuotationStatus;
  docType: QuotationDocType;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

  const update = async (newStatus: QuotationStatus) => {
    setLoading(newStatus);
    await fetch(`/api/quotes/${quoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(null);
    router.refresh();
  };

  const convertToInvoice = async () => {
    setConverting(true);
    const res = await fetch(`/api/quotes/${quoteId}/convert`, { method: "POST" });
    const data = await res.json();
    setConverting(false);
    if (data.invoiceId) router.push(`/dashboard/invoices/${data.invoiceId}`);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Doc type badge */}
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
        <FileText size={12} />
        {DOC_LABELS[docType]}
      </span>

      {status === QuotationStatus.DRAFT && (
        <Link
          href={`/dashboard/quotes/${quoteId}/edit`}
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-blue-400 hover:text-blue-600"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
        >
          <Pencil size={14} /> Edit
        </Link>
      )}

      {status === QuotationStatus.DRAFT && (
        <button
          onClick={() => update(QuotationStatus.SENT)}
          disabled={!!loading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {loading === QuotationStatus.SENT ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Mark as Sent
        </button>
      )}

      {(status === QuotationStatus.SENT || status === QuotationStatus.VIEWED) && (
        <>
          <button
            onClick={() => update(QuotationStatus.ACCEPTED)}
            disabled={!!loading}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {loading === QuotationStatus.ACCEPTED ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Accept
          </button>
          <button
            onClick={() => update(QuotationStatus.REJECTED)}
            disabled={!!loading}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-red-400 hover:text-red-600"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
          >
            {loading === QuotationStatus.REJECTED ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            Reject
          </button>
        </>
      )}

      {/* Convert to Invoice — available on ACCEPTED quotes */}
      {status === QuotationStatus.ACCEPTED && (
        <button
          onClick={convertToInvoice}
          disabled={converting}
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {converting ? <Loader2 size={14} className="animate-spin" /> : <Receipt size={14} />}
          Convert to Invoice
        </button>
      )}

      {status !== QuotationStatus.CANCELLED && status !== QuotationStatus.CONVERTED && (
        <button
          onClick={() => update(QuotationStatus.CANCELLED)}
          disabled={!!loading}
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-red-400 hover:text-red-500"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg-card)" }}
        >
          {loading === QuotationStatus.CANCELLED ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
          Cancel
        </button>
      )}
    </div>
  );
}
