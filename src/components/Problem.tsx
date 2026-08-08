import { FileX, AlertCircle, Table2, Clock } from "lucide-react";

const problems = [
  { icon: FileX, title: "Manual quotation creation", description: "Spending hours formatting quotes in Word or Google Docs, only to look unprofessional.", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950" },
  { icon: AlertCircle, title: "Lost invoices & missed payments", description: "Invoices get buried in email threads and you forget who still owes you money.", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950" },
  { icon: Table2, title: "Client data in spreadsheets", description: "Managing client contacts, history, and notes across messy, outdated spreadsheets.", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950" },
  { icon: Clock, title: "Chasing late payments", description: "No system to track outstanding invoices means you're always following up manually.", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950" },
];

export default function Problem() {
  return (
    <section className="py-20 border-t" style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div className="mb-10 lg:mb-0">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">The Problem</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight" style={{ color: "var(--text-primary)" }}>
              Running a business shouldn&apos;t feel this hard
            </h2>
            <p className="text-base leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
              Most small businesses and freelancers are stuck using outdated tools — Word docs, spreadsheets, and email threads — that waste time and make you look unprofessional.
            </p>
            <a href="#features" className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:underline">
              See how Quotix fixes this
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {problems.map((p) => (
              <div key={p.title} className="rounded-xl p-5 border hover:shadow-sm transition-shadow" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
                <div className={`w-9 h-9 rounded-lg ${p.bg} flex items-center justify-center mb-3`}>
                  <p.icon size={18} className={p.color} strokeWidth={1.75} />
                </div>
                <h3 className="font-semibold mb-1.5 text-sm" style={{ color: "var(--text-primary)" }}>{p.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
