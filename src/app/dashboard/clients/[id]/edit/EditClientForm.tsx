"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Building2, User, Mail, Phone, MapPin, FileText } from "lucide-react";
import Link from "next/link";

const INDUSTRIES = [
  "Technology","Finance","Healthcare","Retail","Construction",
  "Education","Hospitality","Manufacturing","Consulting","Media",
  "Real Estate","Agriculture","Transport","Legal","Other",
];

interface Props {
  client: { id: number; companyName: string; contactName: string; email: string; phone: string; address: string; industry: string; notes: string; };
}

export default function EditClientForm({ client }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyName: client.companyName,
    contactName: client.contactName,
    email: client.email,
    phone: client.phone,
    address: client.address,
    industry: client.industry,
    notes: client.notes,
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.contactName) { setError("Company name and contact name are required."); return; }
    setError(""); setSaving(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save"); return; }
      router.push(`/dashboard/clients/${client.id}`);
    } finally { setSaving(false); }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";
  const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/clients/${client.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
          <ChevronLeft size={18} />
        </Link>
        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Edit Client</h1>
      </div>

      {error && <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={16} className="text-blue-600" />
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Company Information</p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Company Name <span className="text-red-500">*</span></label>
            <input value={form.companyName} onChange={set("companyName")} placeholder="Acme Corp" required className={inputClass} style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Industry</label>
              <select value={form.industry} onChange={set("industry")} className={inputClass} style={inputStyle}>
                <option value="">Select industry…</option>
                {INDUSTRIES.map(ind => <option key={ind}>{ind}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Phone</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input value={form.phone} onChange={set("phone")} placeholder="+266 5000 0000" className={`${inputClass} pl-9`} style={inputStyle} />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Address</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-3" style={{ color: "var(--text-muted)" }} />
              <input value={form.address} onChange={set("address")} placeholder="123 Main St, Maseru, Lesotho" className={`${inputClass} pl-9`} style={inputStyle} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-1">
            <User size={16} className="text-blue-600" />
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Contact Person</p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Contact Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input value={form.contactName} onChange={set("contactName")} placeholder="John Doe" required className={`${inputClass} pl-9`} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input type="email" value={form.email} onChange={set("email")} placeholder="john@acmecorp.com" className={`${inputClass} pl-9`} style={inputStyle} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border p-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-blue-600" />
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Notes</p>
          </div>
          <textarea value={form.notes} onChange={set("notes")} rows={3} placeholder="Any additional notes about this client…"
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            style={inputStyle} />
        </section>

        <div className="flex items-center justify-end gap-3 pt-1">
          <Link href={`/dashboard/clients/${client.id}`} className="text-sm font-semibold px-5 py-2.5 rounded-lg border transition-colors" style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
