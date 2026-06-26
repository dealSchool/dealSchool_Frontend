/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DealSchoolLogo } from "./SVGIllustrations";
import { Mail, MapPin, ArrowUp, Phone } from "lucide-react";
import { auth } from "../firebase";

interface FooterPanelProps {
  onChangePage?: (page: "home" | "about" | "program" | "team" | "contact" | "admin-login" | "admin") => void;
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
                <span>hello@dealschool.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-brand-accent" />
                <span>+91 91361 51361</span>
              </div>
            </div>
          </div>

          {/* Underwriting credits */}
          <div className="space-y-3 md:col-span-2">
            <h5 className="font-mono text-[9px] text-brand-accent tracking-[0.25em] font-bold uppercase">
              UNDERWRITTEN BY
            </h5>
            <div className="space-y-2 font-serif text-xs text-[#FAFAF8]/80 leading-relaxed">
              <p className="font-bold text-white">Middha Ventures</p>
              <p className="text-[#FAFAF8]/60 text-[10px] leading-relaxed">
                Middha Ventures is a Navi Mumbai-based family office investing at the intersection of Consumer Tech and Strategic Capital, backing the next wave of builders.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Base copyright metadata */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 text-[10px] font-mono text-[#FAFAF8]/40 uppercase tracking-widest leading-none">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <span>&copy; {new Date().getFullYear()} DEALSCHOOL. AN INITIATIVE BY MIDDHA VENTURES. ALL RIGHTS RESERVED.</span>
            <button
              onClick={() => {
                if (onChangePage) {
                  const destination = auth.currentUser ? "admin" : "admin-login";
                  onChangePage(destination);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="text-[#FAFAF8]/25 hover:text-brand-accent transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              [Admin Portal]
            </button>
          </div>
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
