"use client";
import { useState, useEffect, useRef } from "react";
import { Building2, Mail, Phone, MapPin, Globe, CreditCard, Upload, Loader2, Check, FileText, Hash, ShoppingCart, TrendingUp, Palette } from "lucide-react";
import DocumentTemplate from "@/components/document/DocumentTemplate";

const CURRENCIES = ["LSL", "ZAR", "USD", "GBP", "EUR"];

interface Company {
  name: string; logo: string | null; email: string; phone: string;
  address: string; website: string; currency: string;
  vatNumber: string; registrationNumber: string; bankDetails: string;
  enabledModules: string[]; brandColor: string; brandBgColor: string;
}

const empty: Company = { name: "", logo: null, email: "", phone: "", address: "", website: "", currency: "LSL", vatNumber: "", registrationNumber: "", bankDetails: "", enabledModules: ["SALES"], brandColor: "#111827", brandBgColor: "#ffffff" };

const MODULES = [
  { key: "SALES", label: "Sales", description: "Quotations, invoices, payments, receipts", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  { key: "PROCUREMENT", label: "Procurement", description: "Suppliers, RFQs, purchase orders", icon: ShoppingCart, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
];

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Company>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/company/me").then((r) => r.json()).then((d) => {
      if (d.company) {
        setForm({
          name:               d.company.name               ?? "",
          logo:               d.company.logo               ?? null,
          email:              d.company.email              ?? "",
          phone:              d.company.phone              ?? "",
          address:            d.company.address            ?? "",
          website:            d.company.website            ?? "",
          currency:           d.company.currency           ?? "LSL",
          vatNumber:          d.company.vatNumber          ?? "",
          registrationNumber: d.company.registrationNumber ?? "",
          bankDetails:        d.company.bankDetails        ?? "",
          enabledModules:     Array.isArray(d.company.enabledModules) ? d.company.enabledModules : ["SALES"],
          brandColor:         d.company.brandColor         ?? "#111827",
          brandBgColor:       d.company.brandBgColor       ?? "#ffffff",
        });
      }
      setLoading(false);
    });
  }, []);

  const set = (field: keyof Company) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, logo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name) { setError("Company name is required."); return; }
    setError(""); setSaving(true);
    try {
      const res = await fetch("/api/company/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, enabledModules: form.enabledModules }),
      });
      let data: { error?: string } = {};
      try { data = await res.json(); } catch { /* empty body */ }
      if (!res.ok) { setError(data.error ?? "Failed to save"); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";
  const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" };

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <Loader2 size={22} className="animate-spin" style={{ color: "var(--text-muted)" }} />
    </div>
  );

  const previewItems = [
    { description: "Professional Services", quantity: 2, unitPrice: 1500, taxRate: 14 },
    { description: "Consulting Fee", quantity: 1, unitPrice: 3000, taxRate: 0 },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Manage your company profile and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
      )}

      {/* Branding + Live Preview */}
      <div className="grid lg:grid-cols-2 gap-6 items-start">
      <section className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <Building2 size={15} className="text-blue-600" />
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Branding</p>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Company Logo</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="relative flex items-center gap-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 p-4"
            style={{ borderColor: "var(--border)" }}
          >
            {form.logo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.logo} alt="logo" className="h-14 max-w-[160px] object-contain rounded" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Click to change logo</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>PNG, JPG, SVG recommended</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, logo: null })); }}
                  className="absolute top-3 right-3 text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                  <Upload size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Upload your logo</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Shown on all quotes and invoices</p>
                </div>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          </div>
        </div>

        {/* Company name */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Company Name <span className="text-red-500">*</span></label>
          <input value={form.name} onChange={set("name")} placeholder="Acme Corp" className={inputClass} style={inputStyle} />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Default Currency</label>
          <select value={form.currency} onChange={set("currency")} className={inputClass} style={inputStyle}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Brand colors */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette size={14} className="text-blue-600" />
            <label className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Document Colors</label>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Applied to all quotes, invoices and receipts.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Accent Color</label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={form.brandColor}
                    onChange={(e) => setForm((p) => ({ ...p, brandColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg border cursor-pointer p-0.5"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
                  />
                </div>
                <div>
                  <p className="text-xs font-mono font-semibold" style={{ color: "var(--text-primary)" }}>{form.brandColor}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Table header, totals bar</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Header Background</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.brandBgColor}
                  onChange={(e) => setForm((p) => ({ ...p, brandBgColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border cursor-pointer p-0.5"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
                />
                <div>
                  <p className="text-xs font-mono font-semibold" style={{ color: "var(--text-primary)" }}>{form.brandBgColor}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Document header & footer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live preview panel */}
      <div className="lg:sticky lg:top-6">
        <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>LIVE PREVIEW</p>
        <div style={{ transform: "scale(0.6)", transformOrigin: "top left", width: "166.67%", pointerEvents: "none" }}>
          <DocumentTemplate
            type="QUOTATION"
            docLabel="QUOTATION"
            accentColor={form.brandColor}
            bgColor={form.brandBgColor}
            logo={form.logo}
            companyName={form.name || "Your Company"}
            companyAddress={form.address || "123 Main St, Maseru"}
            companyEmail={form.email || "hello@company.com"}
            companyPhone={form.phone || "+266 5000 0000"}
            clientName="Sample Client Ltd"
            clientAddress="456 Client Ave, Maseru"
            clientEmail="client@example.com"
            docNumber="QUO-0001"
            issueDate={new Date().toLocaleDateString()}
            expiryOrDueDate={new Date(Date.now() + 30 * 86400000).toLocaleDateString()}
            currency={form.currency}
            items={previewItems}
            discount={0}
            notes="Thank you for your business."
          />
        </div>
      </div>
      </div>

      {/* Rest of settings — constrained width */}
      <div className="max-w-2xl space-y-6">
      {/* Contact */}
      <section className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <Mail size={15} className="text-blue-600" />
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Contact Details</p>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input type="email" value={form.email} onChange={set("email")} placeholder="hello@company.com" className={`${inputClass} pl-9`} style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Phone</label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input value={form.phone} onChange={set("phone")} placeholder="+266 5000 0000" className={`${inputClass} pl-9`} style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Address</label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-3" style={{ color: "var(--text-muted)" }} />
            <input value={form.address} onChange={set("address")} placeholder="123 Main St, Maseru, Lesotho" className={`${inputClass} pl-9`} style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Website</label>
          <div className="relative">
            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input value={form.website} onChange={set("website")} placeholder="https://company.com" className={`${inputClass} pl-9`} style={inputStyle} />
          </div>
        </div>
      </section>

      {/* Legal */}
      <section className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-blue-600" />
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Legal & Tax</p>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>VAT Number</label>
          <div className="relative">
            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input value={form.vatNumber} onChange={set("vatNumber")} placeholder="VAT123456789" className={`${inputClass} pl-9`} style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Registration Number</label>
          <div className="relative">
            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input value={form.registrationNumber} onChange={set("registrationNumber")} placeholder="REG123456" className={`${inputClass} pl-9`} style={inputStyle} />
          </div>
        </div>
      </section>

      {/* Bank details */}
      <section className="rounded-xl border p-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={15} className="text-blue-600" />
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Bank Details</p>
        </div>
        <textarea
          value={form.bankDetails}
          onChange={set("bankDetails")}
          rows={4}
          placeholder={"Bank: Standard Bank Lesotho\nAccount: 98000123454\nBranch: 000001"}
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
          style={inputStyle}
        />
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Shown in the Notes & Terms section of your documents when filled in.</p>
      </section>

      {/* Modules */}
      <section className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Modules</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Enable or disable modules to show or hide them in the sidebar.</p>
        </div>
        <div className="space-y-3">
          {MODULES.map(({ key, label, description, icon: Icon, color, bg }) => {
            const enabled = form.enabledModules.includes(key);
            const toggle = () => setForm((p) => ({
              ...p,
              enabledModules: enabled
                ? p.enabledModules.filter((m) => m !== key)
                : [...p.enabledModules, key],
            }));
            return (
              <div key={key} className="flex items-center justify-between gap-4 p-4 rounded-xl border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggle}
                  className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            );
          })}
        </div>
      </section>
      </div>
    </div>
  );
}
