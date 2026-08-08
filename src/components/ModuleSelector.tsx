"use client";
import { useState, useRef, useEffect } from "react";
import {
  ChevronDown, Check, TrendingUp, ShoppingBag, Boxes,
  BookOpen, Users, Wallet, ShoppingCart, LucideIcon,
} from "lucide-react";
import { useModule } from "./ModuleContext";
import { MODULES } from "@/lib/modules";

const MODULE_ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp, ShoppingBag, Boxes, BookOpen, Users, Wallet, ShoppingCart,
};

export function ModuleIcon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  const Icon = MODULE_ICON_MAP[name] ?? TrendingUp;
  return <Icon size={size} strokeWidth={1.75} className={className} />;
}

export default function ModuleSelector() {
  const { activeModule, setActiveModule } = useModule();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative px-3 py-3 border-b" style={{ borderColor: "var(--border)" }}>
      <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
        Workspace
      </p>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-colors hover:border-blue-400"
        style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
      >
        <span className="flex-shrink-0 text-blue-600">
          <ModuleIcon name={activeModule.icon} size={16} />
        </span>
        <span className="flex-1 text-left text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
          {activeModule.name}
        </span>
        <ChevronDown
          size={13}
          className={`flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
        />
      </button>

      {open && (
        <div
          className="absolute left-3 right-3 top-full mt-1 rounded-xl border shadow-xl z-50 py-1 overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          {MODULES.map((mod) => {
            const isActive = mod.slug === activeModule.slug;
            return (
              <button
                key={mod.slug}
                onClick={() => { setActiveModule(mod); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                <span className="flex-shrink-0" style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}>
                  <ModuleIcon name={mod.icon} size={15} />
                </span>
                <span className="flex-1 text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {mod.name}
                </span>
                {mod.status === "COMING_SOON" && (
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    Soon
                  </span>
                )}
                {isActive && <Check size={13} className="text-blue-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
