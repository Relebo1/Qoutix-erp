"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ChevronDown, Sun, Moon } from "lucide-react";
import { MODULES } from "@/lib/modules";
import { ModuleIcon } from "./ModuleSelector";

type DropdownKey = "modules" | null;

function ModulesMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-full left-0 mt-1 w-[520px] rounded-xl shadow-xl p-5 z-50 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Business Modules</p>
      <div className="grid grid-cols-2 gap-2">
        {MODULES.map((mod) => (
          <Link
            key={mod.slug}
            href={mod.status === "ACTIVE" && mod.dashboardHref ? mod.dashboardHref : `/modules/${mod.slug}`}
            onClick={onClose}
            className="flex items-start gap-3 px-3 py-3 rounded-lg transition-colors group hover:bg-black/5 dark:hover:bg-white/5"
          >
            <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0 mt-0.5 text-blue-600">
              <ModuleIcon name={mod.icon} size={15} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium group-hover:text-blue-600 transition-colors" style={{ color: "var(--text-primary)" }}>{mod.name}</p>
                {mod.status === "COMING_SOON" ? (
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded-full">Soon</span>
                ) : (
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-full">Live</span>
                )}
              </div>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{mod.description}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
        <Link
          href="/modules"
          onClick={onClose}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          View all modules →
        </Link>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey>(null);
  const [dark, setDark] = useState(true);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (key: DropdownKey) => setActiveDropdown((prev) => (prev === key ? null : key));

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-200 ${scrolled ? "shadow-sm" : ""} border-b`}
      style={{ backgroundColor: "var(--nav-bg)", borderColor: "var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8" ref={navRef}>
        {/* Logo */}
        <a href="#" className="flex-shrink-0">
          <Image src="/logo.png" alt="Quotix" width={110} height={32} className="object-contain" />
        </a>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          <div className="relative">
            <button
              onClick={() => toggle("modules")}
              className={`inline-flex items-center gap-1 text-sm font-medium px-3.5 py-2 rounded-md transition-colors ${activeDropdown === "modules" ? "text-blue-600 bg-blue-50 dark:bg-blue-950" : "hover:bg-black/5 dark:hover:bg-white/5"}`}
              style={activeDropdown === "modules" ? {} : { color: "var(--text-secondary)" }}
            >
              Modules <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === "modules" ? "rotate-180 text-blue-500" : ""}`} style={activeDropdown === "modules" ? {} : { color: "var(--text-muted)" }} />
            </button>
            {activeDropdown === "modules" && <ModulesMenu onClose={() => setActiveDropdown(null)} />}
          </div>

          <a href="#pricing" className="text-sm font-medium px-3.5 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "var(--text-secondary)" }}>
            Pricing
          </a>
          <a href="#resources" className="text-sm font-medium px-3.5 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "var(--text-secondary)" }}>
            Resources
          </a>
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setDark(!dark)}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
            style={{ color: "var(--text-secondary)" }}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "var(--text-secondary)" }}>
            Login
          </Link>
          <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm">
            Start Free
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setDark(!dark)}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
            style={{ color: "var(--text-secondary)" }}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{ color: "var(--text-secondary)" }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-6 py-4 flex flex-col gap-1 shadow-lg max-h-[80vh] overflow-y-auto" style={{ backgroundColor: "var(--nav-bg)", borderColor: "var(--border)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest px-2 pt-1 pb-1" style={{ color: "var(--text-muted)" }}>Modules</p>
          {MODULES.map((mod) => (
            <Link
              key={mod.slug}
              href={mod.status === "ACTIVE" && mod.dashboardHref ? mod.dashboardHref : `/modules/${mod.slug}`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="text-lg flex-shrink-0 text-blue-600">
                <ModuleIcon name={mod.icon} size={16} />
              </span>
              <span className="text-sm font-medium flex-1" style={{ color: "var(--text-primary)" }}>{mod.name}</span>
              {mod.status === "COMING_SOON" && (
                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded-full">Soon</span>
              )}
            </Link>
          ))}

          <Link
            href="/modules"
            onClick={() => setMenuOpen(false)}
            className="text-xs font-medium text-blue-600 px-2 py-1"
          >
            View all modules →
          </Link>

          <div className="h-px my-2" style={{ backgroundColor: "var(--border)" }} />
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="text-sm font-medium px-4 py-3 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "var(--text-primary)" }}>Pricing</a>
          <a href="#resources" onClick={() => setMenuOpen(false)} className="text-sm font-medium px-4 py-3 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "var(--text-primary)" }}>Resources</a>

          <div className="flex flex-col gap-2 pt-3 mt-1 border-t" style={{ borderColor: "var(--border)" }}>
            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-center py-2.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 block" style={{ color: "var(--text-secondary)" }}>Login</Link>
            <Link href="/register" onClick={() => setMenuOpen(false)} className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg text-center block">Start Free</Link>
          </div>
        </div>
      )}
    </header>
  );
}
