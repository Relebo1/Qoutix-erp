"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import DateInput from "@/components/DateInput";

interface Supplier { id: number; name: string; }
interface PO { id: number; poNumber: string; supplierId: number; }

function NewSupplierInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledPoId = searchParams.get("poId");

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PO[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [purchaseOrderId, setPurchaseOrderId] = useState(prefilledPoId ?? "");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("LSL");
  const [amount, setAmount] = useState("");
  const [tax, setTax] = useState("0");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/suppliers").then((r) => r.json()).then((d) => {
      setSuppliers((d.suppliers ?? []).filter((s: Supplier & { status: string }) => s.status === "ACTIVE"));
    });
    fetch("/api/purchase-orders").then((r) => r.json()).then((d) => {
      setPurchaseOrders(d.orders ?? []);
      if (prefilledPoId) {
        const po = (d.orders ?? []).find((p: PO) => String(p.id) === prefilledPoId);
        if (po) setSupplierId(String(po.supplierId));
      }
    });
    fetch("/api/company/me").then((r) => r.json()).then((d) => {
      if (d.company?.currency) setCurrency(d.company.currency);
    });
  }, [prefilledPoId]);

  const handleSave = async () => {
    if (!supplierId) { setError("Select a supplier."); return; }
    if (!invoiceNumber) { setError("Invoice number is required."); return; }
    if (!dueDate) { setError("Due date is required."); return; }
    if (!amount || Number(amount) <= 0) { setError("Amount must be greater than 0."); return; }
    setError(""); setSaving(true);
    try {
      const res = await fetch("/api/supplier-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: Number(supplierId),
          purchaseOrderId: purchaseOrderId ? Number(purchaseOrderId) : null,
          invoiceNumber, invoiceDate, dueDate, currency,
          amount: Number(amount), tax: Number(tax), notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save."); return; }
      router.push(`/dashboard/supplier-invoices/${data.invoice.id}`);
    } finally { setSaving(false); }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" };
  const total = (Number(amount) || 0) + (Number(tax) || 0);

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/supplier-invoices" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
            <ChevronLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Record Supplier Invoice</h1>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          {saving && <Loader2 size={14} className="animate-spin" />} Save
        </button>
      </div>

      {error && <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>}

      <section className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Supplier *</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={inputClass} style={inputStyle}>
              <option value="">Select supplier…</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Purchase Order (optional)</label>
            <select value={purchaseOrderId} onChange={(e) => setPurchaseOrderId(e.target.value)} className={inputClass} style={inputStyle}>
              <option value="">None</option>
              {purchaseOrders.map((po) => <option key={po.id} value={po.id}>{po.poNumber}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Invoice Number *</label>
            <input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-001" className={inputClass} style={inputStyle} />
          </div>
          <DateInput label="Invoice Date" value={invoiceDate} onChange={setInvoiceDate} />
          <DateInput label="Due Date" value={dueDate} onChange={setDueDate} required />
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass} style={inputStyle}>
              {["LSL", "ZAR", "USD", "GBP", "EUR"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Amount *</label>
            <input type="number" min={0.01} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Tax</label>
            <input type="number" min={0} step="0.01" value={tax} onChange={(e) => setTax(e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div className="col-span-2 flex justify-between text-sm font-bold pt-1 border-t" style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}>
            <span>Total</span>
            <span>{currency} {total.toLocaleString("en-LS", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" style={inputStyle} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function NewSupplierInvoicePage() {
  return (
    <Suspense>
      <NewSupplierInvoiceForm />
    </Suspense>
  );
}
