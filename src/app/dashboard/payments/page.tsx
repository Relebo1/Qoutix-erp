"use client";
import { useState, useEffect } from "react";
import { CreditCard, Plus, X, Loader2, Receipt } from "lucide-react";
import Link from "next/link";
import DateInput from "@/components/DateInput";

const METHODS = ["CASH", "BANK", "CARD", "MOBILE_MONEY", "ONLINE"];
const METHOD_LABEL: Record<string, string> = { CASH: "Cash", BANK: "Bank Transfer", CARD: "Card", MOBILE_MONEY: "Mobile Money", ONLINE: "Online" };

interface Payment {
  id: number; paymentNumber: string; amount: number; paymentMethod: string; reference: string | null;
  paymentDate: string; notes: string | null;
  invoice: { invoiceNumber: string; currency: string; client: { companyName: string } };
  receipt: { id: number; receiptNumber: string } | null;
}
interface Invoice { id: number; invoiceNumber: string; currency: string; total: number; client: { companyName: string } }

function fmt(n: number, currency: string) {
  return `${currency} ${Number(n).toLocaleString("en-LS", { minimumFractionDigits: 2 })}`;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ invoiceId: "", amount: "", paymentMethod: "BANK", reference: "", paymentDate: new Date().toISOString().slice(0, 10), notes: "" });

  const load = () => {
    Promise.all([
      fetch("/api/payments").then(r => r.json()),
      fetch("/api/invoices").then(r => r.json()),
    ]).then(([p, inv]) => {
      setPayments(p.payments ?? []);
      setInvoices((inv.invoices ?? []).filter((i: Invoice & { status: string }) => i.status !== "CANCELLED"));
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    if (!form.invoiceId || !form.amount || !form.paymentDate) { setError("Invoice, amount and date are required."); return; }
    setError(""); setSaving(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: Number(form.invoiceId), amount: Number(form.amount), paymentMethod: form.paymentMethod, reference: form.reference, paymentDate: form.paymentDate, notes: form.notes }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      setShowModal(false);
      setForm({ invoiceId: "", amount: "", paymentMethod: "BANK", reference: "", paymentDate: new Date().toISOString().slice(0, 10), notes: "" });
      load();
    } finally { setSaving(false); }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" };

  const total = payments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Payments</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{payments.length} payment{payments.length !== 1 ? "s" : ""} recorded</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus size={15} /> Record Payment
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Collected", value: fmt(total, "M"), color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "This Month", value: fmt(payments.filter(p => new Date(p.paymentDate).getMonth() === new Date().getMonth()).reduce((s, p) => s + Number(p.amount), 0), "M"), color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-950" },
          { label: "Transactions", value: String(payments.length), color: "text-violet-700 dark:text-violet-300", bg: "bg-violet-50 dark:bg-violet-950" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl border p-4 ${bg}`} style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={22} className="animate-spin" style={{ color: "var(--text-muted)" }} /></div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <CreditCard size={26} className="text-blue-600" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No payments yet</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Record your first payment against an invoice.</p>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors mt-1">
              <Plus size={14} /> Record Payment
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "var(--bg)" }}>
              <tr>
                {["Date", "Client", "Invoice", "Payment No", "Method", "Reference", "Amount", "Receipt"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < payments.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-secondary)" }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 font-medium" style={{ color: "var(--text-primary)" }}>{p.invoice.client.companyName}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/invoices/${p.id}`} className="text-blue-600 hover:underline font-medium">{p.invoice.invoiceNumber}</Link>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-medium" style={{ color: "var(--text-muted)" }}>{p.paymentNumber}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-secondary)" }}>{METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>{p.reference ?? "—"}</td>
                  <td className="px-5 py-3.5 font-bold" style={{ color: "var(--text-primary)" }}>{fmt(p.amount, p.invoice.currency)}</td>
                  <td className="px-5 py-3.5">
                    {p.receipt ? (
                      <Link href={`/dashboard/receipts/${p.receipt.id}`} className="text-emerald-600 hover:underline text-xs font-semibold">
                        {p.receipt.receiptNumber}
                      </Link>
                    ) : <span style={{ color: "var(--text-muted)" }} className="text-xs">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-blue-600" />
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Record Payment</h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
            </div>

            {error && <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Invoice</label>
                <select value={form.invoiceId} onChange={set("invoiceId")} className={inputClass} style={inputStyle}>
                  <option value="">Select invoice…</option>
                  {invoices.map(inv => <option key={inv.id} value={inv.id}>{inv.invoiceNumber} — {inv.client.companyName} ({fmt(inv.total, inv.currency)})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Amount</label>
                  <input type="number" min={0} value={form.amount} onChange={set("amount")} placeholder="0.00" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Date</label>
                  <DateInput value={form.paymentDate} onChange={(v) => setForm((p) => ({ ...p, paymentDate: v }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Method</label>
                  <select value={form.paymentMethod} onChange={set("paymentMethod")} className={inputClass} style={inputStyle}>
                    {METHODS.map(m => <option key={m} value={m}>{METHOD_LABEL[m]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Reference</label>
                  <input value={form.reference} onChange={set("reference")} placeholder="TXN-001" className={inputClass} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Notes</label>
                <textarea value={form.notes} onChange={set("notes")} rows={2} placeholder="Optional notes…" className={`${inputClass} resize-none`} style={inputStyle} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={() => setShowModal(false)} className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors" style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg)" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                {saving && <Loader2 size={13} className="animate-spin" />} Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
