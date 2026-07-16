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
} from "lucide-react";
import { DealSchoolLogo, StaircaseIllustration } from "./SVGIllustrations";
import { ApplyModal } from "./ApplyModal";

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
  "Market Research",
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleApplyClick = () => setIsApplyModalOpen(true);

  const scrollToCurriculum = () => {
    document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-accent selection:text-brand-dark-blue relative overflow-x-clip bg-[#FCFAF6] text-[#111111]">
      {/* Minimal standalone header — logo only, no site navigation */}
      <header className="sticky top-0 z-40 bg-brand-bg/95 backdrop-blur-md border-b border-[#111111]/10 py-5 lg:py-6 lg:px-12 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <DealSchoolLogo />
          <button
            onClick={handleApplyClick}
            className="bg-brand-secondary text-brand-bg px-5 py-2.5 md:px-6 md:py-3 font-mono font-bold text-[11px] md:text-xs uppercase tracking-wider shadow-md shadow-brand-secondary/25 hover:bg-brand-dark-blue transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            Apply for Cohort 1 <ArrowRight className="h-3.5 w-3.5 text-brand-accent" />
          </button>
        </div>
      </header>

      <main className="flex-grow">
        {/* HERO */}
        <section className="relative overflow-hidden pt-14 pb-16 md:pt-20 md:pb-24 border-b border-[#111111]/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-accent/[0.04] via-transparent to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 text-center space-y-6">
            <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.14em] uppercase block">
              Middha Ventures Presents
            </span>

            <h1 className="font-sans font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-brand-text tracking-tight">
              Every great investor <br className="hidden sm:block" />
              starts somewhere.{" "}
              <span className="block text-brand-accent mt-2">This is where you begin.</span>
            </h1>

            <p className="font-serif text-base md:text-lg text-brand-neutral leading-relaxed max-w-2xl mx-auto">
              Go beyond startup theory and experience venture capital in practice. Over 10 weeks, you&apos;ll learn how investors source opportunities, evaluate startups, analyze markets, understand valuation, negotiate term sheets, and build investment theses through live sessions, practical assignments, and real-world case studies.
            </p>

            <p className="font-serif italic text-sm md:text-base text-brand-secondary max-w-xl mx-auto">
              Whether you&apos;re a student, founder, operator, or aspiring investor, DealSchool equips you with the mindset and frameworks to make better investment decisions.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-4">
              <button
                onClick={handleApplyClick}
                className="bg-brand-secondary text-brand-bg px-8 py-4 font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-secondary/25 hover:bg-brand-dark-blue transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Apply for Cohort 1 <ArrowRight className="h-4 w-4 text-brand-accent" />
              </button>
              <button
                onClick={scrollToCurriculum}
                className="border border-brand-secondary/35 px-8 py-4 font-mono font-bold text-xs uppercase tracking-wider text-brand-secondary hover:bg-brand-secondary hover:text-brand-bg transition-colors duration-300 text-center cursor-pointer"
              >
                Explore Curriculum
              </button>
            </div>

            <span className="font-mono text-[11px] text-brand-neutral/70 tracking-wider uppercase block pt-2">
              Founding Cohort &bull; 10 Weeks &bull; Live Online &bull; Limited to 25 Fellows
            </span>
          </div>

          {/* Bottom feature bar */}
          <div className="max-w-6xl mx-auto px-4 md:px-8 mt-12 md:mt-16 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
              {FEATURE_BAR.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center gap-2 p-4 bg-brand-bg border border-brand-secondary/10 rounded-sm"
                >
                  <Icon className="h-5 w-5 text-brand-accent" />
                  <span className="font-sans text-[11px] font-bold text-brand-text leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MOST PEOPLE LEARN STARTUPS */}
        <section className="py-20 border-b border-brand-secondary/10 bg-[#FAF7F0]">
          <div className="max-w-5xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-text tracking-tight leading-tight">
              Most people learn startups. Very few learn investing.
            </h2>
            <p className="font-serif text-sm md:text-base text-brand-neutral leading-relaxed">
              Building and investing are opposite skillsets. Founders learn to pitch, sell, and push forward against every objection. Investors learn to question, diligence, and know when to walk away. DealSchool teaches the second skillset, built for ambitious students, founders, operators, and aspiring investors who want to understand how capital actually gets allocated.
            </p>
          </div>
        </section>

        {/* WHO IS THIS FOR */}
        <section className="py-20 border-b border-brand-secondary/10">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-text tracking-tight">
                Who Is This For?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {WHO_IS_THIS_FOR.map(({ icon: Icon, title, desc }, idx) => (
                <div
                  key={title}
                  className="bg-brand-bg border border-brand-secondary/10 rounded-sm p-6 space-y-3 hover:border-brand-accent/40 hover:shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center text-brand-accent font-mono text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <Icon className="h-5 w-5 text-brand-secondary" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-brand-text">{title}</h4>
                  <p className="font-sans text-xs text-brand-neutral leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VENTURE CAPITAL JOURNEY / STAIRCASE */}
        <section id="curriculum" className="py-20 md:py-24 border-b border-brand-secondary/10 bg-[#FAF7F0]">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.12em] uppercase block mb-2">
                Your Venture Capital Journey
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-text tracking-tight">
                Certified Venture Fellow
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <StaircaseIllustration />

              <ol className="space-y-3">
                {JOURNEY_STEPS.map((step, idx) => (
                  <li
                    key={step}
                    className="flex items-center gap-4 bg-brand-bg border border-brand-secondary/10 rounded-sm px-5 py-3.5"
                  >
                    <span className="font-mono text-xs font-bold text-brand-accent shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="font-sans text-sm font-semibold text-brand-text">{step}</span>
                  </li>
                ))}
                <li className="flex items-center gap-4 bg-brand-secondary text-brand-bg rounded-sm px-5 py-4 mt-4">
                  <Sparkles className="h-4 w-4 text-brand-accent shrink-0" />
                  <span className="font-serif text-sm font-bold">Certified Venture Fellow</span>
                </li>
              </ol>
            </div>

            <p className="font-serif italic text-sm text-brand-neutral text-center max-w-2xl mx-auto mt-12">
              From your first startup analysis to your final investment recommendation&mdash;every step is designed to help you think like an investor.
            </p>
          </div>
        </section>

        {/* FELLOWSHIP OUTCOMES + COMMUNITY */}
        <section className="py-20 border-b border-brand-secondary/10">
          <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-text tracking-tight">
                Fellowship Outcomes
              </h2>
              <ul className="space-y-4">
                {FELLOWSHIP_OUTCOMES.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-accent mt-0.5 shrink-0" />
                    <span className="font-sans text-sm text-brand-secondary font-medium leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6 bg-[#FAF7F0] border border-brand-secondary/10 rounded-sm p-8">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-text tracking-tight">
                Community
              </h2>
              <p className="font-sans text-sm text-brand-neutral leading-relaxed">
                Join a growing community of founders, operators, and investors learning venture capital by doing it together, not by watching from the sidelines.
              </p>
              <p className="font-serif italic text-base text-brand-accent font-bold">
                Investment is a Skill. Learn It. Practice It.
              </p>
            </div>
          </div>
        </section>

        {/* COHORT DETAILS & PRICING */}
        <section className="py-20 border-b border-brand-secondary/10 bg-[#FAF7F0]">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-text tracking-tight">
                Cohort Details &amp; Pricing
              </h2>
            </div>

            <div className="bg-brand-bg border border-brand-secondary/15 rounded-sm p-8 md:p-10 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-brand-neutral uppercase tracking-widest">Duration</div>
                  <div className="font-serif text-xl font-bold text-brand-text">10 Weeks</div>
                </div>
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-brand-neutral uppercase tracking-widest">Format</div>
                  <div className="font-serif text-xl font-bold text-brand-text">Live Online</div>
                </div>
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-brand-neutral uppercase tracking-widest">Commitment</div>
                  <div className="font-serif text-xl font-bold text-brand-text">Weekend Sessions</div>
                </div>
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-brand-neutral uppercase tracking-widest">Seats</div>
                  <div className="font-serif text-xl font-bold text-brand-text">Limited to 25</div>
                </div>
              </div>

              <div className="border-t border-brand-secondary/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="font-mono text-[10px] text-brand-neutral uppercase tracking-widest mb-1">Pricing</div>
                  <div className="font-serif text-4xl font-black text-brand-accent">
                    &#8377;18,000<span className="align-super text-lg">*</span>
                  </div>
                  <div className="font-sans text-[11px] text-brand-neutral">*Exclusive of GST</div>
                </div>
                <button
                  onClick={handleApplyClick}
                  className="px-8 py-4 bg-brand-accent hover:bg-[#B24122] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-md inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  Apply Now <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 border-b border-brand-secondary/10">
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-text tracking-tight">FAQ</h2>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={item.question}
                    className="bg-brand-bg border border-brand-secondary/10 rounded-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                    >
                      <span className="font-sans text-sm font-bold text-brand-text">{item.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-brand-accent shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
                          <p className="font-sans text-xs md:text-sm text-brand-neutral leading-relaxed px-5 pb-4">
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
        <section className="py-24 bg-brand-dark-blue text-brand-bg relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 bg-brand-accent/10 rounded-full filter blur-3xl select-none pointer-events-none"></div>
          <div className="max-w-3xl mx-auto px-4 text-center relative z-10 space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-[46px] font-black tracking-tight leading-[1.1] text-white">
              The next generation of investors won&apos;t just read about venture capital. They&apos;ll{" "}
              <span className="text-brand-accent">practice it.</span>
            </h2>
            <div className="flex justify-center pt-2">
              <button
                onClick={handleApplyClick}
                className="px-10 py-5 bg-brand-accent hover:bg-[#B24122] text-white font-mono text-xs font-bold tracking-widest uppercase rounded-sm transition-all shadow-md inline-flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Apply for Cohort 1 <ArrowRight className="h-4 w-4 text-white" />
              </button>
            </div>
            <p className="font-serif italic text-sm text-brand-bg/70">
              Become part of DealSchool&apos;s founding cohort.
            </p>
          </div>
        </section>
      </main>

      {/* Minimal standalone footer */}
      <footer className="bg-brand-dark-blue text-[#FAFAF8]/60 py-6 border-t border-brand-accent/20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-widest">
          <div className="flex items-center gap-5">
            <a href="/terms-and-conditions" className="hover:text-brand-accent transition-colors">Terms</a>
            <a href="/privacy-policy" className="hover:text-brand-accent transition-colors">Privacy</a>
          </div>
          <span>&copy; {new Date().getFullYear()} DealSchool. An Initiative by Middha Ventures.</span>
        </div>
      </footer>

      <ApplyModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />
    </div>
  );
};
