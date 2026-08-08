import ModuleComingSoonShell from "@/components/ModuleComingSoonShell";
import { getModule } from "@/lib/modules";

export default function InventoryDashboard() {
  return <ModuleComingSoonShell mod={getModule("inventory")!} />;
}
