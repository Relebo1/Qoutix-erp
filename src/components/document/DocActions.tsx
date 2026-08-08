"use client";
import { useState } from "react";
import { Download, Send, Loader2 } from "lucide-react";
import SendEmailModal from "@/components/SendEmailModal";

interface Props {
  docNumber: string;
  recipientEmail?: string;
  recipientName?: string;
  subject?: string;
  body?: string;
  /** Document metadata for email logging */
  docType?: string;
  docId?: number;
}

async function captureAsPdf(docNumber: string): Promise<File | null> {
  const el = document.getElementById("document-preview");
  if (!el) return null;

  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW  = pageW;
  const imgH  = (canvas.height * pageW) / canvas.width;

  let y = 0;
  while (y < imgH) {
    if (y > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, -y, imgW, imgH);
    y += pageH;
  }

  const blob = pdf.output("blob");
  return new File([blob], `${docNumber}.pdf`, { type: "application/pdf" });
}

export default function DocActions({
  docNumber,
  recipientEmail = "",
  recipientName = "",
  subject,
  body,
  docType,
  docId,
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const [capturing,   setCapturing]   = useState(false);
  const [pdfFile,     setPdfFile]     = useState<File | null>(null);
  const [showEmail,   setShowEmail]   = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const file = await captureAsPdf(docNumber);
      if (!file) return;
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenEmail = async () => {
    setCapturing(true);
    try {
      const file = await captureAsPdf(docNumber);
      setPdfFile(file);
    } finally {
      setCapturing(false);
      setShowEmail(true);
    }
  };

  const defaultSubject = subject ?? docNumber;
  const defaultBody    = body ?? `Dear ${recipientName || "Sir/Madam"},\n\nPlease find attached ${docNumber}.\n\nKind regards`;

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-60"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
      >
        {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        Download PDF
      </button>

      <button
        onClick={handleOpenEmail}
        disabled={capturing}
        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors"
      >
        {capturing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        {capturing ? "Preparing…" : "Save & Send"}
      </button>

      {showEmail && (
        <SendEmailModal
          defaultTo={recipientEmail}
          defaultSubject={defaultSubject}
          defaultBody={defaultBody}
          context={docNumber}
          initialFiles={pdfFile ? [pdfFile] : []}
          docType={docType}
          docId={docId}
          docNumber={docNumber}
          onClose={() => { setShowEmail(false); setPdfFile(null); }}
        />
      )}
    </>
  );
}
