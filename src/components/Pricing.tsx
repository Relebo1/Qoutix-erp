import { Check } from "lucide-react";
import ComingSoonLink from "./ComingSoonLink";

const plans = [
  {
    name: "Free",
    price: "M 0",
    period: "forever",
    description: "Perfect for getting started.",
    cta: "Get Started Free",
    popular: false,
    features: ["Up to 5 quotations/month", "1 client profile", "Basic PDF templates", "Product catalog (5 items)", "Dashboard overview"],
  },
  {
    name: "Professional",
    price: "M 299",
    period: "per month",
    description: "For freelancers and small businesses ready to grow.",
    cta: "Start Professional",
    popular: true,
    features: ["Unlimited quotations", "Unlimited clients", "Custom branding & logo", "Unlimited product catalog", "Invoice management", "PDF export & download", "Payment status tracking", "Priority support"],
  },
  {
    name: "Business",
    price: "M 699",
    period: "per month",
    description: "For agencies and growing teams.",
    cta: "Start Business",
    popular: false,
    features: ["Everything in Professional", "Up to 5 team members", "Multiple business profiles", "Advanced reporting", "Client portal (coming soon)", "Dedicated support"],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 border-t" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Simple, transparent pricing
          </h2>
          <p className="max-w-lg mx-auto text-base" style={{ color: "var(--text-secondary)" }}>
            Start free, upgrade when you&apos;re ready. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border transition-all duration-200 ${plan.popular ? "scale-[1.02] relative shadow-xl" : "hover:shadow-md"}`}
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: plan.popular ? "#3b82f6" : "var(--border)",
                boxShadow: plan.popular ? "0 20px 40px rgba(59,130,246,0.15)" : undefined,
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                    RECOMMENDED
                  </span>
                </div>
              )}

              <div className="p-7">
                <h3 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>{plan.name}</h3>
                <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>{plan.description}</p>

                <div className="flex items-end gap-1 mb-6">
                  <span className="text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>{plan.price}</span>
                  <span className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>/{plan.period}</span>
                </div>

                <ComingSoonLink
                  feature={`${plan.name} Plan — ${plan.cta}`}
                  className={`w-full block text-center font-semibold py-2.5 rounded-lg transition-colors mb-6 text-sm ${plan.popular ? "bg-blue-600 hover:bg-blue-700 text-white" : "border hover:border-blue-400 hover:text-blue-600"}`}
                  style={plan.popular ? {} : { borderColor: "var(--border)", color: "var(--text-primary)" } as React.CSSProperties}
                >
                  {plan.cta}
                </ComingSoonLink>

                <div className="h-px mb-5" style={{ backgroundColor: "var(--border)" }} />

                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs mt-8" style={{ color: "var(--text-muted)" }}>
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
