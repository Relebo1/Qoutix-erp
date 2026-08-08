import { redirect, notFound } from "next/navigation";
import { getModule } from "@/lib/modules";
import ModuleComingSoonPage from "./ModuleComingSoonPage";

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = getModule(slug);

  if (!mod) notFound();
  if (mod.status === "ACTIVE" && mod.dashboardHref) redirect(mod.dashboardHref);

  return <ModuleComingSoonPage module={mod} />;
}
