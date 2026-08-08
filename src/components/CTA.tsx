import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-20 border-t" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Get Started Today</p>
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight" style={{ color: "var(--text-primary)" }}>
          Ready to simplify your business?
        </h2>
        <p className="text-base mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Join hundreds of freelancers and small businesses already using Quotix to create quotes, manage clients, and get paid faster.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-lg transition-colors shadow-sm text-sm"
          >
            Create Your Free Account <ArrowRight size={15} />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 border font-semibold px-7 py-3 rounded-lg transition-colors text-sm hover:border-blue-400 hover:text-blue-600"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)", backgroundColor: "var(--bg-card)" }}
          >
            View Demo
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-xs" style={{ color: "var(--text-muted)" }}>
          {["No credit card required", "Cancel anytime", "Free plan forever"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "var(--border)" }} />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
