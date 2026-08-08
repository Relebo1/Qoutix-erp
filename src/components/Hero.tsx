import { ArrowRight, TrendingUp, FileText, Users, Receipt, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-[580px] mx-auto lg:ml-auto">
      <div className="absolute -inset-3 bg-blue-50 dark:bg-blue-950/20 rounded-3xl" />

      <div className="relative rounded-2xl overflow-hidden shadow-2xl border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
        {/* Browser chrome */}
        <div className="px-4 py-2.5 flex items-center gap-2 border-b" style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)" }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-3">
            <div className="rounded border px-3 py-0.5 flex items-center gap-2 max-w-[200px] mx-auto" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-[10px] font-mono truncate" style={{ color: "var(--text-muted)" }}>quotix.soulkiddesign.com/dashboard</span>
            </div>
          </div>
        </div>

        <div className="flex h-[360px]">
          {/* Sidebar */}
          <div className="w-12 bg-gray-900 flex flex-col items-center pt-4 pb-3 gap-1 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center mb-2">
              <TrendingUp size={13} className="text-white" />
            </div>
            {[FileText, Receipt, Users].map((Icon, i) => (
              <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-700">
                <Icon size={13} className="text-gray-500" />
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="flex-1 overflow-hidden flex flex-col" style={{ backgroundColor: "var(--bg-subtle)" }}>
            {/* Top bar */}
            <div className="border-b px-4 py-2.5 flex items-center justify-between flex-shrink-0" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Dashboard</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Welcome back, Alex</p>
              </div>
              <button className="bg-blue-600 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-md">
                + New Quote
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-3 flex flex-col gap-3">
              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Revenue", value: "M 48,200", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950", border: "border-emerald-100 dark:border-emerald-900" },
                  { label: "Quotes", value: "24", icon: FileText, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950", border: "border-blue-100 dark:border-blue-900" },
                  { label: "Invoices", value: "18", icon: Receipt, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950", border: "border-violet-100 dark:border-violet-900" },
                  { label: "Clients", value: "31", icon: Users, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950", border: "border-sky-100 dark:border-sky-900" },
                ].map((s) => (
                  <div key={s.label} className={`${s.bg} border ${s.border} rounded-lg p-2`}>
                    <s.icon size={11} className={`${s.color} mb-1`} />
                    <p className="text-[9px] font-medium leading-none mb-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                    <p className="text-[10px] font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Two column layout */}
              <div className="grid grid-cols-5 gap-2 flex-1 min-h-0">
                {/* Recent Quotations */}
                <div className="col-span-3 rounded-lg border overflow-hidden flex flex-col" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
                  <div className="px-3 py-2 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: "var(--border)" }}>
                    <span className="text-[10px] font-semibold" style={{ color: "var(--text-primary)" }}>Recent Quotations</span>
                    <span className="text-blue-600 text-[9px] font-medium">View all →</span>
                  </div>
                  <div className="flex-1" style={{ borderColor: "var(--border-subtle)" }}>
                    {[
                      { client: "Acme Corp", amount: "M 12,500", status: "Accepted", badge: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400", icon: CheckCircle, iconColor: "text-emerald-500" },
                      { client: "Nova Studio", amount: "M 8,200", status: "Pending", badge: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400", icon: Clock, iconColor: "text-amber-500" },
                      { client: "Blue Agency", amount: "M 5,800", status: "Draft", badge: "bg-gray-100 dark:bg-gray-800 text-gray-500", icon: AlertCircle, iconColor: "text-gray-400" },
                    ].map((row) => (
                      <div key={row.client} className="px-3 py-1.5 flex items-center justify-between border-b last:border-0" style={{ borderColor: "var(--border-subtle)" }}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 text-[8px] font-bold flex-shrink-0">
                            {row.client[0]}
                          </div>
                          <span className="text-[10px] font-medium" style={{ color: "var(--text-primary)" }}>{row.client}</span>
                        </div>
                        <span className="text-[10px] font-semibold" style={{ color: "var(--text-primary)" }}>{row.amount}</span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${row.badge}`}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invoice status + clients */}
                <div className="col-span-2 flex flex-col gap-2">
                  <div className="rounded-lg border p-2.5 flex-1" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
                    <p className="text-[10px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Invoice Status</p>
                    <div className="space-y-1.5">
                      {[
                        { label: "Paid", count: 12, color: "bg-emerald-500", pct: "67%" },
                        { label: "Pending", count: 4, color: "bg-amber-400", pct: "22%" },
                        { label: "Overdue", count: 2, color: "bg-red-400", pct: "11%" },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="flex justify-between mb-0.5">
                            <span className="text-[9px]" style={{ color: "var(--text-secondary)" }}>{s.label}</span>
                            <span className="text-[9px] font-medium" style={{ color: "var(--text-secondary)" }}>{s.count}</span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                            <div className={`h-full ${s.color} rounded-full`} style={{ width: s.pct }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border p-2.5 flex-1" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
                    <p className="text-[10px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Top Clients</p>
                    <div className="space-y-1.5">
                      {[
                        { name: "Acme Corp", quotes: "8 quotes" },
                        { name: "Nova Studio", quotes: "5 quotes" },
                        { name: "Blue Agency", quotes: "3 quotes" },
                      ].map((c) => (
                        <div key={c.name} className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 text-[8px] font-bold flex-shrink-0">
                            {c.name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                            <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>{c.quotes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating paid invoice badge */}
      <div className="absolute -right-5 top-14 rounded-xl shadow-lg p-3 w-36 hidden lg:block border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 bg-emerald-50 dark:bg-emerald-950 rounded-lg flex items-center justify-center">
            <Receipt size={12} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold" style={{ color: "var(--text-primary)" }}>Invoice Paid</p>
            <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>INV-0042</p>
          </div>
        </div>
        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>M 3,400</p>
        <div className="flex items-center gap-1 mt-1">
          <CheckCircle size={10} className="text-emerald-500" />
          <span className="text-emerald-600 text-[9px] font-semibold">Marked as Paid</span>
        </div>
      </div>

      {/* Floating quote sent badge */}
      <div className="absolute -left-5 bottom-10 rounded-xl shadow-lg p-3 w-36 hidden lg:block border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center">
            <FileText size={12} className="text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold" style={{ color: "var(--text-primary)" }}>Quote Sent</p>
            <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>QUO-0087</p>
          </div>
        </div>
        <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Nova Studio</p>
        <p className="text-blue-600 text-[9px] font-medium mt-0.5">Awaiting response</p>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="pt-16 overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            Free to start — no credit card needed
          </div>

          <h1 className="text-4xl lg:text-[2.75rem] font-bold leading-[1.2] tracking-tight mb-5" style={{ color: "var(--text-primary)" }}>
            The smarter way to manage quotes, invoices & clients
          </h1>

          <p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: "var(--text-secondary)" }}>
            Quotix helps freelancers and small businesses create professional quotations, track invoices, and manage clients — all in one place. No spreadsheets, no chaos.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm text-sm"
            >
              Start for Free <ArrowRight size={15} />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm border"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)", backgroundColor: "var(--bg-card)" }}
            >
              See How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
            {[
              { value: "500+", label: "Businesses" },
              { value: "10k+", label: "Quotes Created" },
              { value: "Free", label: "To Start" },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-6">
                {i > 0 && <div className="w-px h-7" style={{ backgroundColor: "var(--border)" }} />}
                <div>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="relative">
          <DashboardMockup />
        </div>
      </div>

      {/* Trusted by bar */}
      <div className="border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Trusted by small businesses across Lesotho</p>
          <div className="flex items-center gap-6">
            {["Freelancers", "Agencies", "Consultants", "Contractors"].map((t) => (
              <span key={t} className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "var(--border)" }} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
