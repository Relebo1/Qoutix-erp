"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle, Ban, Loader2, Pencil, AlertTriangle } from "lucide-react";
import { InvoiceStatus } from "@prisma/client";
import Link from "next/link";

interface Props {
  invoiceId: number;
  status: InvoiceStatus;
  plannedSendDate: string | null;
  remaining: number;
  currency: string;
  invoiceNumber: string;
}

export default function InvoiceStatusActions({ invoiceId, status, plannedSendDate }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showLateWarning, setShowLateWarning] = useState(false);

  const update = async (newStatus: InvoiceStatus) => {
    setLoading(newStatus);
    await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(null);
    router.refresh();
  };

  const handleSend = () => {
    if (plannedSendDate) {
      const psd = new Date(plannedSendDate);
      psd.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (today > psd) {
        setShowLateWarning(true);
        return;
      }
    }
    update(InvoiceStatus.SENT);
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {status === InvoiceStatus.DRAFT && (
          <Link
            href={`/dashboard/invoices/${invoiceId}/edit`}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-blue-400 hover:text-blue-600"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
          >
            <Pencil size={14} /> Edit
          </Link>
        )}

        {status === InvoiceStatus.DRAFT && (
          <button onClick={handleSend} disabled={!!loading}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            {loading === InvoiceStatus.SENT ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Mark as Sent
          </button>
        )}

        {(status === InvoiceStatus.SENT || status === InvoiceStatus.VIEWED || status === InvoiceStatus.PARTIAL || status === InvoiceStatus.OVERDUE) && (
          <button onClick={() => update(InvoiceStatus.PAID)} disabled={!!loading}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            {loading === InvoiceStatus.PAID ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Mark as Paid
          </button>
        )}

        {status !== InvoiceStatus.CANCELLED && status !== InvoiceStatus.PAID && (
          <button onClick={() => update(InvoiceStatus.CANCELLED)} disabled={!!loading}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-red-400 hover:text-red-500"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg-card)" }}>
            {loading === InvoiceStatus.CANCELLED ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
            Cancel
          </button>
        )}
      </div>

      {/* Late-send warning dialog */}
      {showLateWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl p-6 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Past Planned Send Date</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Today is past the planned send date ({new Date(plannedSendDate!).toLocaleDateString()}). Sending now will be recorded in the audit log.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowLateWarning(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
                Cancel
              </button>
              <Link href={`/dashboard/invoices/${invoiceId}/edit`} onClick={() => setShowLateWarning(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border hover:border-blue-400 hover:text-blue-600 transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
                Update Date
              </Link>
              <button onClick={() => { setShowLateWarning(false); update(InvoiceStatus.SENT); }}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                Send Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
