"use client";
import { useState, useEffect } from "react";
import { FileCheck, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

const METHOD_LABEL: Record<string, string> = {
  CASH: "Cash", BANK: "Bank Transfer", CARD: "Card",
  MOBILE_MONEY: "Mobile Money", ONLINE: "Online",
};

interface Receipt {
  id: number;
  receiptNumber: string;
  amount: number;
  currency: string;
  balanceDue: number;
  status: string;
  createdAt: string;
  payment: { paymentNumber: string; paymentMethod: string; reference: string | null; paymentDate: string };
  invoice: { invoiceNumber: string };
  client: { companyName: string };
}

function fmt(n: number, currency = "M") {
  return `${currency} ${Number(n).toLocaleString("en-LS", { minimumFractionDigits: 2 })}`;
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/receipts").then(r => r.json()).then(d => {
      setReceipts(d.receipts ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = receipts.filter(r =>
    r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.client.companyName.toLowerCase().includes(search.toLowerCase()) ||
    r.invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = receipts.filter(r => r.status === "ISSUED").reduce((s, r) => s + Number(r.amount), 0);
  const thisMonth = receipts.filter(r => {
    const d = new Date(r.payment.paymentDate);
    const now = new Date();
    return r.status === "ISSUED" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Receipts</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{receipts.length} receipt{receipts.length !== 1 ? "s" : ""} issued</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Receipts",   value: String(receipts.filter(r => r.status === "ISSUED").length), color: "text-blue-700 dark:text-blue-300",    bg: "bg-blue-50 dark:bg-blue-950" },
          { label: "Total Collected",  value: fmt(totalCollected),                                         color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "This Month",       value: fmt(thisMonth),                                              color: "text-violet-700 dark:text-violet-300",  bg: "bg-violet-50 dark:bg-violet-950" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl border p-4 ${bg}`} style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by receipt number, client or invoice…"
        className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
      />

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={22} className="animate-spin" style={{ color: "var(--text-muted)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
              <FileCheck size={26} className="text-emerald-600" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No receipts yet</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Receipts are generated automatically when a payment is recorded.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "var(--bg-subtle)" }}>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                {["Receipt No", "Client", "Invoice", "Payment", "Method", "Amount", "Date", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5 font-medium" style={{ color: "var(--text-primary)" }}>{r.receiptNumber}</td>
                  <td className="px-4 py-3.5" style={{ color: "var(--text-secondary)" }}>{r.client.companyName}</td>
                  <td className="px-4 py-3.5">
                    <Link href={`/dashboard/invoices/${r.invoice.invoiceNumber}`} className="text-blue-600 hover:underline font-medium">
                      {r.invoice.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>{r.payment.paymentNumber}</td>
                  <td className="px-4 py-3.5" style={{ color: "var(--text-secondary)" }}>{METHOD_LABEL[r.payment.paymentMethod] ?? r.payment.paymentMethod}</td>
                  <td className="px-4 py-3.5 font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(r.amount, r.currency)}</td>
                  <td className="px-4 py-3.5" style={{ color: "var(--text-muted)" }}>{new Date(r.payment.paymentDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      r.status === "ISSUED" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                                           : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/dashboard/receipts/${r.id}`} className="text-blue-600 hover:text-blue-700">
                      <ArrowRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
