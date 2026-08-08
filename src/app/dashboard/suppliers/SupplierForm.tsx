"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft, Star } from "lucide-react";
import Link from "next/link";

interface SupplierFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  productsServices: string;
  paymentTerms: string;
  vatNumber: string;
  taxNumber: string;
  isPreferred: boolean;
  notes: string;
}

const empty: SupplierFormData = {
  name: "", contactPerson: "", email: "", phone: "", address: "",
  category: "", productsServices: "", paymentTerms: "",
  vatNumber: "", taxNumber: "", isPreferred: false, notes: "",
};

const PAYMENT_TERMS = ["Net 7", "Net 14", "Net 30", "Net 60", "COD", "Prepaid", "Custom"];
const CATEGORIES = ["Raw Materials", "Office Supplies", "IT & Technology", "Logistics", "Services", "Utilities", "Other"];

interface Props {
  initial?: Partial<SupplierFormData>;
  supplierId?: number;
}

export default function SupplierForm({ initial, supplierId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<SupplierFormData>({ ...empty, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof SupplierFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.contactPerson) { setError("Name and contact person are required."); return; }
    setError(""); setSaving(true);
    try {
      const res = await fetch(supplierId ? `/api/suppliers/${supplierId}` : "/api/suppliers", {
        method: supplierId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save."); return; }
      router.push(supplierId ? `/dashboard/suppliers/${supplierId}` : "/dashboard/suppliers");
      router.refresh();
    } finally { setSaving(false); }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={supplierId ? `/dashboard/suppliers/${supplierId}` : "/dashboard/suppliers"}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: "var(--text-muted)" }}>
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          {supplierId ? "Edit Supplier" : "New Supplier"}
        </h1>
      </div>

      {error && <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <section className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Supplier Details</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Supplier Name *</label>
              <input value={form.name} onChange={set("name")} placeholder="Acme Supplies Ltd" required className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Contact Person *</label>
              <input value={form.contactPerson} onChange={set("contactPerson")} placeholder="John Doe" required className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Phone</label>
              <input value={form.phone} onChange={set("phone")} placeholder="+266 5000 0000" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Email</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="supplier@example.com" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Category</label>
              <select value={form.category} onChange={set("category")} className={inputClass} style={inputStyle}>
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Address</label>
              <input value={form.address} onChange={set("address")} placeholder="123 Industrial Ave, Maseru" className={inputClass} style={inputStyle} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Products / Services Supplied</label>
              <textarea value={form.productsServices} onChange={set("productsServices")} rows={2} placeholder="Office stationery, printing supplies…"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                style={inputStyle} />
            </div>
          </div>
        </section>

        {/* Commercial */}
        <section className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Commercial & Tax</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Payment Terms</label>
              <select value={form.paymentTerms} onChange={set("paymentTerms")} className={inputClass} style={inputStyle}>
                <option value="">Select…</option>
                {PAYMENT_TERMS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>VAT Number</label>
              <input value={form.vatNumber} onChange={set("vatNumber")} placeholder="VAT123456" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Tax Number</label>
              <input value={form.taxNumber} onChange={set("taxNumber")} placeholder="TAX123456" className={inputClass} style={inputStyle} />
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Preferences</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, isPreferred: !p.isPreferred }))}
              className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 ${form.isPreferred ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600"}`}
            >
              <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${form.isPreferred ? "translate-x-4" : "translate-x-0"}`} />
            </button>
            <div className="flex items-center gap-1.5">
              <Star size={14} className={form.isPreferred ? "text-amber-500" : "text-gray-400"} fill={form.isPreferred ? "currentColor" : "none"} />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Mark as preferred supplier</span>
            </div>
          </label>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Notes</label>
            <textarea value={form.notes} onChange={set("notes")} rows={3} placeholder="Additional notes about this supplier…"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              style={inputStyle} />
          </div>
        </section>

        <div className="flex justify-end gap-2">
          <Link href={supplierId ? `/dashboard/suppliers/${supplierId}` : "/dashboard/suppliers"}
            className="px-4 py-2 text-sm font-semibold rounded-lg border transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {supplierId ? "Save Changes" : "Create Supplier"}
          </button>
        </div>
      </form>
    </div>
  );
}
