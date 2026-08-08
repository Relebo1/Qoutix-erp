"use client";
import { useRef } from "react";
import { Upload } from "lucide-react";

const ACCENT_PRESETS   = ["#111827","#2563eb","#7c3aed","#0891b2","#059669","#dc2626","#d97706","#db2777"];
const BG_PRESETS       = ["#ffffff","#111827","#1e3a5f","#1a1a2e","#0f4c3a","#3b0764","#7f1d1d","#78350f"];
const FONT_COLOR_PRESETS = ["#111827","#1e3a5f","#3b0764","#0f4c3a","#7f1d1d","#78350f","#374151","#6b7280"];

export const FONT_OPTIONS = [
  { label: "Segoe UI",    value: "'Segoe UI', Arial, sans-serif" },
  { label: "Inter",       value: "'Inter', sans-serif" },
  { label: "Georgia",     value: "Georgia, 'Times New Roman', serif" },
  { label: "Playfair",    value: "'Playfair Display', Georgia, serif" },
  { label: "Courier",     value: "'Courier New', Courier, monospace" },
  { label: "Trebuchet",   value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: "Garamond",    value: "Garamond, 'Times New Roman', serif" },
  { label: "Verdana",     value: "Verdana, Geneva, sans-serif" },
];

interface Props {
  logo: string | null;
  accentColor: string;
  bgColor: string;
  fontColor: string;
  fontFamily: string;
  onLogoChange: (logo: string | null) => void;
  onAccentChange: (color: string) => void;
  onBgChange: (color: string) => void;
  onFontColorChange: (color: string) => void;
  onFontFamilyChange: (font: string) => void;
}

export default function TemplateSection({
  logo, accentColor, bgColor, fontColor, fontFamily,
  onLogoChange, onAccentChange, onBgChange, onFontColorChange, onFontFamilyChange,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onLogoChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <section className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Template</p>

      {/* Logo */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Logo</p>
        <div
          onClick={() => fileRef.current?.click()}
          className="relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 p-4"
          style={{ borderColor: "var(--border)" }}
        >
          {logo ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt="logo" className="h-14 max-w-[160px] object-contain" />
              <p className="text-xs text-blue-600 font-medium">Click to change</p>
              <button onClick={(e) => { e.stopPropagation(); onLogoChange(null); }} className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-700 font-medium">
                Remove
              </button>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                <Upload size={18} className="text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Upload your logo</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>PNG, JPG, SVG — shown on the document</p>
              </div>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      </div>

      {/* Font family */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Font</p>
        <select
          value={fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)", backgroundColor: "var(--bg-card)", fontFamily }}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font colour */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Font colour</p>
        <div className="flex items-center gap-2 flex-wrap">
          {FONT_COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onFontColorChange(c)}
              className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{ backgroundColor: c, borderColor: fontColor === c ? "#3b82f6" : "var(--border)", outline: fontColor === c ? "2px solid #3b82f6" : "none" }}
            />
          ))}
          <input
            type="color"
            value={fontColor}
            onChange={(e) => onFontColorChange(e.target.value)}
            className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent"
            title="Custom font colour"
          />
        </div>
      </div>

      {/* Accent colour */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Accent colour</p>
        <div className="flex items-center gap-2 flex-wrap">
          {ACCENT_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onAccentChange(c)}
              className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{ backgroundColor: c, borderColor: accentColor === c ? "#fff" : "transparent", outline: accentColor === c ? `2px solid ${c}` : "none" }}
            />
          ))}
          <input
            type="color"
            value={accentColor}
            onChange={(e) => onAccentChange(e.target.value)}
            className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent"
            title="Custom accent colour"
          />
        </div>
      </div>

      {/* Header background */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Header background</p>
        <div className="flex items-center gap-2 flex-wrap">
          {BG_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onBgChange(c)}
              className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{ backgroundColor: c, borderColor: bgColor === c ? "#3b82f6" : "var(--border)", outline: bgColor === c ? "2px solid #3b82f6" : "none" }}
            />
          ))}
          <input
            type="color"
            value={bgColor}
            onChange={(e) => onBgChange(e.target.value)}
            className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent"
            title="Custom background colour"
          />
        </div>
      </div>
    </section>
  );
}
