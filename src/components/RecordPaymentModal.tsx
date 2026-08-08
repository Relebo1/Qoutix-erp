"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, DollarSign } from "lucide-react";

const METHODS = ["CASH", "BANK", "CARD", "MOBILE_MONEY", "ONLINE"];

interface Props {
  invoiceId: number;
  invoiceNumber: string;
  currency: string;
  remaining: number;
  onClose: () => void;
}

export default function RecordPaymentModal({ invoiceId, invoiceNumber, currency, remaining, onClose }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState(remaining.toFixed(2));
  const [method, setMethod] = useState("BANK");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) <= 0) { setError("Amount must be greater than zero."); return; }
    setError(""); setSaving(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, amount: Number(amount), paymentMethod: method, paymentDate: date, reference, notes }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to record payment."); return; }
      onClose();
      router.refresh();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-600" />
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Record Payment — {invoiceNumber}</p>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Amount <span className="text-gray-400">(remaining: {currency} {remaining.toFixed(2)})</span>
              </label>
              <input
                type="number" step="0.01" min="0.01" max={remaining} value={amount}
                onChange={(e) => setAmount(e.target.value)} required
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Date</label>
              <input
                type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Payment Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}>
              {METHODS.map((m) => <option key={m}>{m.replace("_", " ")}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Reference (optional)</label>
            <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Bank ref, cheque no…"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-lg border transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white transition-colors">
              {saving && <Loader2 size={13} className="animate-spin" />}
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
