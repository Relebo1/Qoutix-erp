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

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) notFound();

  const payload = await verifyToken(token);

  const invoice = await prisma.invoice.findFirst({
    where: { id: Number(id), companyId: payload.companyId },
    include: { client: true, items: true, company: true, payments: { orderBy: { paymentDate: "desc" }, take: 1 } },
  });

  if (!invoice) notFound();

  const lineItems = invoice.items.map((i) => ({
    description: i.description,
    quantity: Number(i.quantity),
    unitPrice: Number(i.price),
    taxRate: Number(i.tax) > 0 && Number(i.price) > 0 && Number(i.quantity) > 0
      ? (Number(i.tax) / (Number(i.quantity) * Number(i.price))) * 100
      : 0,
  }));

  const lastPayment = invoice.payments[0];
  const receiptNumber = `REC-${invoice.invoiceNumber.replace("INV-", "")}`;
  const amountPaid = lastPayment ? Number(lastPayment.amount) : Number(invoice.total);
  const paymentMethod = lastPayment ? (METHOD_LABEL[lastPayment.paymentMethod] ?? lastPayment.paymentMethod) : "—";
  const paymentDate = lastPayment
    ? new Date(lastPayment.paymentDate).toLocaleDateString()
    : new Date(invoice.updatedAt).toLocaleDateString();

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/invoices/${invoice.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{receiptNumber}</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Receipt for {invoice.invoiceNumber} · {invoice.client.companyName}</p>
          </div>
        </div>
        <DownloadPdfButton docNumber={receiptNumber} />
      </div>

      {/* Receipt document */}
      <div id="document-preview">
        <DocumentTemplate
          type="RECEIPT"
          accentColor={invoice.company.brandColor ?? "#111827"}
          bgColor={invoice.company.brandBgColor ?? "#ffffff"}
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
          docNumber={receiptNumber}
          issueDate={paymentDate}
          expiryOrDueDate={paymentDate}
          currency={invoice.currency}
          items={lineItems}
          discount={Number(invoice.discount) > 0 && Number(invoice.subtotal) > 0
            ? (Number(invoice.discount) / Number(invoice.subtotal)) * 100
            : 0}
          notes={invoice.notes ?? ""}
          amountPaid={amountPaid}
          paymentMethod={paymentMethod}
        />
      </div>
    </div>
  );
}
