"use client";
import { useState } from "react";
import { DollarSign, CreditCard } from "lucide-react";
import RecordPaymentModal from "@/components/RecordPaymentModal";

interface Payment {
  id: number;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  reference: string | null;
}

interface Props {
  invoiceId: number;
  invoiceNumber: string;
  currency: string;
  remaining: number;
  canPay: boolean;
  payments: Payment[];
}

const METHOD_LABEL: Record<string, string> = {
  CASH: "Cash", BANK: "Bank Transfer", CARD: "Card",
  MOBILE_MONEY: "Mobile Money", ONLINE: "Online",
};

export default function PaymentPanel({ invoiceId, invoiceNumber, currency, remaining, canPay, payments }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-blue-600" />
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Payment History</p>
          </div>
          {canPay && remaining > 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <DollarSign size={12} /> Record Payment
            </button>
          )}
        </div>

        {payments.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>No payments recorded yet</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {payments.map((p) => (
              <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {currency} {p.amount.toLocaleString("en-LS", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}
                    {p.reference ? ` · ${p.reference}` : ""}
                  </p>
                </div>
                <p className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                  {new Date(p.paymentDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <RecordPaymentModal
          invoiceId={invoiceId}
          invoiceNumber={invoiceNumber}
          currency={currency}
          remaining={remaining}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
