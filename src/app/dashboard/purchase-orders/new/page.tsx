"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import DateInput from "@/components/DateInput";
import DocumentTemplate from "@/components/document/DocumentTemplate";
import TemplateSection from "@/components/document/TemplateSection";

interface Supplier { id: number; name: string; email: string | null; address: string | null; }
interface Item { description: string; quantity: number; unitPrice: number; taxRate: number; unit: string; }

const emptyItem = (): Item => ({ description: "", quantity: 1, unitPrice: 0, taxRate: 0, unit: "" });

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedDate, setExpectedDate] = useState("");
  const [currency, setCurrency] = useState("LSL");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Company branding for preview
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState("#111827");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fontColor, setFontColor] = useState("#111827");
  const [fontFamily, setFontFamily] = useState("'Segoe UI', Arial, sans-serif");

  useEffect(() => {
    fetch("/api/suppliers").then((r) => r.json()).then((d) => {
      setSuppliers((d.suppliers ?? []).filter((s: Supplier & { status: string }) => s.status === "ACTIVE"));
    });
    fetch("/api/company/me?noLogo=1").then((r) => r.json()).then((d) => {
      if (d.company) {
        setCompanyName(d.company.name ?? "");
        setCompanyAddress(d.company.address ?? "");
        setCompanyEmail(d.company.email ?? "");
        setCompanyPhone(d.company.phone ?? "");
        if (d.company.currency) setCurrency(d.company.currency);
        if (d.company.brandColor) setAccentColor(d.company.brandColor);
        if (d.company.brandBgColor) setBgColor(d.company.brandBgColor);
        if (d.company.brandFontColor) setFontColor(d.company.brandFontColor);
        if (d.company.brandFontFamily) setFontFamily(d.company.brandFontFamily);
      }
    }).catch(() => {});
    fetch("/api/company/me").then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.company?.logo) setLogo(d.company.logo);
    }).catch(() => {});
  }, []);

  const updateItem = (i: number, field: keyof Item, value: string | number) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.taxRate / 100), 0);
  const total = subtotal + tax;

  const handleSave = async (status: "DRAFT" | "SENT") => {
    if (!supplierId) { setError("Select a supplier."); return; }
    if (items.some((i) => !i.description || i.unitPrice <= 0)) { setError("All items need a description and price."); return; }
    setError(""); setSaving(true);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId: Number(supplierId), issueDate, expectedDate: expectedDate || null, currency, notes, items, status }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save."); return; }
      router.push(`/dashboard/purchase-orders/${data.order.id}`);
    } finally { setSaving(false); }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" };

  const selectedSupplier = suppliers.find((s) => String(s.id) === supplierId);

  const previewItems = items.map((i) => ({
    description: i.description + (i.unit ? ` (${i.unit})` : "") || "—",
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    taxRate: i.taxRate,
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/purchase-orders" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
            <ChevronLeft size={18} />
          </Link>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>New Purchase Order</h1>
        </div>
        <button onClick={() => handleSave("DRAFT")} disabled={saving}
          className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors" style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
          Save Draft
        </button>
        <button onClick={() => handleSave("SENT")} disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          {saving && <Loader2 size={14} className="animate-spin" />} Save & Send PO
        </button>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>}

      <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">
        {/* ── LEFT: Form ── */}
        <div className="w-[420px] flex-shrink-0 overflow-y-auto space-y-5 pr-1">

          <TemplateSection
            logo={logo}
            accentColor={accentColor}
            bgColor={bgColor}
            fontColor={fontColor}
            fontFamily={fontFamily}
            onLogoChange={setLogo}
            onAccentChange={setAccentColor}
            onBgChange={setBgColor}
            onFontColorChange={setFontColor}
            onFontFamilyChange={setFontFamily}
          />

          {/* Order details */}
          <section className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Order Details</p>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Supplier *</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={inputClass} style={inputStyle}>
                <option value="">Select supplier…</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DateInput label="Issue Date" value={issueDate} onChange={setIssueDate} />
              <DateInput label="Expected Delivery" value={expectedDate} onChange={setExpectedDate} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass} style={inputStyle}>
                {["LSL", "ZAR", "USD", "GBP", "EUR"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </section>

          {/* Line items */}
          <section className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Line Items</p>
            {items.map((item, i) => (
              <div key={i} className="rounded-lg border p-3 space-y-2" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Item {i + 1}</span>
                  {items.length > 1 && (
                    <button onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="Description"
                  className={inputClass} style={{ ...inputStyle, backgroundColor: "var(--bg-card)" }} />
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Qty", field: "quantity" as keyof Item, value: item.quantity, step: "any", min: 0.01 },
                    { label: "Unit Price", field: "unitPrice" as keyof Item, value: item.unitPrice, step: "0.01", min: 0 },
                    { label: "Tax %", field: "taxRate" as keyof Item, value: item.taxRate, step: "0.01", min: 0 },
                  ].map(({ label, field, value, step, min }) => (
                    <div key={field}>
                      <label className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{label}</label>
                      <input type="number" min={min} step={step} value={value} onChange={(e) => updateItem(i, field, Number(e.target.value))}
                        className={inputClass} style={{ ...inputStyle, backgroundColor: "var(--bg-card)" }} />
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Unit</label>
                    <input value={item.unit} onChange={(e) => updateItem(i, "unit", e.target.value)} placeholder="pcs"
                      className={inputClass} style={{ ...inputStyle, backgroundColor: "var(--bg-card)" }} />
                  </div>
                </div>
                <div className="text-right text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  {currency} {(item.quantity * item.unitPrice).toLocaleString("en-LS", { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
            <button onClick={() => setItems((p) => [...p, emptyItem()])} className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium">
              <Plus size={15} /> Add item
            </button>

            {/* Totals */}
            <div className="border-t pt-3 space-y-1.5" style={{ borderColor: "var(--border)" }}>
              <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                <span>Subtotal</span><span>{currency} {subtotal.toLocaleString("en-LS", { minimumFractionDigits: 2 })}</span>
              </div>
              {tax > 0 && <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                <span>Tax</span><span>{currency} {tax.toLocaleString("en-LS", { minimumFractionDigits: 2 })}</span>
              </div>}
              <div className="flex justify-between text-sm font-bold pt-1 border-t" style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}>
                <span>Total</span><span>{currency} {total.toLocaleString("en-LS", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Delivery instructions, terms…"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
          </section>
        </div>

        {/* ── RIGHT: Live preview ── */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Live Preview</p>
          <DocumentTemplate
            type="QUOTATION"
            docLabel="PURCHASE ORDER"
            accentColor={accentColor}
            bgColor={bgColor}
            fontColor={fontColor}
            fontFamily={fontFamily}
            logo={logo}
            companyName={companyName}
            companyAddress={companyAddress}
            companyEmail={companyEmail}
            companyPhone={companyPhone}
            clientName={selectedSupplier?.name ?? "Supplier Name"}
            clientAddress={selectedSupplier?.address ?? ""}
            clientEmail={selectedSupplier?.email ?? ""}
            docNumber="PO-PREVIEW"
            issueDate={new Date(issueDate).toLocaleDateString()}
            expiryOrDueDate={expectedDate ? new Date(expectedDate).toLocaleDateString() : "—"}
            currency={currency}
            items={previewItems}
            discount={0}
            notes={notes}
          />
        </div>
      </div>
    </div>
  );
}
