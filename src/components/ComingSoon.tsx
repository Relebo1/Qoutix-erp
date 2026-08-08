"use client";
import { X, Bell, Rocket, ArrowRight } from "lucide-react";
import { useState } from "react";

interface ComingSoonProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export default function ComingSoon({ isOpen, onClose, feature }: ComingSoonProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative rounded-2xl shadow-2xl w-full max-w-md p-8 border"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={16} />
        </button>

        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Rocket size={26} className="text-blue-600" strokeWidth={1.75} />
        </div>

        <div className="text-center mb-6">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Coming Soon</p>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            {feature ? feature : "This feature is on its way"}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            We&apos;re working hard to bring this to you. Leave your email and we&apos;ll notify you the moment it&apos;s ready.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400 border"
              style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0">
              Notify Me <ArrowRight size={13} />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 rounded-xl px-4 py-3">
            <Bell size={16} className="text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              You&apos;re on the list! We&apos;ll let you know when it&apos;s ready.
            </p>
          </div>
        )}

        <div className="mt-5 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5 text-center" style={{ color: "var(--text-muted)" }}>Quotix Roadmap</p>
          <div className="flex items-center justify-between gap-1">
            {["Lead", "Quote", "Invoice", "Payment", "Reports"].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-1">
                {i === 1 ? (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-blue-600 text-white">{step}</span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-md" style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-secondary)" }}>{step}</span>
                )}
                {i < arr.length - 1 && <span className="text-xs" style={{ color: "var(--text-muted)" }}>→</span>}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-center mt-2" style={{ color: "var(--text-muted)" }}>Quotations live now · More coming soon</p>
        </div>
      </div>
    </div>
  );
}
