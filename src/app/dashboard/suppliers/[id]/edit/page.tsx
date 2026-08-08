import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SupplierForm from "../../SupplierForm";

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) notFound();

  const payload = await verifyToken(token);
  const supplier = await prisma.supplier.findFirst({
    where: { id: Number(id), companyId: payload.companyId },
  });
  if (!supplier) notFound();

  return (
    <SupplierForm
      supplierId={supplier.id}
      initial={{
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        email: supplier.email ?? "",
        phone: supplier.phone ?? "",
        address: supplier.address ?? "",
        category: supplier.category ?? "",
        productsServices: supplier.productsServices ?? "",
        paymentTerms: supplier.paymentTerms ?? "",
        vatNumber: supplier.vatNumber ?? "",
        taxNumber: supplier.taxNumber ?? "",
        isPreferred: supplier.isPreferred,
        notes: supplier.notes ?? "",
      }}
    />
  );
}
