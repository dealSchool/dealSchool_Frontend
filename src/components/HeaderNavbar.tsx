/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { DealSchoolLogo } from "./SVGIllustrations";
import { Menu, X, ArrowUpRight } from "lucide-react";

interface HeaderNavbarProps {
  onApplyClick: () => void;
  activePage: "home" | "about" | "program" | "team" | "contact";
  onChangePage: (page: "home" | "about" | "program" | "team" | "contact") => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  onApplyClick,
  activePage,
  onChangePage
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", id: "home" as const },
    { label: "About", id: "about" as const },
    { label: "Program", id: "program" as const },
    { label: "Team", id: "team" as const },
    { label: "Contact", id: "contact" as const },
  ];

  const handlePageClick = (pageId: "home" | "about" | "program" | "team" | "contact") => {
    setMobileMenuOpen(false);
    onChangePage(pageId);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-brand-bg/95 backdrop-blur-md border-b border-[#111111]/10 py-5 lg:py-6 lg:px-12 px-4 transition-all">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo anchor */}
        <div 
          className="cursor-pointer transition-transform hover:scale-[1.01]" 
          onClick={() => handlePageClick("home")}
        >
          <DealSchoolLogo />
        </div>

        {/* Desktop Navbar elements - Clean, minimalist report feel */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handlePageClick(link.id)}
                className={`text-xs font-mono font-bold tracking-[0.15em] uppercase transition-all duration-200 cursor-pointer border-b pb-0.5 ${
                  isActive
                    ? "text-brand-accent border-brand-accent"
                    : "text-brand-text opacity-60 hover:opacity-100 border-transparent hover:border-brand-accent/50"
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* CTA Button */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={onApplyClick}
            className="border border-brand-secondary px-6 py-2.5 hover:bg-brand-secondary hover:text-brand-bg font-mono text-[10px] font-bold tracking-widest uppercase transition-colors duration-300 flex items-center gap-1.5 cursor-pointer text-brand-secondary"
          >
            Apply Now <ArrowUpRight className="h-3.5 w-3.5 text-brand-accent" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 border border-brand-secondary/15 rounded-sm hover:bg-brand-secondary/5 text-brand-text"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-brand-bg border-b border-brand-secondary/15 absolute left-0 right-0 py-6 px-4 md:px-8 space-y-5 shadow-lg max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handlePageClick(link.id)}
                  className={`text-left py-2 font-mono text-xs font-bold tracking-wider uppercase border-b border-brand-secondary/5 ${
                    isActive ? "text-brand-accent font-black" : "text-brand-neutral hover:text-brand-text"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onApplyClick();
            }}
            className="w-full py-3 bg-brand-secondary hover:bg-brand-dark-blue text-brand-bg font-mono text-xs font-bold tracking-wider uppercase rounded-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Apply Now <ArrowUpRight className="h-4 w-4 text-brand-accent" />
          </button>
        </div>
      )}
    </header>
  );
};
