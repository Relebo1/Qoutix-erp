"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Loader2 } from "lucide-react";
import { SupplierStatus } from "@prisma/client";

export default function SupplierActions({ supplierId, status }: { supplierId: number; status: SupplierStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const newStatus = status === SupplierStatus.ACTIVE ? SupplierStatus.ARCHIVED : SupplierStatus.ACTIVE;
    await fetch(`/api/suppliers/${supplierId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button onClick={toggle} disabled={loading}
      className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-amber-400 hover:text-amber-600 disabled:opacity-60"
      style={{ borderColor: "var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg-card)" }}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : status === SupplierStatus.ACTIVE ? <Archive size={14} /> : <ArchiveRestore size={14} />}
      {status === SupplierStatus.ACTIVE ? "Archive" : "Restore"}
    </button>
  );
}
