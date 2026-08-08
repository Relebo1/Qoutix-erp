"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, XCircle, Loader2 } from "lucide-react";
import { ContractStatus } from "@prisma/client";

export default function ContractActions({ contractId, status }: { contractId: number; status: ContractStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const patch = async (newStatus: ContractStatus, key: string) => {
    setLoading(key);
    await fetch(`/api/contracts/${contractId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(null);
    router.refresh();
  };

  if (status === ContractStatus.CANCELLED || status === ContractStatus.EXPIRED) return null;

  return (
    <div className="flex items-center gap-2">
      {(status === ContractStatus.ACTIVE || status === ContractStatus.EXPIRING_SOON) && (
        <button onClick={() => patch(ContractStatus.EXPIRED, "expire")} disabled={!!loading}
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-amber-400 hover:text-amber-600 disabled:opacity-60"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
          {loading === "expire" ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
          Mark Expired
        </button>
      )}
      <button onClick={() => patch(ContractStatus.CANCELLED, "cancel")} disabled={!!loading}
        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-red-400 hover:text-red-500 disabled:opacity-60"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg-card)" }}>
        {loading === "cancel" ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
        Cancel
      </button>
    </div>
  );
}
