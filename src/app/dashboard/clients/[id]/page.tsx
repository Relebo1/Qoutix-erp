import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Mail, Phone, MapPin, Building2, FileText,
  Receipt, Pencil, Plus, User,
} from "lucide-react";
import { QuotationStatus, InvoiceStatus } from "@prisma/client";

const QUOTE_BADGE: Record<QuotationStatus, string> = {
  DRAFT:     "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  SENT:      "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  VIEWED:    "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400",
  ACCEPTED:  "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  REJECTED:  "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  EXPIRED:   "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400",
  CONVERTED: "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
  CANCELLED: "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

const INV_BADGE: Record<InvoiceStatus, string> = {
  DRAFT:     "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  SENT:      "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  VIEWED:    "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400",
  PARTIAL:   "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  PAID:      "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  OVERDUE:   "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  CANCELLED: "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

function fmt(n: number, currency: string) {
  return `${currency} ${n.toLocaleString("en-LS", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) notFound();

  const payload = await verifyToken(token);

  const client = await prisma.client.findFirst({
    where: { id: Number(id), companyId: payload.companyId },
    include: {
      quotations: { orderBy: { createdAt: "desc" }, take: 10 },
      invoices:   { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!client) notFound();

  const totalBilled  = client.invoices.reduce((s, i) => s + Number(i.total), 0);
  const totalPaid    = client.invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + Number(i.total), 0);
  const currency     = client.invoices[0]?.currency ?? "LSL";

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/clients" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
            <ChevronLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-base">{client.companyName[0].toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{client.companyName}</h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{client.contactName}</p>
            </div>
          </div>
        </div>
        <Link
          href={`/dashboard/clients/${client.id}/edit`}
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-blue-400 hover:text-blue-600"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
        >
          <Pencil size={14} /> Edit
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Quotes",       value: client.quotations.length },
          { label: "Invoices",     value: client.invoices.length },
          { label: "Total Billed", value: fmt(totalBilled, currency) },
          { label: "Total Paid",   value: fmt(totalPaid, currency) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border p-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client info */}
        <div className="space-y-4">
          <section className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-blue-600" />
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Details</p>
            </div>
            <div className="space-y-3">
              {client.email && (
                <div className="flex items-start gap-2.5">
                  <Mail size={13} className="mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm break-all" style={{ color: "var(--text-secondary)" }}>{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone size={13} className="flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin size={13} className="mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{client.address}</span>
                </div>
              )}
              {client.industry && (
                <div className="flex items-center gap-2.5">
                  <Building2 size={13} className="flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{client.industry}</span>
                </div>
              )}
              {!client.email && !client.phone && !client.address && !client.industry && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>No details added.</p>
              )}
            </div>
          </section>

          {client.notes && (
            <section className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <User size={15} className="text-blue-600" />
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Notes</p>
              </div>
              <p className="text-sm whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>{client.notes}</p>
            </section>
          )}
        </div>

        {/* Quotes + Invoices */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quotes */}
          <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-blue-600" />
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Quotes</p>
              </div>
              <Link href={`/dashboard/quotes/new`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline">
                <Plus size={13} /> New
              </Link>
            </div>
            {client.quotations.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No quotes yet</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {client.quotations.map((q) => (
                  <Link key={q.id} href={`/dashboard/quotes/${q.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{q.quoteNumber}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{new Date(q.issueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(Number(q.total), q.currency)}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${QUOTE_BADGE[q.status]}`}>{q.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Invoices */}
          <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <Receipt size={15} className="text-blue-600" />
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Invoices</p>
              </div>
              <Link href={`/dashboard/invoices/new`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline">
                <Plus size={13} /> New
              </Link>
            </div>
            {client.invoices.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No invoices yet</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {client.invoices.map((inv) => (
                  <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{inv.invoiceNumber}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(Number(inv.total), inv.currency)}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${INV_BADGE[inv.status]}`}>{inv.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
