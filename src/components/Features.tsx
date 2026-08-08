import { FileText, Receipt, Users, Package, Palette, LayoutDashboard, Check } from "lucide-react";

const features = [
  { icon: FileText, title: "Quotation Builder", description: "Create professional quotations in minutes. Add line items, apply taxes, and export a branded PDF instantly.", highlights: ["Add products & services", "Auto tax calculations", "Export to PDF"], color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  { icon: Receipt, title: "Invoice Tracking", description: "Monitor payments and outstanding invoices. Convert accepted quotes to invoices with a single click.", highlights: ["One-click conversion", "Payment status tracking", "Outstanding balance view"], color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
  { icon: Users, title: "Client Management", description: "Keep all customer information organized. View the full history of quotes and invoices per client.", highlights: ["Client profiles", "Quote & invoice history", "Contact management"], color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
  { icon: Package, title: "Product Catalog", description: "Save reusable services and pricing. Build quotes faster by pulling items directly from your catalog.", highlights: ["Reusable service items", "Custom pricing", "Quick-add to quotes"], color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  { icon: Palette, title: "Business-Ready Documents", description: "Add your logo and business details. Choose from clean, professional PDF templates that impress clients.", highlights: ["Custom logo & branding", "Business details", "Professional templates"], color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950" },
  { icon: LayoutDashboard, title: "Business Dashboard", description: "Get a real-time overview of your business. Track revenue, monitor quote activity, and spot trends.", highlights: ["Revenue tracking", "Quote & invoice stats", "Business insights"], color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
];

export default function Features() {
  return (
    <section id="features" className="py-20" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Everything your business needs
          </h2>
          <p className="max-w-lg mx-auto text-base" style={{ color: "var(--text-secondary)" }}>
            Purpose-built for service businesses. Simple to use from day one, powerful enough to grow with you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl p-6 border hover:shadow-md transition-all duration-200 group" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
                <f.icon size={20} className={f.color} strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>{f.description}</p>
              <ul className="space-y-1.5 border-t pt-3" style={{ borderColor: "var(--border-subtle)" }}>
                {f.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Check size={12} className={f.color} strokeWidth={2.5} />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
