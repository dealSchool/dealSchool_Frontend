import React, { useState } from "react";
import { signInAdminWithGoogle, signInAdminWithEmail, getFriendlyAuthError } from "../firebase";
import { Shield, AlertTriangle, LogIn, Eye, EyeOff, Mail, Lock } from "lucide-react";

interface Props {
  onForgotPassword: () => void;
}

export const AdminLoginForm: React.FC<Props> = ({ onForgotPassword }) => {
  const [email, setEmail] = useState("admin@dealschool.in");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInAdminWithEmail(email.trim(), password);
    } catch (err: any) {
      setError(getFriendlyAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInAdminWithGoogle();
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError(err?.message || "Google login failed.");
      }
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
            Admissions Underwriting Login
          </span>
          <h3 className="font-serif text-2xl font-bold text-brand-text">Supervisor Portal</h3>
          <p className="font-sans text-xs text-brand-neutral leading-relaxed">
            Unlock real-time view over candidate enrollment queues, application underwriting
            records, and institutional feedback channels.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-500/20 p-3 text-red-700 text-xs flex gap-2 items-start">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Email / Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block font-mono text-[10px] text-brand-neutral uppercase font-bold">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FCFAF6] text-brand-text pl-9 pr-3 py-3 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-mono text-[10px] text-brand-neutral uppercase font-bold">
                Password
              </label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="font-mono text-[9px] text-brand-accent hover:underline uppercase tracking-wider cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#FCFAF6] text-brand-text pl-9 pr-10 py-3 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-neutral hover:text-brand-text cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-brand-accent hover:bg-[#B24122] disabled:opacity-60 text-white font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer rounded-sm"
          >
            {isLoading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <LogIn className="h-4 w-4" /> Sign In with Password
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-brand-secondary/10" />
          <span className="font-mono text-[9px] text-brand-neutral uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-brand-secondary/10" />
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3.5 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-60 text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-secondary/25 rounded-sm"
        >
          <LogIn className="h-4 w-4 text-brand-accent" /> Log In with Enterprise Google
        </button>
      </div>
    </section>
  );
};
