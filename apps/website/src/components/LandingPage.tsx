/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Landmark,
  BookOpen,
  BarChart4,
  FileSpreadsheet,
  Users2,
  GraduationCap,
  Briefcase,
  Settings2,
  TrendingUp,
  Download,
} from "lucide-react";
import { DealSchoolLogo, StaircaseIllustration } from "./SVGIllustrations";
import { ApplyModal } from "./ApplyModal";
import { BrochureModal } from "./BrochureModal";

// Page-specific palette (kept local to this standalone page — see brochure mockup)
// cream:   #F5EFDF — primary light section background
// tan:     #F3E4C1 — alternating band background
// navy:    #1C2A5D — headings / primary dark sections
// navyDark:#141F45 — deepest navy (footer, contrast cards)
// gold:    #C89A3C — accent color for eyebrows, numerals, primary buttons

const FEATURE_BAR = [
  { icon: Landmark, label: "Built by Investors" },
  { icon: BookOpen, label: "10-Week Live Fellowship" },
  { icon: BarChart4, label: "Real Startup Case Studies" },
  { icon: FileSpreadsheet, label: "Hands-on Investment Simulations" },
  { icon: Users2, label: "Exclusive Community" },
];

const WHO_IS_THIS_FOR = [
  {
    icon: GraduationCap,
    title: "Students",
    desc: "Trying to break into venture capital and learn how investors actually think, not just how startups pitch.",
  },
  {
    icon: Briefcase,
    title: "Founders",
    desc: "Who want to understand how the people on the other side of the table evaluate, diligence, and decide.",
  },
  {
    icon: Settings2,
    title: "Operators",
    desc: "Building operating experience who want a structured path into venture and early-stage investing.",
  },
  {
    icon: TrendingUp,
    title: "Aspiring Investors",
    desc: "Ready to move past theory and get hands-on reps sourcing, screening, and backing real companies.",
  },
];

const JOURNEY_STEPS = [
  "Curiosity",
  "Startup Analysis",
  "Financial Analysis",
  "Valuation",
  "Term Sheets",
  "Investment Thesis",
  "Investment Committee",
];

const FELLOWSHIP_OUTCOMES = [
  "Hands-on experience evaluating real, live startup deals",
  "Direct exposure to term sheets, memos, and investment committees",
  "A network of founders, operators, and investment mentors",
  "A DealSchool Certified Venture Fellow credential",
];

const FAQ_ITEMS = [
  {
    question: "Do I need a finance background?",
    answer:
      "No, you won't need one. DealSchool is built for anyone serious about understanding venture capital, what matters is curiosity, drive, and genuine interest in startups and investing, not a finance degree. We'll teach you the rest.",
  },
  {
    question: "Is there a certificate?",
    answer:
      "Yes, a DealSchool Fellowship Certificate from DealSchool, an initiative by Middha Ventures. It's a mark of the work you completed, not a guaranteed shortcut to a job title; the real value is the experience, thinking, and network you build.",
  },
  {
    question: "How is DealSchool different from online VC courses?",
    answer:
      "Online courses teach you to study VC from outside videos, frameworks, and theory. DealSchool is a fellowship, not a course. You're part of a live, small cohort working alongside active practitioners from the ecosystem, not learning from pre-recorded content.",
  },
  {
    question: "What happens after I complete the fellowship?",
    answer:
      "You leave with a personal investment memo on a real startup, an investment thesis in a sector, your certificate, and introductions to VCs and founders.",
  },
];

export const LandingPage: React.FC = () => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isBrochureModalOpen, setIsBrochureModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleApplyClick = () => setIsApplyModalOpen(true);
  const handleBrochureClick = () => setIsBrochureModalOpen(true);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#C89A3C] selection:text-[#1C2A5D] relative overflow-x-clip bg-[#F5EFDF] text-[#1C2A5D]">
      {/* Minimal standalone header — logo only, no site navigation */}
      <header className="sticky top-0 z-40 bg-[#F5EFDF]/95 backdrop-blur-md border-b border-[#1C2A5D]/10 py-5 lg:py-6 lg:px-12 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <DealSchoolLogo />
          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={handleBrochureClick}
              className="hidden sm:flex items-center gap-1.5 font-mono font-bold text-[11px] uppercase tracking-wider text-[#1C2A5D] hover:text-[#C89A3C] transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Download Brochure
            </button>
            <button
              onClick={handleApplyClick}
              className="border border-[#1C2A5D] text-[#1C2A5D] px-5 py-2.5 md:px-6 md:py-3 font-mono font-bold text-[11px] md:text-xs uppercase tracking-wider hover:bg-[#1C2A5D] hover:text-[#F5EFDF] transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              Apply Now <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* HERO */}
        <section className="relative overflow-hidden pt-14 pb-16 md:pt-20 md:pb-24 bg-[#F5EFDF]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C89A3C]/[0.06] via-transparent to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 text-center space-y-6">
            <span className="font-mono text-xs text-[#C89A3C] font-bold tracking-[0.14em] uppercase block">
              An Initiative by Middha Ventures
            </span>

            <h1 className="font-sans font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-[#1C2A5D] tracking-tight">
              Built for those who want a <span className="text-[#C89A3C]">seat at the table</span>,{" "}
              <span className="block mt-2">not a seat in the classroom.</span>
            </h1>

            <p className="font-serif text-base md:text-lg text-[#1C2A5D]/70 leading-relaxed max-w-2xl mx-auto">
              Go beyond startup theory and experience venture capital in practice. Over 10 weeks, you&apos;ll learn how investors source opportunities, evaluate startups, analyze markets, understand valuation, negotiate term sheets, and build investment theses through live sessions, practical assignments, and real-world case studies.
            </p>

            <p className="font-serif italic text-sm md:text-base text-[#1C2A5D]/85 max-w-xl mx-auto">
              Whether you&apos;re a student, founder, operator, or aspiring investor, DealSchool equips you with the mindset and frameworks to make better investment decisions.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-4">
              <button
                onClick={handleApplyClick}
                className="bg-[#C89A3C] hover:bg-[#B8862E] text-[#1C2A5D] px-8 py-4 font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#C89A3C]/25 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Apply Now <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={handleBrochureClick}
                className="border border-[#1C2A5D]/35 px-8 py-4 font-mono font-bold text-xs uppercase tracking-wider text-[#1C2A5D] hover:bg-[#1C2A5D] hover:text-[#F5EFDF] transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download Brochure
              </button>
            </div>

            <span className="font-mono text-[11px] text-[#1C2A5D]/60 tracking-wider uppercase block pt-2">
              10 Weeks &bull; Live Online &bull; Limited to 20 Fellows
            </span>
          </div>

          {/* Bottom feature bar */}
          <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12 md:mt-16 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
              {FEATURE_BAR.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center gap-2 p-4 bg-white border border-[#1C2A5D]/10 rounded-sm"
                >
                  <Icon className="h-5 w-5 text-[#C89A3C]" />
                  <span className="font-sans text-[11px] font-bold text-[#1C2A5D] leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MOST PEOPLE LEARN STARTUPS */}
        <section className="py-20 bg-[#1C2A5D]">
          <div className="max-w-5xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              Most people learn startups. <span className="text-[#C89A3C]">Very few learn investing.</span>
            </h2>
            <p className="font-serif text-sm md:text-base text-white/70 leading-relaxed">
              Building and investing are opposite skillsets. Founders learn to pitch, sell, and push forward against every objection. Investors learn to question, diligence, and know when to walk away. DealSchool teaches the second skillset, built for ambitious students, founders, operators, and aspiring investors who want to understand how capital actually gets allocated.
            </p>
          </div>
        </section>

        {/* WHO IS THIS FOR */}
        <section className="py-20 bg-[#F3E4C1]">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="font-mono text-xs text-[#C89A3C] font-bold tracking-[0.12em] uppercase block mb-2">
                Who This Is For
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C2A5D] tracking-tight">
                Who Is This For?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {WHO_IS_THIS_FOR.map(({ icon: Icon, title, desc }, idx) => (
                <div
                  key={title}
                  className="bg-[#F5EFDF] border-l-4 border-[#C89A3C] border-y border-r border-[#1C2A5D]/10 rounded-sm p-6 space-y-3 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#1C2A5D] flex items-center justify-center text-[#C89A3C] font-mono text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <Icon className="h-5 w-5 text-[#1C2A5D]" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#1C2A5D]">{title}</h4>
                  <p className="font-sans text-xs text-[#1C2A5D]/70 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VENTURE CAPITAL JOURNEY / STAIRCASE */}
        <section id="curriculum" className="py-20 md:py-24 bg-[#F5EFDF]">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="font-mono text-xs text-[#C89A3C] font-bold tracking-[0.12em] uppercase block mb-2">
                Your Venture Capital Journey
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C2A5D] tracking-tight">
                Certified Venture Fellow
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <StaircaseIllustration />

              <ol className="space-y-3">
                {JOURNEY_STEPS.map((step, idx) => (
                  <li
                    key={step}
                    className="flex items-center gap-4 bg-white border border-[#1C2A5D]/10 rounded-sm px-5 py-3.5"
                  >
                    <span className="font-mono text-xs font-bold text-[#C89A3C] shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="font-sans text-sm font-semibold text-[#1C2A5D]">{step}</span>
                  </li>
                ))}
                <li className="flex items-center gap-4 bg-[#1C2A5D] text-[#F5EFDF] rounded-sm px-5 py-4 mt-4">
                  <Sparkles className="h-4 w-4 text-[#C89A3C] shrink-0" />
                  <span className="font-serif text-sm font-bold">Certified Venture Fellow</span>
                </li>
              </ol>
            </div>

            <p className="font-serif italic text-sm text-[#1C2A5D]/70 text-center max-w-2xl mx-auto mt-12">
              From your first startup analysis to your final investment recommendation&mdash;every step is designed to help you think like an investor.
            </p>
          </div>
        </section>

        {/* FELLOWSHIP OUTCOMES + COMMUNITY */}
        <section className="py-20 bg-[#F3E4C1]">
          <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1C2A5D] tracking-tight">
                Fellowship Outcomes
              </h2>
              <ul className="space-y-4">
                {FELLOWSHIP_OUTCOMES.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#C89A3C] mt-0.5 shrink-0" />
                    <span className="font-sans text-sm text-[#1C2A5D] font-medium leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6 bg-[#1C2A5D] rounded-sm p-8">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-white tracking-tight">
                Community
              </h2>
              <p className="font-sans text-sm text-white/70 leading-relaxed">
                Join a growing community of founders, operators, and investors learning venture capital by doing it together, not by watching from the sidelines.
              </p>
              <p className="font-serif italic text-base text-[#C89A3C] font-bold">
                Investment is a Skill. Learn It. Practice It.
              </p>
            </div>
          </div>
        </section>

        {/* COHORT DETAILS & PRICING */}
        <section className="py-20 bg-[#F5EFDF]">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="font-mono text-xs text-[#C89A3C] font-bold tracking-[0.12em] uppercase block mb-2">
                Logistics
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C2A5D] tracking-tight">
                Cohort Details &amp; Pricing
              </h2>
            </div>

            <div className="bg-white border border-[#1C2A5D]/15 rounded-sm p-8 md:p-10 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-[#1C2A5D]/60 uppercase tracking-widest">Duration</div>
                  <div className="font-serif text-xl font-bold text-[#1C2A5D]">10 Weeks</div>
                </div>
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-[#1C2A5D]/60 uppercase tracking-widest">Format</div>
                  <div className="font-serif text-xl font-bold text-[#1C2A5D]">Live Online</div>
                </div>
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-[#1C2A5D]/60 uppercase tracking-widest">Commitment</div>
                  <div className="font-serif text-xl font-bold text-[#1C2A5D]">Weekend Sessions</div>
                </div>
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-[#1C2A5D]/60 uppercase tracking-widest">Seats</div>
                  <div className="font-serif text-xl font-bold text-[#1C2A5D]">Limited to 20</div>
                </div>
              </div>

              <div className="border-t border-[#1C2A5D]/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="bg-[#141F45] rounded-sm px-6 py-4 text-center md:text-left">
                  <div className="font-mono text-[9px] text-[#C89A3C] uppercase tracking-widest mb-1">All-In Price</div>
                  <div className="font-serif text-4xl font-black text-white">
                    &#8377;18,000<span className="align-super text-lg text-[#C89A3C]">*</span>
                  </div>
                  <div className="font-sans text-[11px] text-white/60">*Exclusive of GST</div>
                </div>
                <button
                  onClick={handleApplyClick}
                  className="px-8 py-4 bg-[#C89A3C] hover:bg-[#B8862E] text-[#1C2A5D] font-mono text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-md inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  Apply Now <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-[#F3E4C1]">
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C2A5D] tracking-tight">FAQ</h2>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={item.question}
                    className="bg-[#F5EFDF] border border-[#1C2A5D]/10 rounded-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                    >
                      <span className="font-sans text-sm font-bold text-[#1C2A5D]">{item.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#C89A3C] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="font-sans text-xs md:text-sm text-[#1C2A5D]/70 leading-relaxed px-5 pb-4">
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 bg-[#1C2A5D] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#141F45] via-[#1C2A5D] to-[#1C2A5D] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 bg-[#C89A3C]/10 rounded-full filter blur-3xl select-none pointer-events-none"></div>
          <div className="max-w-3xl mx-auto px-4 text-center relative z-10 space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-[46px] font-black tracking-tight leading-[1.1] text-white">
              The next generation of investors won&apos;t just read about venture capital. They&apos;ll{" "}
              <span className="text-[#C89A3C]">practice it.</span>
            </h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <button
                onClick={handleApplyClick}
                className="px-10 py-5 bg-[#C89A3C] hover:bg-[#B8862E] text-[#1C2A5D] font-mono text-xs font-bold tracking-widest uppercase rounded-sm transition-all shadow-md inline-flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Apply for Cohort 1 <ArrowRight className="h-4 w-4 text-[#1C2A5D]" />
              </button>
              <button
                onClick={handleBrochureClick}
                className="px-10 py-5 border border-white/30 text-white hover:bg-white/10 font-mono text-xs font-bold tracking-widest uppercase rounded-sm transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download Brochure
              </button>
            </div>
            <p className="font-serif italic text-sm text-white/70">
              Become part of DealSchool&apos;s founding cohort.
            </p>
          </div>
        </section>
      </main>

      {/* Minimal standalone footer */}
      <footer className="bg-[#141F45] text-white/60 py-6 border-t border-[#C89A3C]/20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-widest">
          <div className="flex items-center gap-5">
            <a href="/terms-and-conditions" className="hover:text-[#C89A3C] transition-colors">Terms</a>
            <a href="/privacy-policy" className="hover:text-[#C89A3C] transition-colors">Privacy</a>
          </div>
          <span>&copy; {new Date().getFullYear()} DealSchool. An Initiative by Middha Ventures.</span>
        </div>
      </footer>

      <ApplyModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />
      <BrochureModal isOpen={isBrochureModalOpen} onClose={() => setIsBrochureModalOpen(false)} />
    </div>
  );
};
