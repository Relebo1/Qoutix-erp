"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg)" }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="Quotix" width={120} height={36} className="object-contain" />
          </Link>
        </div>

        <div className="rounded-2xl border p-8 shadow-sm" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
          {sent ? (
            <div className="text-center space-y-3">
              <CheckCircle size={40} className="text-emerald-500 mx-auto" />
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Check your inbox</h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link. Check your spam folder if you don&apos;t see it.
              </p>
              <Link href="/login" className="inline-block mt-2 text-sm text-blue-600 hover:underline font-medium">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Forgot password?</h1>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Enter your email and we&apos;ll send you a reset link.</p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>

        {!sent && (
          <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
            Remember your password?{" "}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
