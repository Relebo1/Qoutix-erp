"use client";

export interface ContractDocumentProps {
  // Branding
  accentColor: string;
  bgColor?: string;
  fontColor?: string;
  fontFamily?: string;
  logo: string | null;
  // Contract info
  contractNumber: string;
  status: string;
  title?: string;
  description?: string;
  // Parties — company (client)
  companyName: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyRegNumber?: string;
  // Parties — supplier
  supplierName: string;
  supplierAddress?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  supplierContact?: string;
  supplierRegNumber?: string;
  // Service
  serviceType: string;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  // Financial
  currency: string;
  value?: number;
  billingFrequency?: string;
  paymentTerms?: string;
  paymentDueDays?: number;
  // Legal
  governingLaw?: string;
  noticePeriod?: number;
  notes?: string;
}

function isDark(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function fmt(n: number, currency: string) {
  return `${currency} ${n.toLocaleString("en-LS", { minimumFractionDigits: 2 })}`;
}

function Section({ number, title, accent, font, children }: { number: string; title: string; accent: string; font: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, borderBottom: `2px solid ${accent}`, paddingBottom: 6 }}>
        <span style={{ background: accent, color: "#fff", fontWeight: 800, fontSize: 11, borderRadius: 4, padding: "2px 8px", fontFamily: font }}>{number}</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: accent, textTransform: "uppercase" as const, letterSpacing: 1, fontFamily: font }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, font, muted }: { label: string; value: string; font: string; muted: string }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: muted, minWidth: 140, fontFamily: font }}>{label}:</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#111827", fontFamily: font }}>{value || "—"}</span>
    </div>
  );
}

export default function ContractDocument(p: ContractDocumentProps) {
  const accent = p.accentColor?.startsWith("#") ? p.accentColor : "#111827";
  const bg = p.bgColor?.startsWith("#") ? p.bgColor : "#ffffff";
  const font = p.fontFamily || "'Segoe UI', Arial, sans-serif";
  const bodyColor = p.fontColor?.startsWith("#") ? p.fontColor : "#111827";
  const muted = "#6b7280";
  const hasBg = bg !== "#ffffff" && bg !== "#fff";
  const onBg = hasBg ? (isDark(bg) ? "#ffffff" : "#111827") : bodyColor;
  const onBgMuted = hasBg ? (isDark(bg) ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.55)") : muted;

  const title = p.title || "SERVICE AGREEMENT CONTRACT";

  return (
    <div style={{ fontFamily: font, fontSize: 12, color: bodyColor, background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "32px 48px 24px", background: bg, borderBottom: hasBg ? "none" : `4px solid ${accent}` }}>
        <div>
          {p.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.logo} alt="logo" style={{ height: 44, maxWidth: 150, objectFit: "contain", marginBottom: 12 }} />
          ) : (
            <div style={{ width: 100, height: 40, borderRadius: 6, background: hasBg ? "rgba(255,255,255,0.2)" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <span style={{ color: hasBg ? "rgba(255,255,255,0.6)" : "#9ca3af", fontSize: 10, fontWeight: 700, fontFamily: font }}>YOUR LOGO</span>
            </div>
          )}
          <div style={{ fontWeight: 800, fontSize: 15, color: onBg, fontFamily: font }}>{p.companyName || "Your Company"}</div>
          {p.companyAddress && <div style={{ fontSize: 10, color: onBgMuted, marginTop: 2, fontFamily: font }}>{p.companyAddress}</div>}
          {p.companyEmail && <div style={{ fontSize: 10, color: onBgMuted, fontFamily: font }}>{p.companyEmail}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 3, color: hasBg ? onBg : accent, textTransform: "uppercase" as const, fontFamily: font }}>CONTRACT</div>
          <div style={{ fontWeight: 600, fontSize: 12, color: onBgMuted, marginTop: 4, fontFamily: font }}>{p.contractNumber || "CON-0001"}</div>
          <div style={{ display: "inline-block", marginTop: 8, padding: "3px 12px", borderRadius: 20, background: hasBg ? "rgba(255,255,255,0.2)" : `${accent}22`, fontWeight: 700, fontSize: 10, color: hasBg ? onBg : accent, fontFamily: font }}>
            {p.status}
          </div>
        </div>
      </div>

      {/* Contract title */}
      <div style={{ background: `${accent}11`, borderBottom: `1px solid ${accent}33`, padding: "14px 48px", textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: accent, letterSpacing: 2, textTransform: "uppercase" as const, fontFamily: font }}>{title}</div>
      </div>

      {/* Contract info bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
        {[
          { label: "Contract No.", value: p.contractNumber || "—" },
          { label: "Effective Date", value: p.startDate || "—" },
          { label: "Expiry Date", value: p.endDate || "—" },
          { label: "Renewal Date", value: p.renewalDate || "—" },
        ].map((item, i) => (
          <div key={i} style={{ padding: "12px 16px", borderRight: i < 3 ? "1px solid #e5e7eb" : "none" }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, color: "#9ca3af", marginBottom: 4, fontFamily: font }}>{item.label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: bodyColor, fontFamily: font }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div style={{ padding: "28px 48px" }}>

        {/* 1. Parties */}
        <Section number="1" title="Parties" accent={accent} font={font}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "14px 16px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: accent, marginBottom: 8, fontFamily: font }}>Service Provider (Supplier)</div>
              <Field label="Company Name" value={p.supplierName} font={font} muted={muted} />
              <Field label="Reg. Number" value={p.supplierRegNumber || ""} font={font} muted={muted} />
              <Field label="Contact Person" value={p.supplierContact || ""} font={font} muted={muted} />
              <Field label="Address" value={p.supplierAddress || ""} font={font} muted={muted} />
              <Field label="Email" value={p.supplierEmail || ""} font={font} muted={muted} />
              <Field label="Phone" value={p.supplierPhone || ""} font={font} muted={muted} />
            </div>
            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "14px 16px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: accent, marginBottom: 8, fontFamily: font }}>Client (Company)</div>
              <Field label="Company Name" value={p.companyName} font={font} muted={muted} />
              <Field label="Reg. Number" value={p.companyRegNumber || ""} font={font} muted={muted} />
              <Field label="Address" value={p.companyAddress || ""} font={font} muted={muted} />
              <Field label="Email" value={p.companyEmail || ""} font={font} muted={muted} />
              <Field label="Phone" value={p.companyPhone || ""} font={font} muted={muted} />
            </div>
          </div>
        </Section>

        {/* 2. Purpose */}
        <Section number="2" title="Purpose of Agreement" accent={accent} font={font}>
          <p style={{ fontSize: 11, color: muted, lineHeight: 1.8, fontFamily: font }}>
            {p.description || "This Service Agreement defines the terms and conditions under which the Service Provider will provide services to the Client. The purpose of this agreement is to establish the scope of services, service expectations, payment terms, responsibilities of both parties, contract duration, and performance requirements."}
          </p>
        </Section>

        {/* 3. Services */}
        <Section number="3" title="Description of Services" accent={accent} font={font}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>
                {["Service", "Description", "Billing Frequency"].map((h, i) => (
                  <th key={h} style={{ padding: "8px 12px", background: accent, color: "#fff", fontWeight: 700, fontSize: 10, textAlign: "left", fontFamily: font, width: i === 0 ? "25%" : i === 1 ? "50%" : "25%" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb", fontFamily: font, background: "#f9fafb" }}>{p.serviceType || "—"}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb", fontFamily: font, background: "#f9fafb", color: muted }}>{p.description || "As agreed between parties"}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb", fontFamily: font, background: "#f9fafb", color: muted }}>{p.billingFrequency || "—"}</td>
              </tr>
            </tbody>
          </table>
        </Section>

        {/* 4. Service Period */}
        <Section number="4" title="Service Period" accent={accent} font={font}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 16px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: muted, marginBottom: 4, fontFamily: font }}>Start Date</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: bodyColor, fontFamily: font }}>{p.startDate || "—"}</div>
            </div>
            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 16px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: muted, marginBottom: 4, fontFamily: font }}>End Date</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: bodyColor, fontFamily: font }}>{p.endDate || "—"}</div>
            </div>
          </div>
          {p.renewalDate && (
            <p style={{ fontSize: 11, color: muted, marginTop: 8, fontFamily: font }}>
              This agreement may be renewed on <strong>{p.renewalDate}</strong>, subject to agreement between both parties.
            </p>
          )}
        </Section>

        {/* 5. Service Delivery */}
        <Section number="5" title="Service Delivery Requirements" accent={accent} font={font}>
          {["Deliver services professionally and within agreed timelines.", "Maintain required quality standards.", "Provide qualified personnel where applicable.", "Notify the Client of delays or issues.", "Protect confidential information."].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
              <span style={{ color: accent, fontWeight: 700, fontSize: 11, fontFamily: font }}>•</span>
              <span style={{ fontSize: 11, color: muted, fontFamily: font }}>{item}</span>
            </div>
          ))}
        </Section>

        {/* 6. Pricing */}
        <Section number="6" title="Pricing and Payment Terms" accent={accent} font={font}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 16px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: muted, marginBottom: 4, fontFamily: font }}>Contract Value</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: accent, fontFamily: font }}>{p.value ? fmt(p.value, p.currency) : "—"}</div>
            </div>
            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 16px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: muted, marginBottom: 4, fontFamily: font }}>Billing Frequency</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: bodyColor, fontFamily: font }}>{p.billingFrequency || "—"}</div>
            </div>
            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 16px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: muted, marginBottom: 4, fontFamily: font }}>Payment Due</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: bodyColor, fontFamily: font }}>{p.paymentDueDays ? `${p.paymentDueDays} days after invoice` : "—"}</div>
            </div>
          </div>
          {p.paymentTerms && (
            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 16px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, color: muted, marginBottom: 4, fontFamily: font }}>Payment Terms</div>
              <p style={{ fontSize: 11, color: muted, lineHeight: 1.7, fontFamily: font, whiteSpace: "pre-line" }}>{p.paymentTerms}</p>
            </div>
          )}
        </Section>

        {/* 7. Invoicing */}
        <Section number="7" title="Invoicing Requirements" accent={accent} font={font}>
          <p style={{ fontSize: 11, color: muted, lineHeight: 1.8, fontFamily: font }}>
            The Service Provider shall submit invoices containing the contract number, service period, description of services provided, amount payable, and supporting documents where required.
          </p>
        </Section>

        {/* 8. Confidentiality */}
        <Section number="8" title="Confidentiality" accent={accent} font={font}>
          <p style={{ fontSize: 11, color: muted, lineHeight: 1.8, fontFamily: font }}>
            Both parties agree to protect confidential business information obtained during the agreement, including business information, customer information, financial information, and technical information.
          </p>
        </Section>

        {/* 9. Termination */}
        <Section number="9" title="Termination" accent={accent} font={font}>
          <p style={{ fontSize: 11, color: muted, lineHeight: 1.8, fontFamily: font }}>
            Either party may terminate this agreement by providing <strong style={{ color: bodyColor }}>{p.noticePeriod ? `${p.noticePeriod} days` : "___"}</strong> written notice. Termination reasons may include breach of contract, failure to deliver services, non-payment, or business requirements.
          </p>
        </Section>

        {/* 10. Governing Law */}
        <Section number="10" title="Governing Law" accent={accent} font={font}>
          <p style={{ fontSize: 11, color: muted, lineHeight: 1.8, fontFamily: font }}>
            This agreement shall be governed by the laws of <strong style={{ color: bodyColor }}>{p.governingLaw || "_______________"}</strong>.
          </p>
        </Section>

        {/* Notes */}
        {p.notes && (
          <Section number="11" title="Additional Notes" accent={accent} font={font}>
            <p style={{ fontSize: 11, color: muted, lineHeight: 1.8, fontFamily: font, whiteSpace: "pre-line" }}>{p.notes}</p>
          </Section>
        )}

        {/* Signatures */}
        <div style={{ marginTop: 32, borderTop: `2px solid ${accent}33`, paddingTop: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, color: accent, marginBottom: 16, fontFamily: font }}>Signatures</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {[{ role: "Client", name: p.companyName }, { role: "Service Provider", name: p.supplierName }].map(({ role, name }) => (
              <div key={role}>
                <div style={{ fontSize: 10, fontWeight: 700, color: accent, marginBottom: 12, fontFamily: font }}>{role}</div>
                {["Name", "Position", "Signature", "Date"].map((field) => (
                  <div key={field} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: muted, marginBottom: 2, fontFamily: font }}>{field}{field === "Name" ? `: ${name}` : ":"}</div>
                    <div style={{ borderBottom: "1px solid #d1d5db", height: 20 }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", background: bg, borderTop: hasBg ? "none" : "1px solid #e5e7eb" }}>
        <span style={{ fontSize: 10, color: hasBg ? onBg : accent, fontWeight: 700, fontFamily: font }}>Confidential — Service Agreement</span>
        <span style={{ fontSize: 10, color: onBgMuted, fontFamily: font }}>{p.contractNumber} · {p.startDate}</span>
      </div>
    </div>
  );
}
