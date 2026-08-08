import ModuleComingSoonShell from "@/components/ModuleComingSoonShell";
import { getModule } from "@/lib/modules";

export default function PayrollDashboard() {
  return <ModuleComingSoonShell mod={getModule("payroll")!} />;
}
