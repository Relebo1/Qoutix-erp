"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_COLOR: Record<string, string> = {
  SEND_REMINDER: "bg-blue-500",
  PAYMENT_REMINDER: "bg-amber-500",
  QUOTE_EXPIRY: "bg-violet-500",
  INFO: "bg-gray-400",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = await res.json();
    setNotifications(data.notifications ?? []);
    setUnread(data.unreadCount ?? 0);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [] }) });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  const markRead = async (id: number) => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [id] }) });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnread((c) => Math.max(0, c - 1));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/5 relative"
        style={{ color: "var(--text-secondary)" }}
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-80 rounded-xl border shadow-xl z-50 overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Notifications</p>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ color: "var(--text-muted)" }}><X size={14} /></button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: "var(--border)" }}>
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>No notifications</p>
            ) : notifications.map((n) => {
              const dot = TYPE_COLOR[n.type] ?? TYPE_COLOR.INFO;
              const content = (
                <div
                  className={`px-4 py-3 flex gap-3 cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors ${!n.read ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}
                  onClick={() => markRead(n.id)}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${dot}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{n.title}</p>
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--text-muted)" }}>{n.message}</p>
                    <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
              return n.link ? (
                <Link key={n.id} href={n.link} onClick={() => { markRead(n.id); setOpen(false); }}>
                  {content}
                </Link>
              ) : <div key={n.id}>{content}</div>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
