import ModuleComingSoonShell from "@/components/ModuleComingSoonShell";
import { getModule } from "@/lib/modules";

export default function POSDashboard() {
  return <ModuleComingSoonShell mod={getModule("pos")!} />;
}
