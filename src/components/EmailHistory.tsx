"use client";
import { useEffect, useState } from "react";
import { Mail, CheckCircle, XCircle } from "lucide-react";

interface EmailLog {
  id: number;
  sender: string;
  recipient: string;
  cc: string | null;
  subject: string;
  status: "SENT" | "FAILED";
  sentAt: string;
}

interface Props {
  docType: string;
  docId: number;
}

export default function EmailHistory({ docType, docId }: Props) {
  const [logs, setLogs] = useState<EmailLog[]>([]);

  useEffect(() => {
    fetch(`/api/email/logs?docType=${docType}&docId=${docId}`)
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []))
      .catch(() => {});
  }, [docType, docId]);

  if (logs.length === 0) return null;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
        <Mail size={14} className="text-blue-600" />
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Email History</p>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {logs.map((log) => (
          <div key={log.id} className="px-5 py-3 space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                Sent to {log.recipient}
              </p>
              {log.status === "SENT" ? (
                <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
              ) : (
                <XCircle size={13} className="text-red-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{log.subject}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {new Date(log.sentAt).toLocaleString()}
              {log.status === "FAILED" && (
                <span className="ml-2 text-red-500 font-medium">Failed</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
