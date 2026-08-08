"use client";
import { useState, useEffect } from "react";
import { Package, Plus, Pencil, Trash2, X, Loader2, Check } from "lucide-react";

interface Product { id: number; name: string; description: string | null; price: number; taxRate: number; unit: string | null; }
const empty = (): Omit<Product, "id"> => ({ name: "", description: "", price: 0, taxRate: 0, unit: "" });

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = () => fetch("/api/products").then(r => r.json()).then(d => { setProducts(d.products ?? []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty()); setError(""); setShowModal(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ name: p.name, description: p.description ?? "", price: p.price, taxRate: p.taxRate, unit: p.unit ?? "" }); setError(""); setShowModal(true); };

  const set = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: f === "price" || f === "taxRate" ? Number(e.target.value) : e.target.value }));

  const handleSave = async () => {
    if (!form.name) { setError("Name is required."); return; }
    setError(""); setSaving(true);
    try {
      const url = editing ? `/api/products/${editing.id}` : "/api/products";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      setShowModal(false);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" };

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Products & Services</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{products.length} item{products.length !== 1 ? "s" : ""} in catalog</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus size={15} /> Add Item
        </button>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={22} className="animate-spin" style={{ color: "var(--text-muted)" }} /></div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Package size={26} className="text-blue-600" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No items yet</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Add products or services to quickly fill line items on quotes and invoices.</p>
            <button onClick={openNew} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors mt-1">
              <Plus size={14} /> Add Item
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "var(--bg)" }}>
              <tr>
                {["Name", "Description", "Unit", "Tax %", "Price", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</td>
                  <td className="px-5 py-3.5 max-w-[200px] truncate" style={{ color: "var(--text-secondary)" }}>{p.description ?? "—"}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-secondary)" }}>{p.unit ?? "—"}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--text-secondary)" }}>{Number(p.taxRate)}%</td>
                  <td className="px-5 py-3.5 font-bold" style={{ color: "var(--text-primary)" }}>M {Number(p.price).toLocaleString("en-LS", { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors" style={{ color: "var(--text-muted)" }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-red-400 hover:text-red-600">
                        {deleting === p.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-blue-600" />
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{editing ? "Edit Item" : "Add Item"}</h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
            </div>

            {error && <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={set("name")} placeholder="Web Design" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Description</label>
                <textarea value={form.description ?? ""} onChange={set("description")} rows={2} placeholder="Optional description…" className={`${inputClass} resize-none`} style={inputStyle} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Price</label>
                  <input type="number" min={0} value={form.price} onChange={set("price")} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Tax %</label>
                  <input type="number" min={0} max={100} value={form.taxRate} onChange={set("taxRate")} className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Unit</label>
                  <input value={form.unit ?? ""} onChange={set("unit")} placeholder="hr, kg…" className={inputClass} style={inputStyle} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={() => setShowModal(false)} className="text-sm font-semibold px-4 py-2 rounded-lg border transition-colors" style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg)" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {editing ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
