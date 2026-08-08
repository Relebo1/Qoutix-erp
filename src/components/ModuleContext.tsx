"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MODULES, AppModule, getModuleByDashboardPath } from "@/lib/modules";

interface ModuleContextValue {
  activeModule: AppModule;
  setActiveModule: (mod: AppModule) => void;
}

const ModuleContext = createContext<ModuleContextValue>({
  activeModule: MODULES[0],
  setActiveModule: () => {},
});

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [activeModule, setActiveModuleState] = useState<AppModule>(() =>
    getModuleByDashboardPath(pathname)
  );

  // Keep in sync when the URL changes (e.g. browser back/forward)
  useEffect(() => {
    setActiveModuleState(getModuleByDashboardPath(pathname));
  }, [pathname]);

  const setActiveModule = useCallback((mod: AppModule) => {
    setActiveModuleState(mod);
    document.cookie = `activeModule=${mod.slug};path=/;max-age=31536000`;
    router.push(mod.dashboardHref);
  }, [router]);

  return (
    <ModuleContext.Provider value={{ activeModule, setActiveModule }}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModule() {
  return useContext(ModuleContext);
}

export { MODULES };
