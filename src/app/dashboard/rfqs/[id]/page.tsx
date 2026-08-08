import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Trophy } from "lucide-react";
import { RFQStatus } from "@prisma/client";
import RFQActions from "./RFQActions";
import DocumentTemplate from "@/components/document/DocumentTemplate";
import DocActions from "@/components/document/DocActions";
import EmailHistory from "@/components/EmailHistory";

const BADGE: Record<RFQStatus, string> = {
  DRAFT:              "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  SENT:               "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  RESPONSES_RECEIVED: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  CLOSED:             "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  CANCELLED:          "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

export default async function RFQDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) notFound();

  const payload = await verifyToken(token);
  const [rfq, company, purchaseOrders] = await Promise.all([
    prisma.rFQ.findFirst({
      where: { id: Number(id), companyId: payload.companyId },
      include: {
        items: true,
        suppliers: {
          include: { supplier: true },
          orderBy: { supplier: { name: "asc" } },
        },
      },
    }),
    prisma.company.findUnique({
      where: { id: payload.companyId },
      select: { name: true, address: true, email: true, phone: true, logo: true, brandColor: true, brandBgColor: true },
    }),
    prisma.purchaseOrder.findMany({
      where: { rfqId: Number(id), companyId: payload.companyId },
      select: { id: true, poNumber: true, status: true, supplier: { select: { name: true } } },
    }),
  ]);

  if (!rfq || !company) notFound();

  const lineItems = rfq.items.map((i) => ({
    description: i.description,
    quantity: Number(i.quantity),
    unitPrice: 0,
    taxRate: 0,
  }));

  const awardedSupplier = rfq.awardedSupplierId
    ? rfq.suppliers.find((s) => s.supplierId === rfq.awardedSupplierId)
    : null;

  const respondedSuppliers = rfq.suppliers.filter((s) => s.quotedPrice != null);
  const lowestQuote = respondedSuppliers.length
    ? respondedSuppliers.reduce((min, s) => Number(s.quotedPrice) < Number(min.quotedPrice) ? s : min)
    : null;

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/rfqs" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
            <ChevronLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{rfq.rfqNumber}</h1>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${BADGE[rfq.status]}`}>
                {rfq.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Created {new Date(rfq.createdAt).toLocaleDateString()}
              {rfq.deliveryDate ? ` · Delivery by ${new Date(rfq.deliveryDate).toLocaleDateString()}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DocActions
            docNumber={rfq.rfqNumber}
            recipientEmail={awardedSupplier?.supplier.email ?? rfq.suppliers[0]?.supplier.email ?? ""}
            recipientName={awardedSupplier?.supplier.name ?? "Suppliers"}
            subject={`Request for Quotation ${rfq.rfqNumber}`}
            body={`Dear Sir/Madam,\n\nPlease find attached Request for Quotation ${rfq.rfqNumber}. Kindly submit your quotation at your earliest convenience.\n\nKind regards,\n${company.name}`}
            docType="RFQ"
            docId={rfq.id}
          />
          <RFQActions rfqId={rfq.id} status={rfq.status} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Document preview */}
        <div id="document-preview" className="lg:col-span-2">
          <DocumentTemplate
            type="QUOTATION"
            docLabel="REQUEST FOR QUOTATION"
            accentColor={rfq.accentColor ?? company.brandColor ?? "#111827"}
            bgColor={rfq.bgColor ?? company.brandBgColor ?? "#ffffff"}
            fontColor={rfq.fontColor ?? "#111827"}
            fontFamily={rfq.fontFamily ?? "'Segoe UI', Arial, sans-serif"}
            logo={company.logo ?? null}
            companyName={company.name}
            companyAddress={company.address ?? ""}
            companyEmail={company.email ?? ""}
            companyPhone={company.phone ?? ""}
            clientName={awardedSupplier?.supplier.name ?? "Suppliers"}
            clientAddress={awardedSupplier?.supplier.address ?? ""}
            clientEmail={awardedSupplier?.supplier.email ?? ""}
            docNumber={rfq.rfqNumber}
            issueDate={new Date(rfq.createdAt).toLocaleDateString()}
            expiryOrDueDate={rfq.deliveryDate ? new Date(rfq.deliveryDate).toLocaleDateString() : "—"}
            currency={rfq.currency}
            items={lineItems}
            discount={0}
            notes={rfq.notes ?? ""}
          />
        </div>

        {/* Right column: items + suppliers */}
        <div className="space-y-4">

        {/* Linked POs */}
        {purchaseOrders.length > 0 && (
          <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Linked Documents</p>
            {purchaseOrders.map((po) => (
              <Link key={po.id} href={`/dashboard/purchase-orders/${po.id}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg border hover:border-blue-400 transition-colors"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{po.poNumber}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{po.supplier.name}</p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400">{po.status.replace("_", " ")}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Items */}
        <div className="space-y-4">
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Required Items</p>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {rfq.items.map((item) => (
                <div key={item.id} className="px-5 py-3">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.description}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Qty: {Number(item.quantity)}{item.unit ? ` ${item.unit}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {rfq.notes && (
            <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Notes</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{rfq.notes}</p>
            </div>
          )}
        </div>

        {/* Supplier comparison */}
        <div>
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Supplier Quotes
                {respondedSuppliers.length > 0 && (
                  <span className="ml-2 text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                    {respondedSuppliers.length} of {rfq.suppliers.length} responded
                  </span>
                )}
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {rfq.suppliers.map((rs) => {
                const isLowest = lowestQuote?.supplierId === rs.supplierId;
                const isAwarded = rfq.awardedSupplierId === rs.supplierId;
                return (
                  <div key={rs.supplierId} className={`px-5 py-4 ${isAwarded ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/suppliers/${rs.supplierId}`}
                            className="text-sm font-semibold hover:text-blue-600 transition-colors"
                            style={{ color: "var(--text-primary)" }}>
                            {rs.supplier.name}
                          </Link>
                          {isAwarded && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                              <Trophy size={10} /> Awarded
                            </span>
                          )}
                          {isLowest && !isAwarded && rs.quotedPrice != null && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              Lowest
                            </span>
                          )}
                        </div>
                        {rs.respondedAt && (
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            Responded {new Date(rs.respondedAt).toLocaleDateString()}
                          </p>
                        )}
                        {rs.notes && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{rs.notes}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {rs.quotedPrice != null ? (
                          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                            {rfq.currency} {Number(rs.quotedPrice).toLocaleString("en-LS", { minimumFractionDigits: 2 })}
                          </p>
                        ) : (
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Awaiting response</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        </div>
        <EmailHistory docType="RFQ" docId={rfq.id} />
      </div>
    </div>
  );
}
