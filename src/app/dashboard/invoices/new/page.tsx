"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import DocumentTemplate, { LineItem } from "@/components/document/DocumentTemplate";
import TemplateSection from "@/components/document/TemplateSection";
import DateInput from "@/components/DateInput";

const CURRENCIES = ["LSL","ZAR","USD","GBP","EUR"];

interface Client { id: number; companyName: string; contactName: string; email: string | null; address: string | null; }
interface Product { id: number; name: string; description: string | null; price: number; taxRate: number; unit: string | null; }

const emptyItem = (): LineItem => ({ description: "", quantity: 1, unitPrice: 0, taxRate: 0 });

export default function NewInvoicePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [accentColor, setAccentColor] = useState("#111827");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fontColor, setFontColor] = useState("#111827");
  const [fontFamily, setFontFamily] = useState("'Segoe UI', Arial, sans-serif");
  const [logo, setLogo] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");

  const [clientId, setClientId] = useState("");
  const [currency, setCurrency] = useState("LSL");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [plannedSendDate, setPlannedSendDate] = useState("");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);

  const selectedClient = clients.find((c) => String(c.id) === clientId);

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then((d) => setClients(d.clients ?? []));
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products ?? []));
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

  const updateItem = (i: number, field: keyof LineItem, value: string | number) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async (status: "DRAFT" | "SENT") => {
    if (!clientId) { setError("Please select a client."); return; }
    if (!dueDate) { setError("Please set a due date."); return; }
    if (items.some((i) => !i.description)) { setError("All line items need a description."); return; }
    setError(""); setSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: Number(clientId), currency, issueDate, dueDate, plannedSendDate: plannedSendDate || null, discount, notes, items, status, accentColor, bgColor, fontColor, fontFamily, logo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Failed to save"); return; }
      router.push("/dashboard/invoices");
    } finally { setSaving(false); }
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const discountedSubtotal = subtotal * (1 - discount / 100);
  const taxTotal = items.reduce((s, i) => s + i.quantity * i.unitPrice * (1 - discount / 100) * (i.taxRate / 100), 0);
  const total = discountedSubtotal + taxTotal;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/invoices" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
            <ChevronLeft size={18} />
          </Link>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>New Invoice</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSave("DRAFT")} disabled={saving} className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors" style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
            Save Draft
          </button>
          <button onClick={() => handleSave("SENT")} disabled={saving} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            {saving && <Loader2 size={14} className="animate-spin" />} Save & Send
          </button>
        </div>
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

          {/* Company info */}
          <section className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Your Details</p>
            {[
              { label: "Company name", value: companyName, set: setCompanyName, placeholder: "Acme Corp" },
              { label: "Address", value: companyAddress, set: setCompanyAddress, placeholder: "123 Main St, Maseru" },
              { label: "Email", value: companyEmail, set: setCompanyEmail, placeholder: "hello@company.com" },
              { label: "Phone", value: companyPhone, set: setCompanyPhone, placeholder: "+266 5000 0000" },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>{label}</label>
                <input value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
              </div>
            ))}
          </section>

          {/* Invoice details */}
          <section className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Invoice Details</p>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Client</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}>
                <option value="">Select client…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}>
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Discount %</label>
                <input type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DateInput label="Issue Date" value={issueDate} onChange={setIssueDate} />
              <DateInput label="Due Date" value={dueDate} onChange={setDueDate} />
            </div>
            <DateInput label="Planned Send Date" value={plannedSendDate} onChange={setPlannedSendDate} />
          </section>

          {/* Line items */}
          <section className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Line Items</p>
            {items.map((item, i) => (
              <div key={i} className="rounded-lg border p-3 space-y-2" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Item {i + 1}</span>
                  {items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>}
                </div>
                {products.length > 0 && (
                  <select onChange={(e) => { const p = products.find(p => String(p.id) === e.target.value); if (p) setItems(prev => prev.map((it, idx) => idx === i ? { ...it, description: p.name, unitPrice: Number(p.price), taxRate: Number(p.taxRate) } : it)); e.target.value = ""; }}
                    className="w-full px-3 py-1.5 rounded-lg border text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
                    <option value="">— Pick from catalog —</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (M {Number(p.price).toFixed(2)})</option>)}
                  </select>
                )}
                <input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="Description"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                <div className="grid grid-cols-3 gap-2">
                  {([["Qty","quantity"],["Unit Price","unitPrice"],["Tax %","taxRate"]] as [string, keyof LineItem][]).map(([label, field]) => (
                    <div key={field}>
                      <label className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{label}</label>
                      <input type="number" min={0} value={item[field] as number} onChange={(e) => updateItem(i, field, Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => setItems((p) => [...p, emptyItem()])} className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium">
              <Plus size={15} /> Add item
            </button>
            <div className="pt-3 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
              <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}><span>Subtotal</span><span>{currency} {subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-xs text-red-500"><span>Discount ({discount}%)</span><span>-{currency} {(subtotal * discount / 100).toFixed(2)}</span></div>}
              {taxTotal > 0 && <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}><span>Tax</span><span>{currency} {taxTotal.toFixed(2)}</span></div>}
              <div className="flex justify-between text-sm font-bold pt-1" style={{ color: "var(--text-primary)" }}><span>Total</span><span>{currency} {total.toFixed(2)}</span></div>
            </div>
          </section>

          <section className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Payment terms, bank details, etc."
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
          </section>
        </div>

        {/* ── RIGHT: Live preview ── */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Live Preview</p>
          <DocumentTemplate
            type="INVOICE"
            accentColor={accentColor}
            bgColor={bgColor}
            fontColor={fontColor}
            fontFamily={fontFamily}
            logo={logo}
            companyName={companyName}
            companyAddress={companyAddress}
            companyEmail={companyEmail}
            companyPhone={companyPhone}
            clientName={selectedClient?.companyName ?? ""}
            clientAddress={selectedClient?.address ?? ""}
            clientEmail={selectedClient?.email ?? ""}
            docNumber="INV-PREVIEW"
            issueDate={issueDate}
            expiryOrDueDate={dueDate}
            currency={currency}
            items={items}
            discount={discount}
            notes={notes}
          />
        </div>
      </div>
    </div>
  );
}
