import { ShieldCheck, FileCheck, LayoutTemplate, Lock } from "lucide-react";
import ComingSoonLink from "./ComingSoonLink";

const trustItems = [
  { icon: ShieldCheck, title: "Secure Cloud Storage", description: "All your data is encrypted and securely stored in the cloud. Access it from anywhere, anytime.", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  { icon: FileCheck, title: "Professional Documents", description: "Every quote and invoice looks polished and branded — ready to impress your clients.", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  { icon: LayoutTemplate, title: "Business-Ready Templates", description: "Start with clean, professional templates designed for service businesses.", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
  { icon: Lock, title: "Data Protection", description: "Your business data is private and protected. We never share or sell your information.", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
];

export default function Trust() {
  return (
    <section id="solutions" className="py-20 border-t" style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Built for Business</p>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            A platform you can trust
          </h2>
          <p className="max-w-lg mx-auto text-base" style={{ color: "var(--text-secondary)" }}>
            Quotix is built with the reliability and security that small businesses depend on.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trustItems.map((item) => (
            <div key={item.title} className="rounded-xl p-6 border hover:shadow-sm transition-shadow text-center" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-4`}>
                <item.icon size={22} className={item.color} strokeWidth={1.75} />
              </div>
              <h3 className="font-semibold mb-2 text-sm" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            An affordable, simple alternative to expensive accounting software.
          </p>
          <ComingSoonLink
            feature="Try Quotix Free — Create your account"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm flex-shrink-0"
          >
            Try Quotix Free
          </ComingSoonLink>
        </div>
      </div>
    </section>
  );
}
