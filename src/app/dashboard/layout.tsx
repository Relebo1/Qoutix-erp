"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Receipt, Users, Package,
  CreditCard, BarChart3, Settings, LogOut, Menu, X,
  Sun, Moon, ChevronDown, FileCheck, Users2, ClipboardList,
  Boxes, Warehouse, ArrowLeftRight, BookOpen, TrendingUp,
  Landmark, Building2, CalendarOff, CalendarCheck, Play,
  Minus, Plus, ShoppingCart,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import ModuleSelector from "@/components/ModuleSelector";
import { ModuleProvider, useModule } from "@/components/ModuleContext";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, FileText, Receipt, Users, Package,
  CreditCard, BarChart3, Settings, FileCheck, Users2, ClipboardList,
  Boxes, Warehouse, ArrowLeftRight, BookOpen, TrendingUp,
  Landmark, Building2, CalendarOff, CalendarCheck, Play,
  Minus, Plus, ShoppingCart,
};

function getInitial(): string {
  if (typeof document === "undefined") return "?";
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  if (!match) return "?";
  try {
    const payload = JSON.parse(atob(match[1].split(".")[1]));
    return (payload.email as string)?.[0]?.toUpperCase() ?? "?";
  } catch { return "?"; }
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { activeModule } = useModule();

  return (
    <nav className="flex-1 px-3 py-3 overflow-y-auto">
      <div className="space-y-0.5">
        {activeModule.navItems.map(({ href, label, icon }) => {
          const Icon = ICON_MAP[icon] ?? LayoutDashboard;
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-blue-600 text-white" : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              style={active ? {} : { color: "var(--text-secondary)" }}
            >
              <Icon size={17} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeModule } = useModule();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  // Current page label from active module nav
  const pageLabel =
    activeModule.navItems.find((n) => n.href === pathname)?.label ??
    activeModule.name;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
        <Link href="/dashboard">
          <Image src="/logo.png" alt="Quotix" width={100} height={28} className="object-contain" />
        </Link>
      </div>

      {/* Module selector */}
      <ModuleSelector />

      {/* Nav driven by active module */}
      <SidebarNav onNavigate={() => setSidebarOpen(false)} />

      {/* Bottom: Settings + Logout */}
      <div className="px-3 py-3 border-t flex-shrink-0 space-y-0.5" style={{ borderColor: "var(--border)" }}>
        <Link
          href="/dashboard/settings"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <Settings size={17} strokeWidth={1.75} />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <LogOut size={17} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 flex-shrink-0 border-r"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside
            className="relative w-64 flex flex-col border-r z-10"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="h-14 flex items-center justify-between px-4 md:px-6 border-b flex-shrink-0"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/5"
              onClick={() => setSidebarOpen(true)}
              style={{ color: "var(--text-secondary)" }}
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-base">{activeModule.icon}</span>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {pageLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <NotificationBell />

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {getInitial()}
                </div>
                <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-44 rounded-xl border shadow-lg py-1 z-50"
                  style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
                >
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Settings size={14} /> Settings
                  </Link>
                  <div className="h-px my-1" style={{ backgroundColor: "var(--border)" }} />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6" style={{ backgroundColor: "var(--bg)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </ModuleProvider>
  );
}
