"use client";

export type DocType = "QUOTATION" | "INVOICE" | "RECEIPT";

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface DocumentTemplateProps {
  type: DocType;
  docLabel?: string;
  accentColor: string;
  bgColor?: string;
  fontColor?: string;
  fontFamily?: string;
  logo: string | null;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  docNumber: string;
  issueDate: string;
  expiryOrDueDate: string;
  currency: string;
  items: LineItem[];
  discount: number;
  notes: string;
  amountPaid?: number;
  paymentMethod?: string;
  balanceDue?: number;
}

function fmt(n: number, currency: string) {
  return `${currency} ${n.toLocaleString("en-LS", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function isDark(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

export default function DocumentTemplate(p: DocumentTemplateProps) {
  const subtotal    = p.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const discountAmt = (subtotal * p.discount) / 100;
  const taxTotal    = p.items.reduce((s, i) => s + i.quantity * i.unitPrice * (1 - p.discount / 100) * (i.taxRate / 100), 0);
  const total       = subtotal - discountAmt + taxTotal;

  const accent      = p.accentColor?.startsWith("#") ? p.accentColor : "#111827";
  const bg          = p.bgColor?.startsWith("#") ? p.bgColor : "#ffffff";
  const font        = p.fontFamily || "'Segoe UI', Arial, sans-serif";
  const bodyColor   = p.fontColor?.startsWith("#") ? p.fontColor : "#111827";
  const mutedColor  = p.fontColor?.startsWith("#") ? `${p.fontColor}99` : "#6b7280";
  const labelColor  = p.fontColor?.startsWith("#") ? `${p.fontColor}66` : "#9ca3af";

  const hasBg       = bg !== "#ffffff" && bg !== "#fff";
  const onBg        = hasBg ? (isDark(bg) ? "#ffffff" : "#111827") : bodyColor;
  const onBgMuted   = hasBg ? (isDark(bg) ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.55)") : mutedColor;

  const isReceipt  = p.type === "RECEIPT";
  const label      = p.docLabel ?? (isReceipt ? "RECEIPT" : p.type === "QUOTATION" ? "QUOTATION" : "INVOICE");
  const dateLabel  = p.type === "QUOTATION" ? "Expiry Date" : isReceipt ? "Date" : "Due Date";
  const totalLabel = isReceipt ? "TOTAL PAID" : "TOTAL DUE";

  return (
    <div style={{ fontFamily: font, fontSize: 13, color: bodyColor, background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "36px 48px 28px", background: bg, borderBottom: hasBg ? "none" : `4px solid ${accent}` }}>
        <div>
          {p.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.logo} alt="logo" style={{ height: 48, maxWidth: 160, objectFit: "contain", marginBottom: 14 }} />
          ) : (
            <div style={{ width: 110, height: 44, borderRadius: 6, background: hasBg ? "rgba(255,255,255,0.2)" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <span style={{ color: hasBg ? "rgba(255,255,255,0.6)" : "#9ca3af", fontSize: 11, fontWeight: 700, fontFamily: font }}>YOUR LOGO</span>
            </div>
          )}
          <div style={{ fontWeight: 800, fontSize: 16, color: onBg, marginBottom: 3, fontFamily: font }}>{p.companyName || "Your Company"}</div>
          {p.companyAddress && <div style={{ fontSize: 11, color: onBgMuted, lineHeight: 1.7, fontFamily: font }}>{p.companyAddress}</div>}
          {p.companyEmail   && <div style={{ fontSize: 11, color: onBgMuted, lineHeight: 1.7, fontFamily: font }}>{p.companyEmail}</div>}
          {p.companyPhone   && <div style={{ fontSize: 11, color: onBgMuted, lineHeight: 1.7, fontFamily: font }}>{p.companyPhone}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: 5, color: hasBg ? onBg : accent, textTransform: "uppercase" as const, fontFamily: font }}>{label}</div>
          <div style={{ fontWeight: 600, fontSize: 13, color: onBgMuted, marginTop: 6, fontFamily: font }}>{p.docNumber || "#000001"}</div>
          {isReceipt && (
            <div style={{ display: "inline-block", border: `3px solid ${hasBg ? onBg : "#16a34a"}`, color: hasBg ? onBg : "#16a34a", fontWeight: 900, fontSize: 20, letterSpacing: 6, padding: "5px 16px", borderRadius: 6, transform: "rotate(-8deg)", opacity: 0.85, marginTop: 12, fontFamily: font }}>PAID</div>
          )}
        </div>
      </div>

      {/* ── Meta row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 24, padding: "22px 48px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, color: labelColor, marginBottom: 5, fontFamily: font }}>{isReceipt ? "Received From" : "Bill To"}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: bodyColor, fontFamily: font }}>{p.clientName || "Client Name"}</div>
          {p.clientAddress && <div style={{ fontSize: 11, color: mutedColor, marginTop: 2, lineHeight: 1.6, fontFamily: font }}>{p.clientAddress}</div>}
          {p.clientEmail   && <div style={{ fontSize: 11, color: mutedColor, marginTop: 2, lineHeight: 1.6, fontFamily: font }}>{p.clientEmail}</div>}
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, color: labelColor, marginBottom: 5, fontFamily: font }}>Issue Date</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: bodyColor, fontFamily: font }}>{p.issueDate || "—"}</div>
          {isReceipt && p.paymentMethod && (
            <>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, color: labelColor, marginBottom: 5, marginTop: 12, fontFamily: font }}>Payment Method</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: bodyColor, fontFamily: font }}>{p.paymentMethod}</div>
            </>
          )}
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, color: labelColor, marginBottom: 5, fontFamily: font }}>{dateLabel}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: bodyColor, fontFamily: font }}>{p.expiryOrDueDate || "—"}</div>
        </div>
      </div>

      {/* ── Items table ── */}
      <div style={{ padding: "28px 48px 0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {(["#", "Description", "Qty", "Unit Price", "Tax %", "Amount"] as const).map((h, hi) => (
                <th key={h} style={{ padding: "9px 12px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#fff", textAlign: hi < 2 ? "left" : "right", background: accent, fontFamily: font }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.items.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "32px 12px", textAlign: "center", color: "#d1d5db", fontSize: 12, fontFamily: font }}>Add line items to see them here</td></tr>
            ) : (
              p.items.map((item, i) => {
                const rowBg = i % 2 === 0 ? "#f9fafb" : "#fff";
                return (
                  <tr key={i}>
                    <td style={{ padding: "11px 12px", color: mutedColor, background: rowBg, borderBottom: "1px solid #e5e7eb", textAlign: "left", fontFamily: font }}>{i + 1}</td>
                    <td style={{ padding: "11px 12px", color: mutedColor, background: rowBg, borderBottom: "1px solid #e5e7eb", textAlign: "left", fontFamily: font }}>{item.description || "—"}</td>
                    <td style={{ padding: "11px 12px", color: mutedColor, background: rowBg, borderBottom: "1px solid #e5e7eb", textAlign: "right", fontFamily: font }}>{item.quantity}</td>
                    <td style={{ padding: "11px 12px", color: mutedColor, background: rowBg, borderBottom: "1px solid #e5e7eb", textAlign: "right", fontFamily: font }}>{fmt(item.unitPrice, p.currency)}</td>
                    <td style={{ padding: "11px 12px", color: mutedColor, background: rowBg, borderBottom: "1px solid #e5e7eb", textAlign: "right", fontFamily: font }}>{item.taxRate}%</td>
                    <td style={{ padding: "11px 12px", fontWeight: 700, color: bodyColor, background: rowBg, borderBottom: "1px solid #e5e7eb", textAlign: "right", fontFamily: font }}>{fmt(item.quantity * item.unitPrice, p.currency)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Totals ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "20px 48px 0" }}>
        <div style={{ width: 290 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12, color: mutedColor, borderBottom: "1px solid #f3f4f6", fontFamily: font }}><span>Subtotal</span><span>{fmt(subtotal, p.currency)}</span></div>
          {taxTotal > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12, color: mutedColor, borderBottom: "1px solid #f3f4f6", fontFamily: font }}><span>Tax</span><span>{fmt(taxTotal, p.currency)}</span></div>}
          {p.discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12, color: "#dc2626", borderBottom: "1px solid #f3f4f6", fontFamily: font }}><span>Discount ({p.discount.toFixed(1)}%)</span><span>− {fmt(discountAmt, p.currency)}</span></div>}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "13px 16px", marginTop: 10, background: accent, color: "#fff", fontWeight: 800, fontSize: 15, borderRadius: 6, fontFamily: font }}>
            <span>{totalLabel}</span><span>{fmt(isReceipt && p.amountPaid !== undefined ? p.amountPaid : total, p.currency)}</span>
          </div>
          {isReceipt && p.balanceDue !== undefined && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 16px", marginTop: 6, background: p.balanceDue === 0 ? "#f0fdf4" : "#fef3c7", borderRadius: 6, border: `1px solid ${p.balanceDue === 0 ? "#bbf7d0" : "#fde68a"}`, fontFamily: font }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: p.balanceDue === 0 ? "#16a34a" : "#d97706" }}>Balance Due</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: p.balanceDue === 0 ? "#16a34a" : "#d97706" }}>{fmt(p.balanceDue, p.currency)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Notes ── */}
      {p.notes && (
        <div style={{ padding: "20px 48px 28px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, color: labelColor, marginBottom: 6, fontFamily: font }}>Notes &amp; Terms</div>
          <div style={{ fontSize: 11, color: mutedColor, lineHeight: 1.8, background: "#f9fafb", padding: "10px 14px", borderRadius: 6, borderLeft: `3px solid ${accent}`, whiteSpace: "pre-line", fontFamily: font }}>{p.notes}</div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ padding: "13px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", background: bg, borderTop: hasBg ? "none" : "1px solid #e5e7eb" }}>
        <span style={{ fontSize: 11, color: hasBg ? onBg : accent, fontWeight: 700, fontFamily: font }}>{isReceipt ? "Thank you for your payment" : "Thank you for your business"}</span>
        <span style={{ fontSize: 10, color: onBgMuted, fontFamily: font }}>{p.docNumber} · {p.issueDate}</span>
      </div>
    </div>
  );
}
