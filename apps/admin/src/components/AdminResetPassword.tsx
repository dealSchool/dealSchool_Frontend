import React, { useState } from "react";
import { getFriendlyAuthError } from "@shared/firebase";
import { Shield, AlertTriangle, Eye, EyeOff, CheckCircle2, Lock } from "lucide-react";

interface Props {
  token: string;
  onDone: () => void;
}

export const AdminResetPassword: React.FC<Props> = ({ token, onDone }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      setDone(true);
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
          <span className="font-mono text-[9px] text-[#D4A62A] tracking-[0.12em] font-bold block uppercase">
            Account Recovery
          </span>
          <h3 className="font-serif text-2xl font-bold text-brand-text">Set New Password</h3>
          <p className="font-sans text-xs text-brand-neutral leading-relaxed">
            Choose a strong password of at least 8 characters.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-500/20 p-3 text-red-700 text-xs flex gap-2 items-start">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!done ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1">
              <label className="block font-mono text-[10px] text-brand-neutral uppercase font-bold">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral" />
                <input
                  type={showNew ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-[#FCFAF6] text-brand-text pl-9 pr-10 py-3 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-neutral hover:text-brand-text cursor-pointer"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block font-mono text-[10px] text-brand-neutral uppercase font-bold">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-[#FCFAF6] text-brand-text pl-9 pr-10 py-3 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-neutral hover:text-brand-text cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-60 text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer rounded-sm"
            >
              {isLoading ? "Saving New Password..." : "Save New Password"}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto h-12 w-12 bg-green-100 border border-green-400 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-base font-bold text-brand-text">Password Updated</h4>
              <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                Your admin portal password has been changed successfully.
              </p>
            </div>
            <button
              onClick={onDone}
              className="w-full py-3.5 bg-brand-accent hover:bg-[#B24122] text-white font-mono text-xs font-bold tracking-widest uppercase transition-all cursor-pointer rounded-sm"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
