"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Loader2 } from "lucide-react";

export default function VerifyEmailSentPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to resend. Please try again.");
        return;
      }
      setResent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg)" }}>
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="Quotix" width={120} height={36} className="object-contain" />
          </Link>
        </div>

        <div className="rounded-2xl border p-8 shadow-sm space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center mx-auto">
            <Mail size={26} className="text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Check your email</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            We&apos;ve sent a verification link to your email address. Click the link to activate your account and access your dashboard.
          </p>

          <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
            Didn&apos;t receive it? Check your spam folder.
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {resent ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Verification email resent!</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline disabled:opacity-60"
            >
              {resending && <Loader2 size={13} className="animate-spin" />}
              {resending ? "Resending…" : "Resend verification email"}
            </button>
          )}
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
          Wrong account?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in with a different email</Link>
        </p>
      </div>
    </div>
  );
}
