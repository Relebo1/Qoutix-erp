"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Send, PackageCheck, Ban, Loader2, Package } from "lucide-react";
import { PurchaseOrderStatus } from "@prisma/client";

export default function POActions({ poId, status }: { poId: number; status: PurchaseOrderStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const patch = async (newStatus: PurchaseOrderStatus, key: string) => {
    setLoading(key);
    await fetch(`/api/purchase-orders/${poId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(null);
    router.refresh();
  };

  const btn = (label: string, icon: React.ReactNode, onClick: () => void, key: string, variant: "primary" | "secondary" | "danger" = "secondary") => (
    <button
      key={key}
      onClick={onClick}
      disabled={!!loading}
      className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60 ${
        variant === "primary" ? "bg-blue-600 hover:bg-blue-700 text-white" :
        variant === "danger"  ? "border hover:border-red-400 hover:text-red-500" :
        "border hover:border-blue-400 hover:text-blue-600"
      }`}
      style={variant !== "primary" ? { borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" } : {}}
    >
      {loading === key ? <Loader2 size={14} className="animate-spin" /> : icon}
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {status === PurchaseOrderStatus.DRAFT && btn("Approve", <CheckCircle size={14} />, () => patch(PurchaseOrderStatus.APPROVED, "approve"), "approve", "primary")}
      {status === PurchaseOrderStatus.APPROVED && btn("Send to Supplier", <Send size={14} />, () => patch(PurchaseOrderStatus.SENT, "send"), "send", "primary")}
      {status === PurchaseOrderStatus.SENT && btn("Mark Partially Received", <Package size={14} />, () => patch(PurchaseOrderStatus.PARTIALLY_RECEIVED, "partial"), "partial")}
      {(status === PurchaseOrderStatus.SENT || status === PurchaseOrderStatus.PARTIALLY_RECEIVED) && btn("Mark Completed", <PackageCheck size={14} />, () => patch(PurchaseOrderStatus.COMPLETED, "complete"), "complete", "primary")}
      {status !== PurchaseOrderStatus.CANCELLED && status !== PurchaseOrderStatus.COMPLETED && btn("Cancel", <Ban size={14} />, () => patch(PurchaseOrderStatus.CANCELLED, "cancel"), "cancel", "danger")}
    </div>
  );
}
