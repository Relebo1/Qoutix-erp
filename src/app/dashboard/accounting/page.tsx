import ModuleComingSoonShell from "@/components/ModuleComingSoonShell";
import { getModule } from "@/lib/modules";

export default function AccountingDashboard() {
  return <ModuleComingSoonShell mod={getModule("accounting")!} />;
}
