import { UserPlus, FileText, Send, Receipt, CheckCircle } from "lucide-react";
import ComingSoonLink from "./ComingSoonLink";

const steps = [
  { icon: UserPlus, title: "Client Added", description: "Add your client's details — name, email, and contact info. Takes seconds.", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950", border: "border-blue-100 dark:border-blue-900" },
  { icon: FileText, title: "Create Quote", description: "Pick a client, add services from your catalog, and generate a professional quotation.", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950", border: "border-violet-100 dark:border-violet-900" },
  { icon: Send, title: "Send PDF", description: "Download or send a branded PDF quotation directly to your client.", color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950", border: "border-sky-100 dark:border-sky-900" },
  { icon: Receipt, title: "Convert to Invoice", description: "When the client accepts, convert the quote to an invoice in one click.", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950", border: "border-amber-100 dark:border-amber-900" },
  { icon: CheckCircle, title: "Receive Payment", description: "Mark the invoice as paid and keep your cash flow healthy.", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950", border: "border-emerald-100 dark:border-emerald-900" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20" style={{ backgroundColor: "var(--bg-subtle)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            From quote to payment in minutes
          </h2>
          <p className="max-w-lg mx-auto text-base" style={{ color: "var(--text-secondary)" }}>
            No complex setup. No training required. Just sign up and start creating.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Desktop */}
          <div className="hidden lg:flex items-start gap-0">
            {steps.map((step, i) => (
              <div key={step.title} className="flex-1 flex flex-col items-center text-center relative">
                {i < steps.length - 1 && (
                  <div className="absolute top-5 left-1/2 w-full h-px z-0" style={{ backgroundColor: "var(--border)" }} />
                )}
                <div className={`relative z-10 w-10 h-10 rounded-full ${step.bg} border-2 ${step.border} flex items-center justify-center mb-4 shadow-sm`} style={{ backgroundColor: "var(--bg-card)" }}>
                  <step.icon size={18} className={step.color} strokeWidth={1.75} />
                </div>
                <p className="text-xs font-bold mb-1 px-2" style={{ color: "var(--text-primary)" }}>{step.title}</p>
                <p className="text-xs leading-relaxed px-2" style={{ color: "var(--text-muted)" }}>{step.description}</p>
              </div>
            ))}
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex flex-col gap-0">
            {steps.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full ${step.bg} border ${step.border} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <step.icon size={16} className={step.color} strokeWidth={1.75} />
                  </div>
                  {i < steps.length - 1 && <div className="w-px flex-1 my-1" style={{ backgroundColor: "var(--border)" }} />}
                </div>
                <div className="pb-6">
                  <p className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>{step.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <ComingSoonLink
            feature="Start for Free — Create your account"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm shadow-sm"
          >
            Get Started Free
          </ComingSoonLink>
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>No credit card required</p>
        </div>
      </div>
    </section>
  );
}
