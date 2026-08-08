"use client";
import { useState, useRef, useEffect } from "react";
import { X, Loader2, Paperclip, Link2, Plus, Trash2, Mail, AlertTriangle } from "lucide-react";

interface EmailLink { label: string; url: string; }

interface Props {
  defaultTo?: string;
  defaultSubject?: string;
  defaultBody?: string;
  context?: string;
  initialFiles?: File[];
  /** Document metadata for email logging */
  docType?: string;
  docId?: number;
  docNumber?: string;
  onClose: () => void;
  onSent?: () => void;
}

export default function SendEmailModal({
  defaultTo = "",
  defaultSubject = "",
  defaultBody = "",
  context,
  initialFiles = [],
  docType,
  docId,
  docNumber,
  onClose,
  onSent,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [to, setTo]           = useState(defaultTo);
  const [cc, setCc]           = useState("");
  const [showCc, setShowCc]   = useState(false);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody]       = useState(defaultBody);
  const [links, setLinks]     = useState<EmailLink[]>([]);
  const [files, setFiles]     = useState<File[]>(initialFiles);
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);
  const [senderEmail, setSenderEmail] = useState("");

  // Fetch the logged-in user's email for the "Sending as" display (US-03)
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.email) setSenderEmail(d.email); })
      .catch(() => {});
  }, []);

  const addLink    = () => setLinks((p) => [...p, { label: "", url: "" }]);
  const updateLink = (i: number, f: keyof EmailLink, v: string) =>
    setLinks((p) => p.map((l, idx) => (idx === i ? { ...l, [f]: v } : l)));
  const removeLink = (i: number) => setLinks((p) => p.filter((_, idx) => idx !== i));

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...incoming.filter((f) => !existing.has(f.name))];
    });
    e.target.value = "";
  };
  const removeFile = (name: string) => setFiles((p) => p.filter((f) => f.name !== name));

  const formatSize = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // US-15: warn if no recipient
    if (!to.trim()) { setError("Please enter a recipient email address."); return; }

    const validLinks = links.filter((l) => l.url.trim());
    const invalidLink = validLinks.find((l) => { try { new URL(l.url); return false; } catch { return true; } });
    if (invalidLink) { setError(`Invalid URL: ${invalidLink.url}`); return; }

    setSending(true);
    try {
      const fd = new FormData();
      fd.append("to", to.trim());
      if (showCc && cc.trim()) fd.append("cc", cc.trim());
      fd.append("subject", subject.trim());
      fd.append("body", body.trim());
      fd.append("links", JSON.stringify(validLinks));
      files.forEach((f) => fd.append("attachments", f));
      if (docType)   fd.append("docType", docType);
      if (docId)     fd.append("docId", String(docId));
      if (docNumber) fd.append("docNumber", docNumber);

      const res  = await fetch("/api/email/send", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to send email.");
        return;
      }

      setSent(true);
      onSent?.();
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error("Send email error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const inputStyle = { backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh]"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Mail size={15} className="text-blue-600" />
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Send Email{context ? ` — ${context}` : ""}
            </p>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
        </div>

        {sent ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mx-auto">
                <Mail size={22} className="text-emerald-600" />
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Email sent!</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-3">

              {/* US-15: missing recipient warning */}
              {!defaultTo && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    This contact does not have an email address on file. Please enter a recipient to continue.
                  </p>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">{error}</p>
              )}

              {/* To */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>To</label>
                <input
                  type="email" value={to} onChange={(e) => setTo(e.target.value)} required
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  style={inputStyle}
                />
              </div>

              {/* CC */}
              {!showCc ? (
                <button type="button" onClick={() => setShowCc(true)} className="text-xs text-blue-600 hover:underline">
                  + Add CC
                </button>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>CC</label>
                    <button type="button" onClick={() => { setShowCc(false); setCc(""); }}
                      className="text-xs" style={{ color: "var(--text-muted)" }}>Remove</button>
                  </div>
                  <input
                    type="text" value={cc} onChange={(e) => setCc(e.target.value)}
                    placeholder="cc1@example.com, cc2@example.com"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Subject</label>
                <input
                  type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required
                  placeholder="Email subject"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  style={inputStyle}
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Message</label>
                <textarea
                  value={body} onChange={(e) => setBody(e.target.value)} required rows={7}
                  placeholder="Write your message here…"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  style={inputStyle}
                />
              </div>

              {/* Links */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                    <Link2 size={12} /> Links
                  </label>
                  <button type="button" onClick={addLink}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    <Plus size={11} /> Add link
                  </button>
                </div>
                {links.length > 0 && (
                  <div className="space-y-2">
                    {links.map((link, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input type="text" value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)}
                          placeholder="Label (optional)"
                          className="w-1/3 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          style={inputStyle} />
                        <input type="url" value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)}
                          placeholder="https://…" required
                          className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          style={inputStyle} />
                        <button type="button" onClick={() => removeLink(i)} style={{ color: "var(--text-muted)" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                    <Paperclip size={12} /> Attachments
                  </label>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    <Plus size={11} /> Attach file
                  </button>
                </div>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFiles} />
                {files.length > 0 && (
                  <div className="space-y-1.5">
                    {files.map((f) => (
                      <div key={f.name} className="flex items-center justify-between px-3 py-2 rounded-lg border text-sm"
                        style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                          <span className="truncate text-xs" style={{ color: "var(--text-primary)" }}>{f.name}</span>
                          <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>{formatSize(f.size)}</span>
                        </div>
                        <button type="button" onClick={() => removeFile(f.name)} style={{ color: "var(--text-muted)" }}>
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer — US-03: show sender email */}
            <div className="flex items-center justify-between px-5 py-4 border-t flex-shrink-0"
              style={{ borderColor: "var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                This email will be sent through:{" "}
                <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
                  {senderEmail || "your account email"}
                </span>
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={sending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors">
                  {sending && <Loader2 size={13} className="animate-spin" />}
                  {sending ? "Sending…" : "Send Email"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
