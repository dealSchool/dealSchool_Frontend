import React, { useState } from "react";
import { signInAdminWithGoogle, signInAdminWithEmail, getFriendlyAuthError } from "../firebase";
import { AlertTriangle, LogIn, Eye, EyeOff, ArrowLeft } from "lucide-react";
import dealschoolLogo from "../assets/images/dealschool_logo_1781074477214.png";

interface Props {
  onForgotPassword: () => void;
  authError?: string | null;
  onClearAuthError?: () => void;
}

const goToSite = () => {
  window.history.pushState({}, "", "/");
  window.dispatchEvent(new PopStateEvent("popstate"));
};

export const AdminLoginForm: React.FC<Props> = ({ onForgotPassword, authError, onClearAuthError }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    onClearAuthError?.();
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
    onClearAuthError?.();
    try {
      await signInAdminWithGoogle();
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError(err?.message || "Google sign-in failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ══════════════════════════════════════════
          LEFT — Brand panel
      ══════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 relative overflow-hidden select-none"
        style={{ background: "linear-gradient(150deg, #0D3B8E 0%, #061a42 100%)" }}
      >

        {/* Layer 1: dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        {/* Layer 2: diagonal stripe accent — top-right corner */}
        <div
          className="absolute top-0 right-0 w-48 h-48 opacity-[0.04]"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #D4A62A 0px, #D4A62A 1px, transparent 0px, transparent 50%)",
            backgroundSize: "12px 12px",
          }}
        />

        {/* Layer 3: ambient glows */}
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-brand-accent/[0.12] blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#04102b] blur-[80px] pointer-events-none" />

        {/* Thin accent lines */}
        <div className="absolute top-0 right-0 h-56 w-px bg-gradient-to-b from-brand-accent/0 via-brand-accent/20 to-brand-accent/0" />
        <div className="absolute bottom-0 left-0 w-56 h-px bg-gradient-to-r from-brand-accent/0 via-brand-accent/15 to-brand-accent/0" />

        {/* ── TOP: Wordmark ── */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/95 rounded-xl p-1.5 shadow-lg ring-1 ring-white/20 shrink-0">
            <img src={dealschoolLogo} alt="DealSchool" className="w-9 h-9 object-contain" />
          </div>
          <div>
            <span className="font-sans text-lg font-black text-[#FAFAF8] tracking-widest uppercase block leading-tight">
              DEAL<span className="text-brand-accent">SCHOOL</span>
            </span>
            <span className="font-mono text-[8px] text-[#FAFAF8]/40 uppercase tracking-[0.25em]">
              Venture Fellowship · Middha Ventures
            </span>
          </div>
        </div>

        {/* ── MIDDLE: Core content ── */}
        <div className="relative z-10 space-y-7">

          {/* Main tagline */}
          <div className="space-y-4">
            <div className="w-6 h-[2px] bg-brand-accent" />
            <h2 className="font-serif italic text-[28px] leading-[1.2] text-[#FAFAF8] font-normal">
              Built for those who want a{" "}
              <span className="text-brand-accent not-italic font-black">seat at the table,</span>{" "}
              not a seat in the classroom.
            </h2>
          </div>

          {/* What you'll actually do */}
          <div className="space-y-2">
            <span className="font-mono text-[9px] text-[#FAFAF8]/35 uppercase tracking-[0.22em] block">
              What you'll do
            </span>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {[
                "Screen startups",
                "Sit in pitch calls",
                "Run due diligence",
                "Talk to founders",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-brand-accent shrink-0" />
                  <span className="font-mono text-[10px] text-[#FAFAF8]/65 uppercase tracking-wider">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Program stats grid */}
          <div className="grid grid-cols-3 divide-x divide-white/[0.07] border border-white/[0.07] rounded-sm overflow-hidden">
            {[
              { value: "20",   label: "Fellows / Cohort" },
              { value: "₹18K", label: "Student Pricing"  },
              { value: "10 Wk", label: "Weekend Sessions" },
            ].map(({ value, label }) => (
              <div key={label} className="px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                <span className="block font-serif text-xl font-black text-brand-accent leading-none">
                  {value}
                </span>
                <span className="block font-mono text-[8px] text-[#FAFAF8]/40 uppercase tracking-wider mt-1">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* 4-Phase strip */}
          <div className="space-y-2">
            <span className="font-mono text-[9px] text-[#FAFAF8]/35 uppercase tracking-[0.22em] block">
              10-week curriculum
            </span>
            <div className="flex gap-0 overflow-hidden rounded-sm border border-white/[0.07]">
              {[
                { code: "P1", name: "Ecosystem"  },
                { code: "P2", name: "Screening"  },
                { code: "P3", name: "Founders"   },
                { code: "P4", name: "Diligence"  },
              ].map(({ code, name }, i) => (
                <div
                  key={code}
                  className={`flex-1 px-2 py-2 text-center bg-white/[0.03] ${i > 0 ? "border-l border-white/[0.07]" : ""}`}
                >
                  <span className="block font-mono text-[9px] font-bold text-brand-accent">{code}</span>
                  <span className="block font-mono text-[8px] text-[#FAFAF8]/40 mt-0.5">{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fellow quote */}
          <div className="border-l-2 border-brand-accent/40 pl-4 space-y-1">
            <p className="font-serif italic text-[12px] text-[#FAFAF8]/60 leading-relaxed line-clamp-2">
              "My time at DealSchool was an incredible crash course in the startup world — real pitch calls, real founders, real decisions."
            </p>
            <span className="font-mono text-[9px] text-brand-accent uppercase tracking-wider">
              — Lakshit Jangid, DealSchool Fellow
            </span>
          </div>
        </div>

        {/* ── BOTTOM: Footer ── */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={goToSite}
            className="flex items-center gap-1.5 font-mono text-[9px] text-[#FAFAF8]/35 hover:text-[#FAFAF8]/70 uppercase tracking-widest transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
            Back to website
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400/80" />
            <span className="font-mono text-[9px] text-[#FAFAF8]/25 uppercase tracking-widest">
              TLS Secured
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — Form panel
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center bg-[#FAFAF8] px-8 py-12">
        <div className="w-full max-w-[360px] space-y-8">

          {/* Mobile wordmark */}
          <div className="lg:hidden flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={dealschoolLogo} alt="DealSchool" className="w-8 h-8 object-contain" />
              <span className="font-sans text-base font-black text-brand-text tracking-widest uppercase">
                DEAL<span className="text-brand-accent">SCHOOL</span>
              </span>
            </div>
            <button
              onClick={goToSite}
              className="flex items-center gap-1 font-mono text-[9px] text-brand-neutral hover:text-brand-text uppercase tracking-wider transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" /> Site
            </button>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <span className="font-mono text-[9px] text-brand-accent tracking-[0.3em] font-bold uppercase block">
              Admissions Board
            </span>
            <h1 className="font-serif text-[32px] font-bold text-brand-text leading-tight">
              Sign in
            </h1>
            <p className="font-sans text-xs text-brand-neutral leading-relaxed">
              Restricted to authorized supervisors only.
            </p>
          </div>

          {/* Error banner */}
          {(error || authError) && (
            <div className="bg-red-50 border border-red-200 px-3 py-2.5 text-red-700 text-xs flex gap-2 items-start">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-px" />
              <span>{error || authError}</span>
            </div>
          )}

          {/* Email / Password form */}
          <form onSubmit={handleEmailLogin} className="space-y-4" autoComplete="off">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-brand-neutral uppercase tracking-wider font-semibold block">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                className="w-full bg-white text-brand-text px-3 py-2.5 border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-sm transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] text-brand-neutral uppercase tracking-wider font-semibold block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="font-mono text-[9px] text-brand-accent hover:underline uppercase tracking-wider cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full bg-white text-brand-text px-3 pr-10 py-2.5 border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-sm transition-colors"
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
              className="w-full py-3 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-60 text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? "Verifying…" : <><LogIn className="h-3.5 w-3.5" /> Continue with Email</>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-brand-secondary/10" />
            <span className="font-mono text-[9px] text-brand-neutral uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-brand-secondary/10" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 border border-brand-secondary/20 hover:bg-brand-secondary/5 disabled:opacity-60 text-brand-text font-mono text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Mobile back to site */}
          <div className="lg:hidden pt-2 text-center">
            <button
              onClick={goToSite}
              className="font-mono text-[9px] text-brand-neutral hover:text-brand-text uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Back to DealSchool website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
