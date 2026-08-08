"use client";
import { Clock } from "lucide-react";

interface Event { label: string; date: string; color: string; }

export default function ActivityFeed({ events }: { events: Event[] }) {
  if (events.length === 0) return null;
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-4">
        <Clock size={14} className="text-blue-600" />
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Activity</p>
      </div>
      <div className="relative pl-4">
        <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ backgroundColor: "var(--border)" }} />
        <div className="space-y-4">
          {events.map((e, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 ring-2 ring-offset-2 ${e.color}`} />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{e.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{new Date(e.date).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
