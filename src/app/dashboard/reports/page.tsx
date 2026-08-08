"use client";
import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Receipt, Users, AlertCircle, Loader2 } from "lucide-react";

interface Invoice {
  id: number; invoiceNumber: string; total: number; currency: string;
  status: string; dueDate: string; issueDate: string;
  client: { companyName: string };
}
interface Payment { amount: number; paymentDate: string; }

function fmt(n: number) {
  return `M ${Number(n).toLocaleString("en-LS", { minimumFractionDigits: 2 })}`;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/invoices").then(r => r.json()),
      fetch("/api/payments").then(r => r.json()),
    ]).then(([inv, pay]) => {
      setInvoices(inv.invoices ?? []);
      setPayments(pay.payments ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <Loader2 size={22} className="animate-spin" style={{ color: "var(--text-muted)" }} />
    </div>
  );

  // Summary stats — same KPI logic as dashboard
  const totalBilled = invoices.reduce((s, i) => s + Number(i.total), 0);
  // Revenue = sum of payment records (matches dashboard, always exists for PAID invoices)
  const totalPaid   = payments.reduce((s, p) => s + Number(p.amount), 0);
  const outstanding = invoices
    .filter(i => ["SENT", "VIEWED", "PARTIAL", "OVERDUE"].includes(i.status))
    .reduce((s, i) => s + Number(i.total), 0);
  const overdue     = invoices.filter(i => i.status === "OVERDUE").reduce((s, i) => s + Number(i.total), 0);

  // Revenue by month — based on payment records by paymentDate
  const now = new Date();
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const total = payments
      .filter(p => { const pd = new Date(p.paymentDate); return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear(); })
      .reduce((s, p) => s + Number(p.amount), 0);
    return { label: MONTHS[d.getMonth()], total };
  });
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.total), 1);

  // Invoice aging — excludes DRAFT, PAID, CANCELLED
  const aging = {
    current:   invoices.filter(i => ["SENT","VIEWED","PARTIAL","OVERDUE"].includes(i.status) && new Date(i.dueDate) >= now),
    due1_30:   invoices.filter(i => { const d = (now.getTime() - new Date(i.dueDate).getTime()) / 86400000; return ["SENT","VIEWED","PARTIAL","OVERDUE"].includes(i.status) && d > 0 && d <= 30; }),
    due31_60:  invoices.filter(i => { const d = (now.getTime() - new Date(i.dueDate).getTime()) / 86400000; return ["SENT","VIEWED","PARTIAL","OVERDUE"].includes(i.status) && d > 30 && d <= 60; }),
    due60plus: invoices.filter(i => { const d = (now.getTime() - new Date(i.dueDate).getTime()) / 86400000; return ["SENT","VIEWED","PARTIAL","OVERDUE"].includes(i.status) && d > 60; }),
  };

  // Top clients by PAID invoice revenue
  const clientPaymentMap: Record<string, number> = {};
  invoices.forEach(inv => {
    // use paid invoices total as proxy for per-client revenue
    if (inv.status === "PAID") {
      clientPaymentMap[inv.client.companyName] = (clientPaymentMap[inv.client.companyName] ?? 0) + Number(inv.total);
    }
  });
  // fall back to all invoices if no paid ones exist yet
  const clientMap: Record<string, number> = Object.keys(clientPaymentMap).length
    ? clientPaymentMap
    : invoices.reduce((m, inv) => ({ ...m, [inv.client.companyName]: (m[inv.client.companyName] ?? 0) + Number(inv.total) }), {} as Record<string, number>);
  const topClients = Object.entries(clientMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Reports</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Business overview and financial summary</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Billed",  value: fmt(totalBilled),  icon: Receipt,    color: "text-blue-700 dark:text-blue-300",    bg: "bg-blue-50 dark:bg-blue-950" },
          { label: "Total Paid",    value: fmt(totalPaid),    icon: TrendingUp, color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "Outstanding",   value: fmt(outstanding),  icon: BarChart3,  color: outstanding > 0 ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300",   bg: outstanding > 0 ? "bg-amber-50 dark:bg-amber-950" : "bg-emerald-50 dark:bg-emerald-950" },
          { label: "Overdue",       value: fmt(overdue),      icon: AlertCircle,color: "text-red-700 dark:text-red-300",     bg: "bg-red-50 dark:bg-red-950" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-xl border p-4 ${bg}`} style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
              <Icon size={15} className={color} />
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue bar chart */}
        <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={15} className="text-blue-600" />
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Revenue — Last 6 Months</p>
          </div>
          <div className="flex items-end gap-3 h-40">
            {monthlyRevenue.map(({ label, total }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                <p className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
                  {total > 0 ? `M${(total / 1000).toFixed(1)}k` : ""}
                </p>
                <div className="w-full rounded-t-md bg-blue-600 transition-all" style={{ height: `${Math.max((total / maxRevenue) * 120, total > 0 ? 4 : 0)}px`, opacity: total > 0 ? 1 : 0.15 }} />
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top clients */}
        <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-blue-600" />
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Top Clients by Revenue</p>
          </div>
          {topClients.length === 0 ? (
            <p className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>No data yet</p>
          ) : (
            <div className="space-y-3">
              {topClients.map(([name, total], i) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-4" style={{ color: "var(--text-muted)" }}>{i + 1}</span>
                      <span className="text-sm font-medium truncate max-w-[160px]" style={{ color: "var(--text-primary)" }}>{name}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(total)}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${(total / topClients[0][1]) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice aging */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <AlertCircle size={15} className="text-amber-500" />
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Invoice Aging</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x" style={{ borderColor: "var(--border)" }}>
          {[
            { label: "Current", items: aging.current, color: "text-emerald-600" },
            { label: "1–30 days", items: aging.due1_30, color: "text-amber-600" },
            { label: "31–60 days", items: aging.due31_60, color: "text-orange-600" },
            { label: "60+ days", items: aging.due60plus, color: "text-red-600" },
          ].map(({ label, items, color }) => (
            <div key={label} className="p-5">
              <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className={`text-lg font-bold ${color}`}>{fmt(items.reduce((s, i) => s + Number(i.total), 0))}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{items.length} invoice{items.length !== 1 ? "s" : ""}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
