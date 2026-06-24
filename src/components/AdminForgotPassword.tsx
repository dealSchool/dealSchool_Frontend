import React, { useState } from "react";
import { callAdminForgotPassword, getFriendlyAuthError } from "../firebase";
import { Shield, AlertTriangle, ArrowLeft, CheckCircle2, Mail } from "lucide-react";

interface Props {
  onBack: () => void;
}

export const AdminForgotPassword: React.FC<Props> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await callAdminForgotPassword("admin@dealschool.in");
      setSent(true);
    } catch (err: any) {
      setError(getFriendlyAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 max-w-7xl mx-auto px-4 md:px-8">
      <div className="max-w-md mx-auto bg-brand-bg border border-brand-secondary/15 rounded-sm p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 bg-brand-accent/10 border border-[#D4A62A]/25 rounded-md flex items-center justify-center text-brand-accent">
            <Shield className="h-6 w-6" />
          </div>
          <span className="font-mono text-[9px] text-[#D4A62A] tracking-[0.25em] font-bold block uppercase">
            Account Recovery
          </span>
          <h3 className="font-serif text-2xl font-bold text-brand-text">Reset Password</h3>
          <p className="font-sans text-xs text-brand-neutral leading-relaxed">
            A secure reset link will be sent to the admin email address. The link expires in 15 minutes.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-500/20 p-3 text-red-700 text-xs flex gap-2 items-start">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block font-mono text-[10px] text-brand-neutral uppercase font-bold">
                Admin Email (fixed)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral" />
                <input
                  type="email"
                  readOnly
                  value="admin@dealschool.in"
                  className="w-full bg-[#F5F3EE] text-brand-neutral pl-9 pr-3 py-3 border border-brand-secondary/10 rounded-sm text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-60 text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer rounded-sm"
            >
              {isLoading ? (
                <span>Sending Reset Link...</span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto h-12 w-12 bg-green-100 border border-green-400 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-base font-bold text-brand-text">Reset Link Sent</h4>
              <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                Check <span className="font-bold text-brand-secondary">admin@dealschool.in</span> for the
                password reset link. It expires in 15 minutes.
              </p>
            </div>
          </div>
        )}

        {/* Back link */}
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-1.5 font-mono text-[10px] text-brand-neutral hover:text-brand-text uppercase tracking-wider cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
        </button>
      </div>
    </section>
  );
};
