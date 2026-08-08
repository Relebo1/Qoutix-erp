"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import DocumentTemplate from "@/components/document/DocumentTemplate";
import TemplateSection from "@/components/document/TemplateSection";
import DateInput from "@/components/DateInput";

interface Supplier { id: number; name: string; isPreferred: boolean; }
interface Item { description: string; quantity: number; unit: string; }

const emptyItem = (): Item => ({ description: "", quantity: 1, unit: "" });

export default function NewRFQPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [currency, setCurrency] = useState("LSL");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [accentColor, setAccentColor] = useState("#111827");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fontColor, setFontColor] = useState("#111827");
  const [fontFamily, setFontFamily] = useState("'Segoe UI', Arial, sans-serif");
  const [logo, setLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");

  useEffect(() => {
    fetch("/api/suppliers").then((r) => r.json()).then((d) => {
      setSuppliers((d.suppliers ?? []).filter((s: Supplier & { status: string }) => s.status === "ACTIVE"));
    });
    fetch("/api/company/me").then((r) => r.json()).then((d) => {
      if (d.company) {
        setCompanyName(d.company.name ?? "");
        setCompanyAddress(d.company.address ?? "");
        setCompanyEmail(d.company.email ?? "");
        setCompanyPhone(d.company.phone ?? "");
        if (d.company.logo) setLogo(d.company.logo);
        if (d.company.currency) setCurrency(d.company.currency);
        if (d.company.brandColor) setAccentColor(d.company.brandColor);
        if (d.company.brandBgColor) setBgColor(d.company.brandBgColor);
        if (d.company.brandFontColor) setFontColor(d.company.brandFontColor);
        if (d.company.brandFontFamily) setFontFamily(d.company.brandFontFamily);
      }
    });
  }, []);

  const toggleSupplier = (id: number) =>
    setSelectedSuppliers((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const updateItem = (i: number, field: keyof Item, value: string | number) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const handleSave = async (sendNow: boolean) => {
    if (!selectedSuppliers.length) { setError("Select at least one supplier."); return; }
    if (items.some((i) => !i.description)) { setError("All items need a description."); return; }
    setError(""); setSaving(true);
    try {
      const res = await fetch("/api/rfqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryDate: deliveryDate || null, currency, notes, items, supplierIds: selectedSuppliers, accentColor, bgColor, fontColor, fontFamily }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save."); return; }
      if (sendNow) {
        await fetch(`/api/rfqs/${data.rfq.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "SENT" }),
        });
      }
      router.push("/dashboard/rfqs");
    } finally { setSaving(false); }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" };
  const previewItems = items.map((i) => ({ description: i.description || "—", quantity: i.quantity, unitPrice: 0, taxRate: 0 }));
  const selectedSupplierNames = suppliers.filter((s) => selectedSuppliers.includes(s.id)).map((s) => s.name).join(", ");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/rfqs" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
            <ChevronLeft size={18} />
          </Link>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>New RFQ</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSave(false)} disabled={saving} className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors" style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
            Save Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            {saving && <Loader2 size={14} className="animate-spin" />} Save & Send
          </button>
        </div>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>}

      <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">
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

          <section className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Select Suppliers</p>
            {suppliers.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No active suppliers. <Link href="/dashboard/suppliers/new" className="text-blue-600 hover:underline">Add one first.</Link>
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {suppliers.map((s) => {
                  const selected = selectedSuppliers.includes(s.id);
                  return (
                    <button key={s.id} type="button" onClick={() => toggleSupplier(s.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-colors ${selected ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300" : "hover:border-blue-300"}`}
                      style={selected ? {} : { borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg)" }}>
                      <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${selected ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                        {selected && <span className="text-white text-[10px] font-bold">✓</span>}
                      </span>
                      <span className="truncate">{s.name}</span>
                      {s.isPreferred && <span className="text-amber-500 text-[10px] ml-auto">★</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>RFQ Details</p>
            <div className="grid grid-cols-2 gap-4">
              <DateInput label="Required Delivery Date" value={deliveryDate} onChange={setDeliveryDate} />
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass} style={inputStyle}>
                  {["LSL","ZAR","USD","GBP","EUR"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Required Items</p>
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
                <input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="Item description"
                  className={inputClass} style={{ ...inputStyle, backgroundColor: "var(--bg-card)" }} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Quantity</label>
                    <input type="number" min={0.01} step="any" value={item.quantity} onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                      className={inputClass} style={{ ...inputStyle, backgroundColor: "var(--bg-card)" }} />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Unit (optional)</label>
                    <input value={item.unit} onChange={(e) => updateItem(i, "unit", e.target.value)} placeholder="pcs, kg, box…"
                      className={inputClass} style={{ ...inputStyle, backgroundColor: "var(--bg-card)" }} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setItems((p) => [...p, emptyItem()])} className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium">
              <Plus size={15} /> Add item
            </button>
          </section>

          <section className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Delivery instructions, specifications, terms…"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
          </section>
        </div>

        <div className="flex-1 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Live Preview</p>
          <DocumentTemplate
            type="QUOTATION"
            docLabel="REQUEST FOR QUOTATION"
            accentColor={accentColor}
            bgColor={bgColor}
            fontColor={fontColor}
            fontFamily={fontFamily}
            logo={logo}
            companyName={companyName}
            companyAddress={companyAddress}
            companyEmail={companyEmail}
            companyPhone={companyPhone}
            clientName={selectedSupplierNames || "Suppliers"}
            clientAddress=""
            clientEmail=""
            docNumber="RFQ-PREVIEW"
            issueDate={new Date().toLocaleDateString()}
            expiryOrDueDate={deliveryDate ? new Date(deliveryDate).toLocaleDateString() : "—"}
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
