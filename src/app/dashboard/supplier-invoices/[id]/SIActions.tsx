"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Banknote, Ban, Loader2 } from "lucide-react";
import { SupplierInvoiceStatus } from "@prisma/client";

export default function SIActions({ invoiceId, status }: { invoiceId: number; status: SupplierInvoiceStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const patch = async (newStatus: SupplierInvoiceStatus, key: string) => {
    setLoading(key);
    await fetch(`/api/supplier-invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(null);
    router.refresh();
  };

  const btn = (label: string, icon: React.ReactNode, onClick: () => void, key: string, variant: "primary" | "secondary" | "danger" = "secondary") => (
    <button key={key} onClick={onClick} disabled={!!loading}
      className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60 ${
        variant === "primary" ? "bg-blue-600 hover:bg-blue-700 text-white" :
        variant === "danger"  ? "border hover:border-red-400 hover:text-red-500" :
        "border hover:border-blue-400 hover:text-blue-600"
      }`}
      style={variant !== "primary" ? { borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" } : {}}>
      {loading === key ? <Loader2 size={14} className="animate-spin" /> : icon}
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {status === SupplierInvoiceStatus.PENDING && btn("Approve", <CheckCircle size={14} />, () => patch(SupplierInvoiceStatus.APPROVED, "approve"), "approve", "primary")}
      {status === SupplierInvoiceStatus.APPROVED && btn("Mark Paid", <Banknote size={14} />, () => patch(SupplierInvoiceStatus.PAID, "paid"), "paid", "primary")}
      {status !== SupplierInvoiceStatus.PAID && status !== SupplierInvoiceStatus.CANCELLED && btn("Cancel", <Ban size={14} />, () => patch(SupplierInvoiceStatus.CANCELLED, "cancel"), "cancel", "danger")}
    </div>
  );
}
