import ModuleComingSoonShell from "@/components/ModuleComingSoonShell";
import { getModule } from "@/lib/modules";

export default function EmployeesDashboard() {
  return <ModuleComingSoonShell mod={getModule("employees")!} />;
}
