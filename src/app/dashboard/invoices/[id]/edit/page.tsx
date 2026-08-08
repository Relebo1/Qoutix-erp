import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditInvoiceForm from "./EditInvoiceForm";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) notFound();

  const payload = await verifyToken(token);

  const [invoice, clients, company] = await Promise.all([
    prisma.invoice.findFirst({
      where: { id: Number(id), companyId: payload.companyId },
      include: { items: true },
    }),
    prisma.client.findMany({
      where: { companyId: payload.companyId },
      select: { id: true, companyName: true, contactName: true, email: true, address: true },
    }),
    prisma.company.findUnique({
      where: { id: payload.companyId },
      select: { name: true, logo: true, email: true, phone: true, address: true, currency: true },
    }),
  ]);

  if (!invoice) notFound();

  return (
    <EditInvoiceForm
      invoice={{
        id: invoice.id,
        clientId: invoice.clientId,
        currency: invoice.currency,
        issueDate: invoice.issueDate.toISOString().slice(0, 10),
        dueDate: invoice.dueDate.toISOString().slice(0, 10),
        plannedSendDate: invoice.plannedSendDate ? invoice.plannedSendDate.toISOString().slice(0, 10) : null,
        discount: Number(invoice.subtotal) > 0 ? (Number(invoice.discount) / Number(invoice.subtotal)) * 100 : 0,
        notes: invoice.notes ?? "",
        accentColor: invoice.accentColor ?? "#111827",
        bgColor: invoice.bgColor ?? "#ffffff",
        fontColor: invoice.fontColor ?? "#111827",
        fontFamily: invoice.fontFamily ?? "'Segoe UI', Arial, sans-serif",
        items: invoice.items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.price),
          taxRate: Number(i.price) > 0 && Number(i.quantity) > 0 && Number(i.tax) > 0
            ? (Number(i.tax) / (Number(i.quantity) * Number(i.price))) * 100
            : 0,
        })),
      }}
      clients={clients.map((c) => ({ ...c, email: c.email ?? null, address: c.address ?? null }))}
      company={{
        name: company?.name ?? "",
        logo: company?.logo ?? null,
        email: company?.email ?? "",
        phone: company?.phone ?? "",
        address: company?.address ?? "",
        currency: company?.currency ?? "LSL",
      }}
    />
  );
}
