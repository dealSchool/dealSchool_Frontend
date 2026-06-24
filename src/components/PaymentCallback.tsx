import React from "react";
import { CheckCircle2, XCircle, AlertCircle, Mail } from "lucide-react";

interface PaymentCallbackProps {
  params: URLSearchParams;
  onClose: () => void;
}

export const PaymentCallback: React.FC<PaymentCallbackProps> = ({ params, onClose }) => {
  const status = params.get("razorpay_payment_link_status");
  const paymentId = params.get("razorpay_payment_id");
  const referenceId = params.get("razorpay_payment_link_reference_id");

  const isPaid = status === "paid";

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(10, 14, 22, 0.85)", backdropFilter: "blur(6px)" }}
    >
      <div className="bg-[#FCFAF6] border border-brand-secondary/20 rounded-sm shadow-2xl w-full max-w-md p-8 space-y-6 animate-fade-in">

        {/* Header */}
        <div className="border-b border-brand-secondary/10 pb-4">
          <h2 className="font-serif text-2xl font-bold text-brand-text">
            {isPaid ? "Payment Confirmed" : "Payment Incomplete"}
          </h2>
          <p className="font-mono text-[9px] text-brand-accent tracking-widest uppercase mt-1">
            DealSchool Enrollment
          </p>
        </div>

        {/* Status Icon */}
        <div className="flex flex-col items-center gap-4 py-4">
          {isPaid ? (
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          ) : status === "cancelled" ? (
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          )}

          {isPaid ? (
            <div className="text-center space-y-1">
              <p className="font-serif text-base font-bold text-green-700">
                Your seat is reserved!
              </p>
              <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                Payment received. You will get a confirmation email with onboarding details shortly.
              </p>
            </div>
          ) : status === "cancelled" ? (
            <div className="text-center space-y-1">
              <p className="font-serif text-base font-bold text-red-700">
                Payment was cancelled.
              </p>
              <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                Your payment was not completed. Contact us if you need a new payment link.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <p className="font-serif text-base font-bold text-brand-text">
                Payment status unclear.
              </p>
              <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                Please check your email for confirmation or contact us for assistance.
              </p>
            </div>
          )}
        </div>

        {/* Payment Details */}
        {isPaid && (
          <div className="bg-[#FAF8F5] border border-brand-secondary/10 rounded-sm p-4 space-y-2 font-sans text-xs">
            {paymentId && (
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] text-brand-neutral uppercase tracking-wider">Payment ID:</span>
                <span className="font-mono text-[10px] text-brand-secondary font-bold">{paymentId}</span>
              </div>
            )}
            {referenceId && (
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] text-brand-neutral uppercase tracking-wider">Reference ID:</span>
                <span className="font-mono text-[10px] text-brand-secondary">{referenceId}</span>
              </div>
            )}
          </div>
        )}

        {/* Contact note */}
        <div className="flex items-start gap-2 bg-brand-secondary/5 border border-brand-secondary/10 rounded-sm p-3">
          <Mail className="h-4 w-4 text-brand-accent mt-0.5 shrink-0" />
          <p className="font-sans text-xs text-brand-neutral leading-relaxed">
            Questions? Email <a href="mailto:hello@dealschool.in" className="text-brand-accent font-bold underline">hello@dealschool.in</a>
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-brand-secondary text-brand-bg font-mono text-xs font-bold uppercase tracking-wider hover:bg-brand-dark-blue transition-all rounded-sm cursor-pointer"
        >
          Back to DealSchool
        </button>
      </div>
    </div>
  );
};
