/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import prernaImg from "../assets/Prernaranjan.jpeg";
import deeptiImg from "../assets/DeeptiGupta.jpeg";
import chiragImg from "../assets/Chirag.png";

interface MentorsPageProps {
  onApplyClick?: () => void;
  onChangePage?: (
    page:
      | "home"
      | "about"
      | "program"
      | "team"
      | "mentors"
      | "contact"
      | "faq"
      | "terms-and-conditions"
      | "privacy-policy"
      | "refund-and-cancellation"
  ) => void;
}

interface Mentor {
  img: string;
  name: string;
  role: string;
  bio: string[];
  linkedin?: string;
}

const MENTORS: Mentor[] = [
  {
    img: prernaImg,
    name: "Prerna Ranjan",
    role: "Founder, Verra Lex",
    bio: [
      "Prerna Ranjan is the founder of Verra Lex, bringing over eight years of experience advising startups, growth-stage companies, investors, and enterprises.",
      "Previously with top-tier Indian law firms Khaitan & Co and J. Sagar Associates, Prerna specializes in high-value investments, M&A, cross-border transactions, and regulatory compliance. Known for delivering clear, commercial, and risk-managed advice, she partners closely with founders and business teams to align legal strategy with commercial growth.",
      "Based in Bangalore, she advises clients pan-India and internationally.",
    ],
  },
  {
    img: deeptiImg,
    name: "Deepti Gupta",
    role: "Founder & CEO, Fitreak",
    bio: [
      "Meet Deepti Gupta — Founder & CEO of Fitreak.",
      "With experience in marketing and a journey into entrepreneurship, Deepti brings a founder's perspective on building a company from the ground up — from validating an idea and building the early team to shaping the product and driving growth.",
      "At DealSchool, she'll take you beyond the pitch deck to explore what founders experience while fundraising, how investors evaluate businesses, and what it really takes to build an investable company.",
      "Learn the founder journey. See through the investor lens.",
    ],
  },
  {
    img: chiragImg,
    name: "Chirag Thakker",
    role: "Managing Partner, Middha Ventures",
    bio: [
      "Meet Chirag Thakker — Managing Partner at Middha Ventures & Founder of Alpha Seed Venture.",
      "With 15+ years across the startup ecosystem — and having been a founder himself — Chirag brings an investor's perspective on evaluating early-stage businesses, from understanding founders and their teams to assessing opportunities, growth potential, and investment readiness.",
      "At DealSchool, he'll take you deeper into how investors evaluate startups, and what they look for while making investment decisions.",
      "Learn how investors think. Understand what makes a startup investable.",
    ],
  },
];

export const MentorsPage: React.FC<MentorsPageProps> = ({ onApplyClick, onChangePage }) => {
  useEffect(() => {
    document.title = "Mentors | DealSchool";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="bg-brand-secondary border-b border-brand-accent/20 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-accent/[0.08] via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.12em] uppercase block mb-4">
            Industry Practitioners
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#FAFAF8]">
            Mentors who&apos;ve <span className="font-serif italic font-medium text-brand-accent">done the deal.</span>
          </h1>
          <p className="font-sans text-sm md:text-base text-[#FAFAF8]/70 leading-relaxed max-w-lg mt-4">
            Fellows get direct access to seasoned operators, investors, and advisors who bring real-world dealmaking experience into every session.
          </p>
        </div>

        {/* Transitional accent line at bottom of hero banner */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-accent/60 to-transparent pointer-events-none" />
      </div>

      {/* Mentor Cards */}
      <section
        id="mentors"
        className="relative overflow-hidden py-20 lg:py-28 border-b border-brand-secondary/10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-accent/[0.035] via-[#FAFAF8] to-[#F5F0E6]"
      >
        {/* Subtle background ambient lighting */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-brand-accent/[0.04] rounded-full blur-3xl select-none" />
          <div className="max-w-7xl mx-auto h-full border-x border-brand-secondary/[0.04] hidden md:block" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Mentor Cards Grid */}
          <div className="grid grid-cols-1 gap-8 lg:gap-10">
            {MENTORS.map((person) => (
              <div
                key={person.name}
                className="group relative bg-[#FAFAF8] border border-brand-secondary/15 rounded-sm overflow-hidden shadow-2xs hover:shadow-xl hover:border-brand-accent/40 transition-all duration-300 hover:-translate-y-1 flex flex-col sm:flex-row"
              >
                {/* Subtle top card accent bar on hover */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-accent/0 via-brand-accent/60 to-brand-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

                {/* Portrait Container */}
                <div className="w-full sm:w-5/12 lg:w-4/12 aspect-square flex-shrink-0 bg-[#EFECE6] relative overflow-hidden border-b sm:border-b-0 sm:border-r border-brand-secondary/10">
                  <img
                    src={person.img}
                    alt={person.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
                </div>

                {/* Content Panel */}
                <div className="w-full sm:w-7/12 lg:w-8/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-center flex-grow bg-brand-bg/50 space-y-4">
                  <div>
                    <span className="font-mono text-[10px] text-brand-accent font-bold uppercase tracking-widest block mb-1">
                      {person.role}
                    </span>
                    <h3 className="font-serif text-2xl lg:text-3xl font-bold text-brand-text tracking-tight group-hover:text-brand-secondary transition-colors">
                      {person.name}
                    </h3>
                  </div>

                  <div className="w-12 h-px bg-brand-accent/40" />

                  <div className="space-y-3">
                    {person.bio.map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="font-sans text-xs sm:text-sm text-[#4A4E53] leading-relaxed max-w-[68ch]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {person.linkedin && (
                    <div className="pt-4 mt-2 border-t border-brand-secondary/10">
                      <a
                        href={person.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 font-mono text-xs font-bold text-brand-secondary hover:text-brand-accent uppercase tracking-wider transition-colors duration-200 group/link"
                      >
                        <svg className="h-4 w-4 fill-current text-brand-secondary group-hover/link:text-brand-accent transition-colors" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        <span>LinkedIn Profile</span>
                        <ExternalLink className="h-3 w-3 opacity-60 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 transition-all" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Closing Section Description Paragraph */}
          <div className="mt-12 lg:mt-16 text-center max-w-2xl mx-auto">
            <p className="font-serif text-sm sm:text-base text-brand-neutral leading-relaxed">
              DealSchool continues to grow its mentor network with active investors, founders, and legal and operating specialists from across the ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Navigation CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => onChangePage?.("home")}
          className="font-mono text-xs font-bold text-brand-secondary hover:text-brand-accent uppercase tracking-wider transition-colors cursor-pointer"
        >
          &larr; Back to Homepage
        </button>

        {onApplyClick && (
          <button
            onClick={onApplyClick}
            className="bg-brand-secondary text-brand-bg px-6 py-3 font-mono font-bold text-xs uppercase tracking-wider hover:bg-brand-dark-blue transition-all duration-300 flex items-center gap-2 cursor-pointer rounded-sm"
          >
            Apply for Cohort 1 <ArrowUpRight className="h-4 w-4 text-brand-accent" />
          </button>
        )}
      </div>
    </div>
  );
};
