import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Star, Pencil, Mail, Phone, MapPin, FileText } from "lucide-react";
import { SupplierStatus, RFQStatus } from "@prisma/client";
import SupplierActions from "./SupplierActions";

const RFQ_BADGE: Record<RFQStatus, string> = {
  DRAFT:              "bg-gray-100 dark:bg-gray-800 text-gray-500",
  SENT:               "bg-blue-50 dark:bg-blue-950 text-blue-700",
  RESPONSES_RECEIVED: "bg-amber-50 dark:bg-amber-950 text-amber-700",
  CLOSED:             "bg-emerald-50 dark:bg-emerald-950 text-emerald-700",
  CANCELLED:          "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) notFound();

  const payload = await verifyToken(token);
  const supplier = await prisma.supplier.findFirst({
    where: { id: Number(id), companyId: payload.companyId },
    include: {
      rfqSuppliers: {
        include: { rfq: { select: { id: true, rfqNumber: true, status: true, createdAt: true, deliveryDate: true } } },
        orderBy: { rfq: { createdAt: "desc" } },
        take: 10,
      },
    },
  });

  if (!supplier) notFound();

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/suppliers"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: "var(--text-muted)" }}>
            <ChevronLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              {supplier.isPreferred && <Star size={14} className="text-amber-500" fill="currentColor" />}
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{supplier.name}</h1>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${supplier.status === SupplierStatus.ACTIVE ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                {supplier.status}
              </span>
            </div>
            {supplier.category && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{supplier.category}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/suppliers/${supplier.id}/edit`}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-blue-400 hover:text-blue-600"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
            <Pencil size={14} /> Edit
          </Link>
          <SupplierActions supplierId={supplier.id} status={supplier.status} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Contact</p>
            <div className="space-y-2 text-sm">
              <p style={{ color: "var(--text-secondary)" }}>{supplier.contactPerson}</p>
              {supplier.email && (
                <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <Mail size={13} /> <span>{supplier.email}</span>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <Phone size={13} /> <span>{supplier.phone}</span>
                </div>
              )}
              {supplier.address && (
                <div className="flex items-start gap-2" style={{ color: "var(--text-muted)" }}>
                  <MapPin size={13} className="mt-0.5 flex-shrink-0" /> <span>{supplier.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Commercial</p>
            <div className="space-y-2 text-sm">
              {[
                { label: "Payment Terms", value: supplier.paymentTerms },
                { label: "VAT Number", value: supplier.vatNumber },
                { label: "Tax Number", value: supplier.taxNumber },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
                </div>
              ) : null)}
            </div>
          </div>

          {supplier.productsServices && (
            <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Products / Services</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{supplier.productsServices}</p>
            </div>
          )}

          {supplier.notes && (
            <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Notes</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{supplier.notes}</p>
            </div>
          )}
        </div>

        {/* RFQ history */}
        <div className="md:col-span-2">
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-blue-600" />
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>RFQ History</p>
              </div>
              <Link href="/dashboard/rfqs/new"
                className="text-xs text-blue-600 hover:underline">
                + New RFQ
              </Link>
            </div>
            {supplier.rfqSuppliers.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>No RFQs sent to this supplier yet</p>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {supplier.rfqSuppliers.map((rs) => (
                  <Link key={rs.rfqId} href={`/dashboard/rfqs/${rs.rfqId}`}
                    className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{rs.rfq.rfqNumber}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {new Date(rs.rfq.createdAt).toLocaleDateString()}
                        {rs.rfq.deliveryDate ? ` · Delivery: ${new Date(rs.rfq.deliveryDate).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {rs.quotedPrice != null && (
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          LSL {Number(rs.quotedPrice).toLocaleString("en-LS", { minimumFractionDigits: 2 })}
                        </span>
                      )}
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${RFQ_BADGE[rs.rfq.status]}`}>{rs.rfq.status.replace("_", " ")}</span>
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
