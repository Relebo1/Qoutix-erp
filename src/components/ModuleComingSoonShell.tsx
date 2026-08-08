"use client";
import { useState } from "react";
import { Check, Bell, ArrowRight, Rocket } from "lucide-react";
import { ModuleIcon } from "./ModuleSelector";
import type { AppModule } from "@/lib/modules";

export default function ModuleComingSoonShell({ mod }: { mod: AppModule }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border p-8 shadow-sm" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 flex items-center justify-center mx-auto mb-4 text-blue-600">
              <ModuleIcon name={mod.icon} size={26} />
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Coming Soon
            </span>
            <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              {mod.name}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {mod.description}
            </p>
          </div>

          <div className="h-px mb-5" style={{ backgroundColor: "var(--border)" }} />

          {/* Features */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Planned Features
            </p>
            <ul className="space-y-2">
              {mod.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center flex-shrink-0">
                    <Check size={9} className="text-emerald-600" strokeWidth={2.5} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="h-px mb-5" style={{ backgroundColor: "var(--border)" }} />

          {/* Notify */}
          <div className="flex items-center gap-2 mb-3">
            <Rocket size={14} className="text-blue-600" />
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Get notified when it launches
            </p>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            This module is currently under development and will be available in a future release.
          </p>

          {!submitted ? (
            <form
              onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }}
              className="flex gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 border placeholder:text-gray-400"
                style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                Notify Me <ArrowRight size={13} />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 rounded-xl px-4 py-3">
              <Bell size={16} className="text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                You&apos;re on the list! We&apos;ll notify you when {mod.name} launches.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
