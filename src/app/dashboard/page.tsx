import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  TrendingUp, FileText, Receipt, Users,
  CheckCircle, Clock, AlertCircle, ArrowRight, Sunrise, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { QuotationStatus, InvoiceStatus } from "@prisma/client";

const QUOTE_BADGE: Record<QuotationStatus, string> = {
  DRAFT:     "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  SENT:      "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  VIEWED:    "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400",
  ACCEPTED:  "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  REJECTED:  "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  EXPIRED:   "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  CONVERTED: "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400",
  CANCELLED: "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

const INVOICE_BADGE: Record<InvoiceStatus, string> = {
  DRAFT:     "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  SENT:      "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  VIEWED:    "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400",
  PARTIAL:   "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  PAID:      "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  OVERDUE:   "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  CANCELLED: "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

function QuoteStatusIcon({ status }: { status: QuotationStatus }) {
  if (status === QuotationStatus.ACCEPTED)  return <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />;
  if (status === QuotationStatus.SENT || status === QuotationStatus.VIEWED) return <Clock size={13} className="text-blue-500 flex-shrink-0" />;
  if (status === QuotationStatus.EXPIRED || status === QuotationStatus.REJECTED) return <AlertCircle size={13} className="text-amber-500 flex-shrink-0" />;
  return <AlertCircle size={13} className="text-gray-400 flex-shrink-0" />;
}

function formatAmount(value: number | string, currency: string) {
  return `${currency} ${Number(value).toLocaleString("en-LS", { minimumFractionDigits: 2 })}`;
}

function timeAgo(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  return `${Math.floor(diff / 86400)}d ago`;
}

function dueDateLabel(date: Date) {
  const diff = Math.floor((date.getTime() - Date.now()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  return `Due in ${diff}d`;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let companyId = 0;
  let firstName = "";

  if (token) {
    try {
      const payload = await verifyToken(token);
      companyId = payload.companyId;
      firstName = payload.email.split("@")[0]; // fallback until we fetch user

      const user = await prisma.user.findUnique({
        where: { id: Number(payload.sub) },
        select: { firstName: true },
      });
      if (user) firstName = user.firstName;
    } catch {
      // token invalid — middleware will redirect, just show empty state
    }
  }

  const [
    totalRevenue,
    quotationCount,
    awaitingQuotes,
    invoiceCount,
    overdueInvoices,
    unpaidTotal,
    clientCount,
    recentQuotes,
    recentInvoices,
    draftInvoices,
    dueTomorrowCount,
    expiringQuotesCount,
  ] = await Promise.all([
    // Revenue = sum of all payment records (guaranteed to exist for every PAID invoice)
    prisma.payment.aggregate({
      where: { companyId },
      _sum: { amount: true },
    }),
    prisma.quotation.count({ where: { companyId } }),
    // Awaiting response = SENT only (VIEWED/CONVERTED/etc. are not awaiting)
    prisma.quotation.count({
      where: { companyId, status: QuotationStatus.SENT },
    }),
    prisma.invoice.count({ where: { companyId } }),
    // Overdue = explicit OVERDUE status only
    prisma.invoice.count({
      where: { companyId, status: InvoiceStatus.OVERDUE },
    }),
    // Outstanding = SENT + VIEWED + PARTIAL + OVERDUE (excludes DRAFT, PAID, CANCELLED)
    prisma.invoice.aggregate({
      where: { companyId, status: { in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] } },
      _sum: { total: true },
    }),
    prisma.client.count({ where: { companyId } }),
    prisma.quotation.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { client: { select: { companyName: true } } },
    }),
    prisma.invoice.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { client: { select: { companyName: true } } },
    }),
    // Draft invoices not yet sent
    prisma.invoice.count({ where: { companyId, status: InvoiceStatus.DRAFT } }),
    // Due tomorrow
    prisma.invoice.count({
      where: {
        companyId,
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.PARTIAL] },
        dueDate: {
          gte: new Date(new Date().setHours(0,0,0,0) + 86400000),
          lt:  new Date(new Date().setHours(0,0,0,0) + 2 * 86400000),
        },
      },
    }),
    // Quotations expiring today
    prisma.quotation.count({
      where: {
        companyId,
        status: { in: [QuotationStatus.SENT, QuotationStatus.VIEWED] },
        expiryDate: {
          gte: new Date(new Date().setHours(0,0,0,0)),
          lt:  new Date(new Date().setHours(0,0,0,0) + 86400000),
        },
      },
    }),
  ]);

  const revenue = Number(totalRevenue._sum.amount ?? 0);
  const outstanding = Number(unpaidTotal._sum.total ?? 0);

  const actionItems = [
    draftInvoices > 0 && `${draftInvoices} invoice${draftInvoices !== 1 ? "s" : ""} need to be sent`,
    dueTomorrowCount > 0 && `${dueTomorrowCount} invoice${dueTomorrowCount !== 1 ? "s" : ""} become${dueTomorrowCount === 1 ? "s" : ""} due tomorrow`,
    overdueInvoices > 0 && `${overdueInvoices} invoice${overdueInvoices !== 1 ? "s" : ""} are overdue`,
    expiringQuotesCount > 0 && `${expiringQuotesCount} quotation${expiringQuotesCount !== 1 ? "s" : ""} expire${expiringQuotesCount === 1 ? "s" : ""} today`,
  ].filter(Boolean) as string[];

  const stats = [
    {
      label: "Total Revenue",
      value: formatAmount(revenue, "M"),
      sub: "All time payments received",
      icon: TrendingUp,
      color: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-50 dark:bg-emerald-950",
      border: "border-emerald-100 dark:border-emerald-900",
    },
    {
      label: "Outstanding",
      value: formatAmount(outstanding, "M"),
      sub: `${overdueInvoices} overdue`,
      icon: Receipt,
      color: overdueInvoices > 0 ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300",
      bg: overdueInvoices > 0 ? "bg-red-50 dark:bg-red-950" : "bg-amber-50 dark:bg-amber-950",
      border: overdueInvoices > 0 ? "border-red-100 dark:border-red-900" : "border-amber-100 dark:border-amber-900",
    },
    {
      label: "Quotations",
      value: String(quotationCount),
      sub: `${awaitingQuotes} awaiting response`,
      icon: FileText,
      color: "text-blue-700 dark:text-blue-300",
      bg: "bg-blue-50 dark:bg-blue-950",
      border: "border-blue-100 dark:border-blue-900",
    },
    {
      label: "Clients",
      value: String(clientCount),
      sub: `${invoiceCount} invoice${invoiceCount !== 1 ? "s" : ""} total`,
      icon: Users,
      color: "text-sky-700 dark:text-sky-300",
      bg: "bg-sky-50 dark:bg-sky-950",
      border: "border-sky-100 dark:border-sky-900",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Greeting */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
          <Sunrise size={18} className="text-blue-600" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Welcome back, {firstName}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Here&apos;s an overview of your business.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg} ${s.border}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              <s.icon size={16} className={s.color} strokeWidth={1.75} />
            </div>
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/quotes/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <FileText size={15} /> New Quote
        </Link>
        <Link href="/dashboard/invoices/new" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-blue-400 hover:text-blue-600" style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
          <Receipt size={15} /> New Invoice
        </Link>
        <Link href="/dashboard/clients/new" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-blue-400 hover:text-blue-600" style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
          <Users size={15} /> Add Client
        </Link>
      </div>

      {/* Action Required widget */}
      {actionItems.length > 0 && (
        <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-amber-500" />
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Action Required</p>
          </div>
          <ul className="space-y-1.5">
            {actionItems.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Quotations */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Quotations</p>
            <Link href="/dashboard/quotes" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {recentQuotes.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <FileText size={28} className="mx-auto mb-2 text-gray-300 dark:text-gray-700" strokeWidth={1.5} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No quotations yet</p>
              <Link href="/dashboard/quotes/new" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Create your first quote</Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentQuotes.map((q) => (
                <Link key={q.id} href={`/dashboard/quotes/${q.id}`} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <QuoteStatusIcon status={q.status} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{q.client.companyName}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{q.quoteNumber} · {timeAgo(q.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{formatAmount(Number(q.total), q.currency)}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${QUOTE_BADGE[q.status]}`}>{q.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Invoices</p>
            <Link href="/dashboard/invoices" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Receipt size={28} className="mx-auto mb-2 text-gray-300 dark:text-gray-700" strokeWidth={1.5} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No invoices yet</p>
              <Link href="/dashboard/invoices/new" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Create your first invoice</Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentInvoices.map((inv) => (
                <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{inv.client.companyName}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {inv.invoiceNumber} · {inv.status === InvoiceStatus.PAID ? "Paid" : dueDateLabel(inv.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{formatAmount(Number(inv.total), inv.currency)}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${INVOICE_BADGE[inv.status]}`}>{inv.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
