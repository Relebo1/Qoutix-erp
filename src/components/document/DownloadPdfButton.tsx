"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function DownloadPdfButton({ docNumber }: { docNumber: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    setLoading(true);

    const el = document.getElementById("document-preview");
    if (!el) { setLoading(false); return; }

    // Clone and resolve all computed styles so the print window is self-contained
    const clone = el.cloneNode(true) as HTMLElement;

    // Walk every element and bake in its computed style as inline style
    const sourceEls = el.querySelectorAll("*");
    const cloneEls = clone.querySelectorAll("*");
    sourceEls.forEach((src, i) => {
      const computed = window.getComputedStyle(src);
      const target = cloneEls[i] as HTMLElement;
      // Only copy the properties we care about for a clean PDF
      const props = [
        "display","flexDirection","justifyContent","alignItems","gap","gridTemplateColumns",
        "padding","paddingTop","paddingBottom","paddingLeft","paddingRight",
        "margin","marginTop","marginBottom","marginLeft","marginRight",
        "background","backgroundColor","color","borderColor","border","borderBottom",
        "borderTop","borderLeft","borderRight","borderRadius","borderCollapse",
        "fontSize","fontWeight","fontFamily","lineHeight","letterSpacing","textTransform","textAlign",
        "width","maxWidth","minWidth","height","minHeight","maxHeight",
        "overflow","boxShadow","opacity","objectFit","verticalAlign","whiteSpace",
      ];
      props.forEach((prop) => {
        try {
          const val = computed.getPropertyValue(prop);
          if (val) (target.style as unknown as Record<string, string>)[prop] = val;
        } catch { /* skip */ }
      });
    });

    const html = clone.innerHTML;

    const printWindow = window.open("", "_blank", "width=960,height=800");
    if (!printWindow) { setLoading(false); return; }

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${docNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #fff;
      color: #1a1a2e;
      padding: 0;
    }
    table { border-collapse: collapse; width: 100%; }
    img { max-width: 100%; display: block; }
    @media print {
      html, body { width: 210mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 10mm; size: A4 portrait; }
    }
  </style>
</head>
<body>
  <div style="max-width:860px;margin:0 auto;">${html}</div>
</body>
</html>`);

    printWindow.document.close();

    // Give images time to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => { printWindow.close(); setLoading(false); }, 500);
    }, 600);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-60"
      style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      Download PDF
    </button>
  );
}
