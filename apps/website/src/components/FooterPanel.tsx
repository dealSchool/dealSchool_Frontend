/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DealSchoolLogo } from "./SVGIllustrations";
import { Mail, MapPin, ArrowUp } from "lucide-react";

interface FooterPanelProps {
  onChangePage?: (
    page:
      | "home"
      | "about"
      | "program"
      | "team"
      | "contact"
      | "faq"
      | "terms-and-conditions"
      | "privacy-policy"
      | "refund-and-cancellation"
      | "admin-login"
      | "admin"
  ) => void;
}

export const FooterPanel: React.FC<FooterPanelProps> = ({ onChangePage }) => {
  const scrollHeightTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-brand-dark-blue text-[#FAFAF8] pt-12 md:pt-16 pb-8 border-t border-brand-accent/30 relative overflow-hidden">
      {/* Accent Gold ambient core backing */}
      <div className="absolute bottom-0 left-0 h-96 w-96 bg-brand-accent/5 rounded-full filter blur-3xl -translate-x-12 translate-y-12 select-none pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#FAFAF8]/10">
          
          {/* Brand block */}
          <div className="space-y-4 md:col-span-2">
            <div className="scale-95 origin-left">
              <DealSchoolLogo />
            </div>
            <p className="font-serif italic text-xs md:text-sm text-[#FAFAF8]/70 max-w-md leading-relaxed">
              &ldquo;Built for those who want a seat at the table, not a seat in the classroom.&rdquo;
            </p>
            <div className="flex flex-col gap-2 pt-2 text-[11px] font-mono text-[#FAFAF8]/60">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-brand-accent" />
                <span>Navi Mumbai, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-brand-accent" />
                <span>support@dealschool.in</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 md:col-span-1">
            <h5 className="font-mono text-[9px] text-brand-accent tracking-[0.12em] font-bold uppercase">
              Quick Links
            </h5>
            <ul className="space-y-2 font-mono text-[11px] font-bold tracking-wider uppercase">
              {[
                { label: "Home", id: "home" as const },
                { label: "About", id: "about" as const },
                { label: "Program", id: "program" as const },
                { label: "Team", id: "team" as const },
                { label: "Contact", id: "contact" as const },
                { label: "FAQ", id: "faq" as const },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => {
                      if (onChangePage) {
                        onChangePage(link.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="text-[#FAFAF8]/60 hover:text-brand-accent transition-colors cursor-pointer bg-transparent border-none p-0 text-left font-mono"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Admin */}
          <div className="space-y-3 md:col-span-1">
            <h5 className="font-mono text-[9px] text-brand-accent tracking-[0.12em] font-bold uppercase">
              Legal 
            </h5>
            <ul className="space-y-2 font-mono text-[11px] font-bold tracking-wider uppercase">
              <li>
                <button
                  onClick={() => {
                    if (onChangePage) {
                      onChangePage("terms-and-conditions");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="text-[#FAFAF8]/60 hover:text-brand-accent transition-colors cursor-pointer bg-transparent border-none p-0 text-left font-mono"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onChangePage) {
                      onChangePage("privacy-policy");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="text-[#FAFAF8]/60 hover:text-brand-accent transition-colors cursor-pointer bg-transparent border-none p-0 text-left font-mono"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onChangePage) {
                      onChangePage("refund-and-cancellation");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="text-[#FAFAF8]/60 hover:text-brand-accent transition-colors cursor-pointer bg-transparent border-none p-0 text-left font-mono"
                >
                  Refund &amp; Cancellation
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Base copyright metadata */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 text-[10px] font-mono text-[#FAFAF8]/40 uppercase tracking-widest leading-none">
          <span>&copy; {new Date().getFullYear()} DEALSCHOOL. AN INITIATIVE BY MIDDHA VENTURES. ALL RIGHTS RESERVED.</span>
          <button
            onClick={scrollHeightTop}
            className="group flex items-center gap-2 hover:text-[#FAFAF8] transition-all bg-[#FAFAF8]/5 px-3 py-1.5 rounded-sm border border-[#FAFAF8]/10 cursor-pointer"
          >
            BACK TO TOP <ArrowUp className="h-3 w-3 text-brand-accent group-hover:-translate-y-0.5 transition-all" />
          </button>
        </div>
      </div>
    </footer>
  );
};
