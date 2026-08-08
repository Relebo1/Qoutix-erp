import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { ContractStatus } from "@prisma/client";
import ContractActions from "./ContractActions";
import ContractDocument from "@/components/document/ContractDocument";
import DownloadPdfButton from "@/components/document/DownloadPdfButton";

const BADGE: Record<ContractStatus, string> = {
  ACTIVE:        "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400",
  EXPIRING_SOON: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  EXPIRED:       "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
  CANCELLED:     "bg-gray-100 dark:bg-gray-800 text-gray-400",
};

function fmt(v: number | string | null, currency: string) {
  if (v == null) return "—";
  return `${currency} ${Number(v).toLocaleString("en-LS", { minimumFractionDigits: 2 })}`;
}

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) notFound();

  const payload = await verifyToken(token);
  const [contract, company] = await Promise.all([
    prisma.contract.findFirst({
      where: { id: Number(id), companyId: payload.companyId },
      include: { supplier: true },
    }),
    prisma.company.findUnique({
      where: { id: payload.companyId },
      select: { name: true, address: true, email: true, phone: true, logo: true, brandColor: true, brandBgColor: true, brandFontColor: true, brandFontFamily: true, registrationNumber: true },
    }),
  ]);

  if (!contract || !company) notFound();

  const daysToExpiry = Math.floor((new Date(contract.endDate).getTime() - Date.now()) / 86400000);

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/contracts" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
            <ChevronLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{contract.contractNumber}</h1>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${BADGE[contract.status]}`}>
                {contract.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {contract.supplier.name} · {contract.serviceType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DownloadPdfButton docNumber={contract.contractNumber} />
          <ContractActions contractId={contract.id} status={contract.status} />
        </div>
      </div>

      {contract.status === ContractStatus.EXPIRING_SOON && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            This contract expires in <span className="font-semibold">{daysToExpiry} day{daysToExpiry !== 1 ? "s" : ""}</span>.
            {contract.renewalDate ? ` Renewal due ${new Date(contract.renewalDate).toLocaleDateString()}.` : ""}
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Document */}
        <div id="document-preview" className="lg:col-span-2">
          <ContractDocument
            accentColor={contract.accentColor ?? company.brandColor ?? "#111827"}
            bgColor={contract.bgColor ?? company.brandBgColor ?? "#ffffff"}
            fontColor={contract.fontColor ?? company.brandFontColor ?? "#111827"}
            fontFamily={contract.fontFamily ?? company.brandFontFamily ?? "'Segoe UI', Arial, sans-serif"}
            logo={company.logo ?? null}
            contractNumber={contract.contractNumber}
            status={contract.status.replace("_", " ")}
            title={contract.title ?? undefined}
            description={contract.description ?? undefined}
            companyName={company.name}
            companyAddress={company.address ?? ""}
            companyEmail={company.email ?? ""}
            companyPhone={company.phone ?? ""}
            companyRegNumber={contract.companyRegNumber ?? company.registrationNumber ?? ""}
            supplierName={contract.supplier.name}
            supplierAddress={contract.supplier.address ?? ""}
            supplierEmail={contract.supplier.email ?? ""}
            supplierPhone={contract.supplier.phone ?? ""}
            supplierContact={contract.supplier.contactPerson}
            supplierRegNumber={contract.supplierRegNumber ?? ""}
            serviceType={contract.serviceType}
            startDate={new Date(contract.startDate).toLocaleDateString()}
            endDate={new Date(contract.endDate).toLocaleDateString()}
            renewalDate={contract.renewalDate ? new Date(contract.renewalDate).toLocaleDateString() : undefined}
            currency={contract.currency}
            value={contract.value ? Number(contract.value) : undefined}
            billingFrequency={contract.billingFrequency ?? undefined}
            paymentTerms={contract.paymentTerms ?? undefined}
            paymentDueDays={contract.paymentDueDays ?? undefined}
            governingLaw={contract.governingLaw ?? undefined}
            noticePeriod={contract.noticePeriod ?? undefined}
            notes={contract.notes ?? undefined}
          />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Supplier</p>
            <div className="space-y-1 text-sm">
              <Link href={`/dashboard/suppliers/${contract.supplier.id}`} className="font-medium hover:text-blue-600 hover:underline transition-colors" style={{ color: "var(--text-primary)" }}>
                {contract.supplier.name}
              </Link>
              <p style={{ color: "var(--text-muted)" }}>{contract.supplier.contactPerson}</p>
              {contract.supplier.email && <p style={{ color: "var(--text-muted)" }}>{contract.supplier.email}</p>}
              {contract.supplier.phone && <p style={{ color: "var(--text-muted)" }}>{contract.supplier.phone}</p>}
            </div>
          </div>

          <div className="rounded-xl border p-5 space-y-2" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Contract Details</p>
            {[
              { label: "Service Type", value: contract.serviceType },
              { label: "Start Date", value: new Date(contract.startDate).toLocaleDateString() },
              { label: "End Date", value: new Date(contract.endDate).toLocaleDateString() },
              { label: "Renewal Date", value: contract.renewalDate ? new Date(contract.renewalDate).toLocaleDateString() : "—" },
              { label: "Contract Value", value: fmt(contract.value ? Number(contract.value) : null, contract.currency) },
              { label: "Billing", value: contract.billingFrequency ?? "—" },
              { label: "Payment Due", value: contract.paymentDueDays ? `${contract.paymentDueDays} days` : "—" },
              { label: "Notice Period", value: contract.noticePeriod ? `${contract.noticePeriod} days` : "—" },
              { label: "Governing Law", value: contract.governingLaw ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                <span className="font-medium text-right" style={{ color: "var(--text-primary)" }}>{value}</span>
              </div>
            ))}
          </div>

          {contract.notes && (
            <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Notes</p>
              <p className="text-sm whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>{contract.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
