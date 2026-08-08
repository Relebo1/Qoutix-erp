import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditClientForm from "./EditClientForm";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) notFound();

  const payload = await verifyToken(token);
  const client = await prisma.client.findFirst({
    where: { id: Number(id), companyId: payload.companyId },
  });

  if (!client) notFound();

  return (
    <EditClientForm
      client={{
        id: client.id,
        companyName: client.companyName,
        contactName: client.contactName,
        email: client.email ?? "",
        phone: client.phone ?? "",
        address: client.address ?? "",
        industry: client.industry ?? "",
        notes: client.notes ?? "",
      }}
    />
  );
}
