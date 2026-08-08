"use client";
import { useState } from "react";
import ComingSoon from "./ComingSoon";

interface ComingSoonLinkProps {
  children: React.ReactNode;
  feature?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ComingSoonLink({ children, feature, className, style }: ComingSoonLinkProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} style={style}>
        {children}
      </button>
      <ComingSoon isOpen={open} onClose={() => setOpen(false)} feature={feature} />
    </>
  );
}
