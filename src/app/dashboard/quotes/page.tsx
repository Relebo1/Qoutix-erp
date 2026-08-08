"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, FileText, ArrowRight, Search, Calendar, X } from "lucide-react";
import { QuotationStatus, QuotationDocType } from "@prisma/client";
import DateInput from "@/components/DateInput";

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

const DOC_TABS: { label: string; value: QuotationDocType | "ALL" }[] = [
  { label: "All",              value: "ALL" },
  { label: "Quotations",       value: QuotationDocType.QUOTATION },
  { label: "Proforma Invoice", value: QuotationDocType.PROFORMA_INVOICE },
  { label: "Sales Order",      value: QuotationDocType.SALES_ORDER },
];

interface Quote {
  id: number;
  quoteNumber: string;
  status: QuotationStatus;
  docType: QuotationDocType;
  total: string;
  currency: string;
  issueDate: string;
  expiryDate: string;
  client: { companyName: string };
}

function fmt(val: string, currency: string) {
  return `${currency} ${Number(val).toLocaleString("en-LS", { minimumFractionDigits: 2 })}`;
}

export default function QuotesPage() {
  const [all, setAll] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [docType, setDocType] = useState<QuotationDocType | "ALL">("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((d) => setAll(d.quotations ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = all.filter((q) => {
    if (docType !== "ALL" && q.docType !== docType) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!q.quoteNumber.toLowerCase().includes(s) && !q.client.companyName.toLowerCase().includes(s)) return false;
    }
    if (dateFrom && new Date(q.issueDate) < new Date(dateFrom)) return false;
    if (dateTo && new Date(q.issueDate) > new Date(dateTo)) return false;
    return true;
  });

  const clearFilters = () => { setSearch(""); setDateFrom(""); setDateTo(""); setDocType("ALL"); };
  const hasFilters = search || dateFrom || dateTo || docType !== "ALL";

  const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" };

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Quotes</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{filtered.length} of {all.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg border transition-colors ${showFilters ? "border-blue-500 text-blue-600" : "hover:border-blue-400"}`}
            style={showFilters ? {} : { borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
          >
            <Calendar size={14} /> Filter
          </button>
          <Link href="/dashboard/quotes/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} /> New
          </Link>
        </div>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by quote number or client…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            style={inputStyle}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Date filters */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>From</label>
              <DateInput value={dateFrom} onChange={setDateFrom} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>To</label>
              <DateInput value={dateTo} onChange={setDateTo} />
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 ml-auto">
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
        )}

        {/* Doc type tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl border w-fit" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          {DOC_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setDocType(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${docType === tab.value ? "bg-blue-600 text-white shadow-sm" : "hover:bg-black/5 dark:hover:bg-white/5"}`}
              style={docType === tab.value ? {} : { color: "var(--text-secondary)" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border py-16 flex items-center justify-center" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border py-20 flex flex-col items-center justify-center gap-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
            <FileText size={26} className="text-blue-600" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{all.length === 0 ? "No quotes yet" : "No results found"}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{all.length === 0 ? "Create your first quote to get started." : "Try adjusting your search or filters."}</p>
          {all.length === 0 && (
            <Link href="/dashboard/quotes/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors mt-1">
              <Plus size={14} /> New Quote
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}>
                {["#", "Client", "Type", "Amount", "Issue Date", "Expiry Date", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 font-medium" style={{ color: "var(--text-primary)" }}>{q.quoteNumber}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-secondary)" }}>{q.client.companyName}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800" style={{ color: "var(--text-secondary)" }}>
                      {q.docType === QuotationDocType.PROFORMA_INVOICE ? "Proforma" : q.docType === QuotationDocType.SALES_ORDER ? "Sales Order" : "Quote"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(q.total, q.currency)}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-muted)" }}>{new Date(q.issueDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-muted)" }}>{new Date(q.expiryDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${BADGE[q.status]}`}>{q.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/quotes/${q.id}`} className="text-blue-600 hover:text-blue-700">
                      <ArrowRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
