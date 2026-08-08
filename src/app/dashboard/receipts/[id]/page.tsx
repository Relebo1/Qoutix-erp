import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import DocumentTemplate from "@/components/document/DocumentTemplate";
import DownloadPdfButton from "@/components/document/DownloadPdfButton";

const METHOD_LABEL: Record<string, string> = {
  CASH: "Cash", BANK: "Bank Transfer", CARD: "Card",
  MOBILE_MONEY: "Mobile Money", ONLINE: "Online",
};

export default async function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) notFound();

  const payload = await verifyToken(token);

  const receipt = await prisma.receipt.findFirst({
    where: { id: Number(id), companyId: payload.companyId },
    include: {
      payment: true,
      invoice: { include: { items: true, quotation: { select: { id: true, quoteNumber: true } } } },
      client:  true,
      company: true,
    },
  });

  if (!receipt) notFound();

  const lineItems = receipt.invoice.items.map(i => ({
    description: i.description,
    quantity:    Number(i.quantity),
    unitPrice:   Number(i.price),
    taxRate:     Number(i.tax) > 0 && Number(i.price) > 0 && Number(i.quantity) > 0
      ? (Number(i.tax) / (Number(i.quantity) * Number(i.price))) * 100
      : 0,
  }));

  const discountPct = Number(receipt.invoice.discount) > 0 && Number(receipt.invoice.subtotal) > 0
    ? (Number(receipt.invoice.discount) / Number(receipt.invoice.subtotal)) * 100
    : 0;

  const paymentDate = new Date(receipt.payment.paymentDate).toLocaleDateString();
  const methodLabel = METHOD_LABEL[receipt.payment.paymentMethod] ?? receipt.payment.paymentMethod;

  const isVoided = receipt.status === "VOIDED";

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/receipts"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{receipt.receiptNumber}</h1>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                isVoided
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-400"
                  : "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
              }`}>{receipt.status}</span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {receipt.client.companyName} · {receipt.payment.paymentNumber} · {receipt.invoice.invoiceNumber}
            </p>
          </div>
        </div>
        {!isVoided && <DownloadPdfButton docNumber={receipt.receiptNumber} />}
      </div>

      {/* Linked documents */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link href={`/dashboard/invoices/${receipt.invoiceId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg border hover:border-blue-400 hover:text-blue-600 transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
          ← {receipt.invoice.invoiceNumber}
        </Link>
        {receipt.invoice.quotation && (
          <Link href={`/dashboard/quotes/${receipt.invoice.quotation.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg border hover:border-violet-400 hover:text-violet-600 transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
            ← {receipt.invoice.quotation.quoteNumber}
          </Link>
        )}
      </div>

      {/* Receipt document */}
      <div id="document-preview">
        <DocumentTemplate
          type="RECEIPT"
          accentColor="#111827"
          logo={receipt.company.logo ?? null}
          companyName={receipt.company.name}
          companyAddress={receipt.company.address ?? ""}
          companyEmail={receipt.company.email ?? ""}
          companyPhone={receipt.company.phone ?? ""}
          clientName={receipt.client.companyName}
          clientAddress={receipt.client.address ?? ""}
          clientEmail={receipt.client.email ?? ""}
          docNumber={receipt.receiptNumber}
          issueDate={paymentDate}
          expiryOrDueDate={paymentDate}
          currency={receipt.currency}
          items={lineItems}
          discount={discountPct}
          notes={`Payment: ${receipt.payment.paymentNumber}${receipt.payment.reference ? ` · Ref: ${receipt.payment.reference}` : ""}`}
          amountPaid={Number(receipt.amount)}
          paymentMethod={methodLabel}
          balanceDue={Number(receipt.balanceDue)}
        />
      </div>
    </div>
  );
}
