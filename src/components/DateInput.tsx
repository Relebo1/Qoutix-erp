"use client";
import { useRef } from "react";
import { Calendar } from "lucide-react";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  min?: string;
  max?: string;
}

export default function DateInput({ value, onChange, label, required, className = "", min, max }: DateInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  const open = () => {
    try { ref.current?.showPicker(); } catch { ref.current?.focus(); }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div
        onClick={open}
        className="relative flex items-center rounded-lg border cursor-pointer transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
        style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
      >
        <input
          ref={ref}
          type="date"
          value={value}
          min={min}
          max={max}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm bg-transparent outline-none cursor-pointer"
          style={{ color: "var(--text-primary)", colorScheme: "light dark" }}
        />
        <Calendar size={14} className="mr-3 flex-shrink-0 pointer-events-none" style={{ color: "var(--text-muted)" }} />
      </div>
    </div>
  );
}
