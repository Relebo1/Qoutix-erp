"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, Ban, DollarSign, Trophy, X } from "lucide-react";
import { RFQStatus } from "@prisma/client";

interface Supplier { supplierId: number; supplierName: string; quotedPrice: number | null; }

export default function RFQActions({ rfqId, status }: { rfqId: number; status: RFQStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const patch = async (body: object, key: string) => {
    setLoading(key);
    await fetch(`/api/rfqs/${rfqId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(null);
    router.refresh();
  };

  const loadSuppliers = async () => {
    const res = await fetch(`/api/rfqs/${rfqId}`);
    const data = await res.json();
    return data.rfq.suppliers.map((s: { supplierId: number; supplier: { name: string }; quotedPrice: string | null }) => ({
      supplierId: s.supplierId,
      supplierName: s.supplier.name,
      quotedPrice: s.quotedPrice != null ? Number(s.quotedPrice) : null,
    }));
  };

  const openQuoteModal = async () => { setSuppliers(await loadSuppliers()); setShowQuoteModal(true); };
  const openAwardModal = async () => {
    const all = await loadSuppliers();
    setSuppliers(all.filter((s: Supplier) => s.quotedPrice != null));
    setShowAwardModal(true);
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {status === RFQStatus.DRAFT && (
          <button onClick={() => patch({ status: RFQStatus.SENT }, "SENT")} disabled={!!loading}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            {loading === "SENT" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send RFQ
          </button>
        )}
        {(status === RFQStatus.SENT || status === RFQStatus.RESPONSES_RECEIVED) && (
          <button onClick={openQuoteModal}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-blue-400 hover:text-blue-600"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
            <DollarSign size={14} /> Record Quote
          </button>
        )}
        {status === RFQStatus.RESPONSES_RECEIVED && (
          <button onClick={openAwardModal}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Trophy size={14} /> Award Supplier
          </button>
        )}
        {status !== RFQStatus.CANCELLED && status !== RFQStatus.CLOSED && (
          <button onClick={() => patch({ status: RFQStatus.CANCELLED }, "CANCEL")} disabled={!!loading}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-red-400 hover:text-red-500"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg-card)" }}>
            {loading === "CANCEL" ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />} Cancel
          </button>
        )}
      </div>

      {showQuoteModal && (
        <RecordQuoteModal rfqId={rfqId} suppliers={suppliers}
          onClose={() => setShowQuoteModal(false)}
          onSaved={() => { setShowQuoteModal(false); router.refresh(); }} />
      )}
      {showAwardModal && (
        <AwardModal rfqId={rfqId} suppliers={suppliers}
          onClose={() => setShowAwardModal(false)}
          onSaved={() => { setShowAwardModal(false); router.refresh(); }} />
      )}
    </>
  );
}

function RecordQuoteModal({ rfqId, suppliers, onClose, onSaved }: {
  rfqId: number; suppliers: Supplier[]; onClose: () => void; onSaved: () => void;
}) {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.supplierId ?? 0);
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || Number(price) <= 0) { setError("Enter a valid price."); return; }
    setSaving(true);
    const res = await fetch(`/api/rfqs/${rfqId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "RECORD_QUOTE", supplierId, quotedPrice: Number(price), notes }),
    });
    setSaving(false);
    if (res.ok) onSaved(); else setError("Failed to record quote.");
  };

  const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-sm rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Record Supplier Quote</p>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Supplier</label>
            <select value={supplierId} onChange={(e) => setSupplierId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={inputStyle}>
              {suppliers.map((s) => <option key={s.supplierId} value={s.supplierId}>{s.supplierName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Quoted Price</label>
            <input type="number" step="0.01" min="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" style={inputStyle} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg border"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>Cancel</button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white">
              {saving && <Loader2 size={13} className="animate-spin" />} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AwardModal({ rfqId, suppliers, onClose, onSaved }: {
  rfqId: number; suppliers: Supplier[]; onClose: () => void; onSaved: () => void;
}) {
  const sorted = [...suppliers].sort((a, b) => (a.quotedPrice ?? 0) - (b.quotedPrice ?? 0));
  const [supplierId, setSupplierId] = useState(sorted[0]?.supplierId ?? 0);
  const [saving, setSaving] = useState(false);

  const handleAward = async () => {
    setSaving(true);
    await fetch(`/api/rfqs/${rfqId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "AWARD", supplierId }),
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-sm rounded-2xl border shadow-2xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Award Supplier</p>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Select the supplier to award. The RFQ will be marked Closed.</p>
          <div className="space-y-2">
            {sorted.map((s) => (
              <button key={s.supplierId} type="button" onClick={() => setSupplierId(s.supplierId)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${supplierId === s.supplierId ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "hover:border-gray-400"}`}
                style={supplierId === s.supplierId ? {} : { borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{s.supplierName}</span>
                <span className="font-semibold text-emerald-600">
                  {s.quotedPrice != null ? `LSL ${s.quotedPrice.toLocaleString("en-LS", { minimumFractionDigits: 2 })}` : "—"}
                </span>
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg border"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>Cancel</button>
            <button onClick={handleAward} disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white">
              {saving && <Loader2 size={13} className="animate-spin" />}
              <Trophy size={13} /> Award
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
