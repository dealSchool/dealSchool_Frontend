import React, { useState } from "react";
import {
  isGoogleOnlyUser,
  adminReauthAndChangePassword,
  adminReauthGoogleAndChangePassword,
  getFriendlyAuthError,
} from "../firebase";
import { AlertTriangle, Eye, EyeOff, CheckCircle2, Lock, X, ShieldCheck, LogIn } from "lucide-react";

interface Props {
  onClose: () => void;
}

type Step = "reauth" | "enterNew" | "done";

export const AdminChangePassword: React.FC<Props> = ({ onClose }) => {
  const googleOnly = isGoogleOnlyUser();

  const [step, setStep] = useState<Step>("reauth");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReauth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!googleOnly && !currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    setStep("enterNew");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      if (googleOnly) {
        await adminReauthGoogleAndChangePassword(newPassword);
      } else {
        await adminReauthAndChangePassword(currentPassword, newPassword);
      }
      setStep("done");
    } catch (err: any) {
      setError(getFriendlyAuthError(err));
      if (err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential") {
        setStep("reauth");
        setCurrentPassword("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-brand-bg border border-brand-secondary/15 rounded-sm shadow-2xl space-y-6 p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-neutral hover:text-brand-text cursor-pointer transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 bg-brand-accent/10 border border-[#D4A62A]/25 rounded-md flex items-center justify-center text-brand-accent">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="font-mono text-[9px] text-[#D4A62A] tracking-[0.25em] font-bold block uppercase">
            Account Security
          </span>
          <h3 className="font-serif text-xl font-bold text-brand-text">Change Password</h3>
        </div>

        {/* Progress */}
        {step !== "done" && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-brand-accent" />
            <div className={`flex-1 h-1 rounded-full ${step === "enterNew" ? "bg-brand-accent" : "bg-brand-secondary/15"}`} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-500/20 p-3 text-red-700 text-xs flex gap-2 items-start">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto h-12 w-12 bg-green-100 border border-green-400 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-base font-bold text-brand-text">Password Set</h4>
              <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                You can now log in with{" "}
                <span className="font-bold text-brand-secondary">admin@dealschool.in</span> and
                your new password.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-brand-accent hover:bg-[#B24122] text-white font-mono text-xs font-bold tracking-widest uppercase transition-all cursor-pointer rounded-sm"
            >
              Close
            </button>
          </div>
        )}

        {/* Step 1: Re-auth */}
        {step === "reauth" && (
          <form onSubmit={handleReauth} className="space-y-4">
            {googleOnly ? (
              <div className="bg-[#FCFAF6] border border-brand-accent/20 p-4 rounded-sm space-y-2">
                <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                  You're signed in with <span className="font-bold text-brand-secondary">Google</span>.
                  In the next step you'll set a new password — Google will verify your identity first.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-brand-neutral uppercase font-bold">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Your current password"
                    className="w-full bg-[#FCFAF6] text-brand-text pl-9 pr-10 py-3 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent text-sm"
                  />
                  <button type="button" onClick={() => setShowCurrent(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-neutral hover:text-brand-text cursor-pointer">
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-brand-secondary hover:bg-brand-dark-blue text-[#FAFAF8] font-mono text-xs font-bold uppercase transition-all cursor-pointer rounded-sm flex items-center justify-center gap-2"
            >
              {googleOnly ? <><LogIn className="h-4 w-4" /> Continue with Google</> : "Continue →"}
            </button>
          </form>
        )}

        {/* Step 2: New password */}
        {step === "enterNew" && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            {googleOnly && (
              <div className="bg-[#FCFAF6] border border-brand-accent/20 p-3 rounded-sm text-center">
                <p className="font-sans text-xs text-brand-neutral">
                  A Google popup will open to verify your identity when you click save.
                </p>
              </div>
            )}
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
                  placeholder="Min. 6 characters"
                  className="w-full bg-[#FCFAF6] text-brand-text pl-9 pr-10 py-3 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent text-sm"
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-neutral hover:text-brand-text cursor-pointer">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
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
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-neutral hover:text-brand-text cursor-pointer">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setStep("reauth"); setError(null); }}
                className="flex-1 py-3 border border-brand-secondary/25 text-brand-secondary font-mono text-xs font-bold uppercase hover:bg-brand-secondary/5 transition-all cursor-pointer rounded-sm">
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-60 text-[#FAFAF8] font-mono text-xs font-bold uppercase transition-all cursor-pointer rounded-sm"
              >
                {isLoading ? "Saving..." : "Set Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
