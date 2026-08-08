"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import DateInput from "@/components/DateInput";
import ContractDocument from "@/components/document/ContractDocument";
import TemplateSection from "@/components/document/TemplateSection";

interface Supplier { id: number; name: string; email: string | null; address: string | null; phone: string | null; contactPerson: string; }

const SERVICE_TYPES = ["Cleaning Services", "Security", "Internet Provider", "Software Maintenance", "Vehicle Maintenance", "Catering", "Waste Management", "Other"];
const BILLING_FREQUENCIES = ["Monthly", "Quarterly", "Annually", "Upon Completion", "Other"];

export default function NewContractPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Branding
  const [logo, setLogo] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState("#111827");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fontColor, setFontColor] = useState("#111827");
  const [fontFamily, setFontFamily] = useState("'Segoe UI', Arial, sans-serif");

  // Company info
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyRegNumber, setCompanyRegNumber] = useState("");

  // Contract fields
  const [supplierId, setSupplierId] = useState("");
  const [supplierRegNumber, setSupplierRegNumber] = useState("");
  const [title, setTitle] = useState("SERVICE AGREEMENT CONTRACT");
  const [serviceType, setServiceType] = useState("");
  const [customService, setCustomService] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [currency, setCurrency] = useState("LSL");
  const [value, setValue] = useState("");
  const [billingFrequency, setBillingFrequency] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [paymentDueDays, setPaymentDueDays] = useState("");
  const [governingLaw, setGoverningLaw] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [notes, setNotes] = useState("");

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
        if (d.company.registrationNumber) setCompanyRegNumber(d.company.registrationNumber);
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

  const handleSave = async () => {
    if (!supplierId) { setError("Select a supplier."); return; }
    const finalService = serviceType === "Other" ? customService : serviceType;
    if (!finalService) { setError("Service type is required."); return; }
    if (!startDate || !endDate) { setError("Start and end dates are required."); return; }
    setError(""); setSaving(true);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: Number(supplierId), serviceType: finalService,
          startDate, endDate, renewalDate: renewalDate || null,
          value: value ? Number(value) : null, currency, notes,
          accentColor, bgColor, fontColor, fontFamily,
          title, description, billingFrequency: billingFrequency || null,
          paymentTerms: paymentTerms || null,
          paymentDueDays: paymentDueDays ? Number(paymentDueDays) : null,
          governingLaw: governingLaw || null,
          noticePeriod: noticePeriod ? Number(noticePeriod) : null,
          supplierRegNumber: supplierRegNumber || null,
          companyRegNumber: companyRegNumber || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save."); return; }
      router.push(`/dashboard/contracts/${data.contract.id}`);
    } finally { setSaving(false); }
  };

  const selectedSupplier = suppliers.find((s) => String(s.id) === supplierId);
  const finalService = serviceType === "Other" ? customService : serviceType;
  const ic = "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const is = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/contracts" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
            <ChevronLeft size={18} />
          </Link>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>New Contract</h1>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          {saving && <Loader2 size={14} className="animate-spin" />} Save Contract
        </button>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>}

      <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">
        {/* LEFT: Form */}
        <div className="w-[420px] flex-shrink-0 overflow-y-auto space-y-5 pr-1">

          <TemplateSection
            logo={logo} accentColor={accentColor} bgColor={bgColor}
            fontColor={fontColor} fontFamily={fontFamily}
            onLogoChange={setLogo} onAccentChange={setAccentColor}
            onBgChange={setBgColor} onFontColorChange={setFontColor}
            onFontFamilyChange={setFontFamily}
          />

          {/* Contract title */}
          <section className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Document Title</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="SERVICE AGREEMENT CONTRACT" className={ic} style={is} />
          </section>

          {/* Parties */}
          <section className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Parties</p>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Supplier *</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={ic} style={is}>
                <option value="">Select supplier…</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Supplier Reg. Number</label>
              <input value={supplierRegNumber} onChange={(e) => setSupplierRegNumber(e.target.value)} placeholder="e.g. 2023/123456" className={ic} style={is} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Your Company Reg. Number</label>
              <input value={companyRegNumber} onChange={(e) => setCompanyRegNumber(e.target.value)} placeholder="e.g. 2020/654321" className={ic} style={is} />
            </div>
          </section>

          {/* Service */}
          <section className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Service Details</p>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Service Type *</label>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className={ic} style={is}>
                <option value="">Select…</option>
                {SERVICE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            {serviceType === "Other" && (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Specify Service</label>
                <input value={customService} onChange={(e) => setCustomService(e.target.value)} placeholder="Describe the service…" className={ic} style={is} />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Service Description / Purpose</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the scope and purpose of this agreement…"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" style={is} />
            </div>
          </section>

          {/* Period */}
          <section className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Service Period</p>
            <div className="grid grid-cols-2 gap-3">
              <DateInput label="Start Date *" value={startDate} onChange={setStartDate} />
              <DateInput label="End Date *" value={endDate} onChange={setEndDate} />
              <DateInput label="Renewal Date" value={renewalDate} onChange={setRenewalDate} />
            </div>
          </section>

          {/* Financial */}
          <section className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Pricing & Payment</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Contract Value</label>
                <input type="number" min={0} step="0.01" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.00" className={ic} style={is} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={ic} style={is}>
                  {["LSL", "ZAR", "USD", "GBP", "EUR"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Billing Frequency</label>
              <select value={billingFrequency} onChange={(e) => setBillingFrequency(e.target.value)} className={ic} style={is}>
                <option value="">Select…</option>
                {BILLING_FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Payment Due (days after invoice)</label>
              <input type="number" min={0} value={paymentDueDays} onChange={(e) => setPaymentDueDays(e.target.value)} placeholder="e.g. 30" className={ic} style={is} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Payment Terms</label>
              <textarea value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} rows={2} placeholder="e.g. Payment due within 30 days of invoice date…"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" style={is} />
            </div>
          </section>

          {/* Legal */}
          <section className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Legal Terms</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Notice Period (days)</label>
                <input type="number" min={0} value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)} placeholder="e.g. 30" className={ic} style={is} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Governing Law (Country)</label>
                <input value={governingLaw} onChange={(e) => setGoverningLaw(e.target.value)} placeholder="e.g. Lesotho" className={ic} style={is} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Additional Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any additional terms or conditions…"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" style={is} />
            </div>
          </section>
        </div>

        {/* RIGHT: Live preview */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Live Preview</p>
          <ContractDocument
            accentColor={accentColor}
            bgColor={bgColor}
            fontColor={fontColor}
            fontFamily={fontFamily}
            logo={logo}
            contractNumber="CON-PREVIEW"
            status="DRAFT"
            title={title}
            description={description}
            companyName={companyName}
            companyAddress={companyAddress}
            companyEmail={companyEmail}
            companyPhone={companyPhone}
            companyRegNumber={companyRegNumber}
            supplierName={selectedSupplier?.name ?? "Supplier Name"}
            supplierAddress={selectedSupplier?.address ?? ""}
            supplierEmail={selectedSupplier?.email ?? ""}
            supplierPhone={selectedSupplier?.phone ?? ""}
            supplierContact={selectedSupplier?.contactPerson ?? ""}
            supplierRegNumber={supplierRegNumber}
            serviceType={finalService || "—"}
            startDate={startDate || "—"}
            endDate={endDate || "—"}
            renewalDate={renewalDate || undefined}
            currency={currency}
            value={value ? Number(value) : undefined}
            billingFrequency={billingFrequency || undefined}
            paymentTerms={paymentTerms || undefined}
            paymentDueDays={paymentDueDays ? Number(paymentDueDays) : undefined}
            governingLaw={governingLaw || undefined}
            noticePeriod={noticePeriod ? Number(noticePeriod) : undefined}
            notes={notes || undefined}
          />
        </div>
      </div>
    </div>
  );
}
