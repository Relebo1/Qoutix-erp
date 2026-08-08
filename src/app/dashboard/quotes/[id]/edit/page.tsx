import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditQuoteForm from "./EditQuoteForm";

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) notFound();

  const payload = await verifyToken(token);

  const [quote, clients, company] = await Promise.all([
    prisma.quotation.findFirst({
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

  if (!quote) notFound();

  return (
    <EditQuoteForm
      quote={{
        id: quote.id,
        clientId: quote.clientId,
        currency: quote.currency,
        issueDate: quote.issueDate.toISOString().slice(0, 10),
        expiryDate: quote.expiryDate.toISOString().slice(0, 10),
        discount: Number(quote.subtotal) > 0 ? (Number(quote.discount) / Number(quote.subtotal)) * 100 : 0,
        notes: quote.notes ?? "",
        accentColor: quote.accentColor ?? "#111827",
        bgColor: quote.bgColor ?? "#ffffff",
        fontColor: quote.fontColor ?? "#111827",
        fontFamily: quote.fontFamily ?? "'Segoe UI', Arial, sans-serif",
        items: quote.items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          taxRate: Number(i.taxRate),
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
