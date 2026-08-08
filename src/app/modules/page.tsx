import Link from "next/link";
import { Check } from "lucide-react";
import { MODULES } from "@/lib/modules";
import { ModuleIcon } from "@/components/ModuleSelector";
import Navbar from "@/components/Navbar";

export const metadata = { title: "Modules — Quotix" };

export default function ModulesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4" style={{ backgroundColor: "var(--bg)" }}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Platform</p>
            <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Business Modules
            </h1>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
              Quotix is growing into a complete ERP platform. Start with Sales today and unlock more modules as they launch.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map((mod) => {
              const isActive = mod.status === "ACTIVE";
              const href = isActive && mod.dashboardHref ? mod.dashboardHref : `/modules/${mod.slug}`;

              return (
                <Link
                  key={mod.slug}
                  href={href}
                  className="group rounded-2xl border p-6 flex flex-col gap-4 transition-shadow hover:shadow-md"
                  style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? "bg-blue-50 dark:bg-blue-950 text-blue-600" : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"}`}>
                      <ModuleIcon name={mod.icon} size={20} />
                    </div>
                    {isActive ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Available
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Name + description */}
                  <div>
                    <h2
                      className="text-base font-semibold mb-1 group-hover:text-blue-600 transition-colors"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {mod.name}
                    </h2>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {mod.description}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-1.5 mt-auto">
                    {mod.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <Check size={11} className={isActive ? "text-emerald-500" : "text-amber-400"} strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                    {mod.features.length > 4 && (
                      <li className="text-xs" style={{ color: "var(--text-muted)" }}>
                        +{mod.features.length - 4} more
                      </li>
                    )}
                  </ul>

                  {/* CTA */}
                  <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                    {isActive ? (
                      <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                        Open Module →
                      </span>
                    ) : (
                      <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        Notify me when available →
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
