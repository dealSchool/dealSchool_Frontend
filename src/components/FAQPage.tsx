/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, ChevronDown, HelpCircle } from "lucide-react";

interface FAQPageProps {
  onApplyClick?: () => void;
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

const FAQ_ITEMS = [
  {
    question: "Do I need a finance background?",
    answer:
      "No, you won't need one. DealSchool is built for anyone serious about understanding venture capital, what matters is curiosity, drive, and genuine interest in startups and investing, not a finance degree. We'll teach you the rest.",
  },
  {
    question: "Is the program online or offline?",
    answer: "Online, delivered over 10 weeks.",
  },
  {
    question: "Is there a certificate?",
    answer:
      "Yes, a DealSchool Fellowship Certificate from DealSchool, an initiative by Middha Ventures. It's a mark of the work you completed, not a guaranteed shortcut to a job title; the real value is the experience, thinking, and network you build.",
  },
  {
    question: "How much time should I dedicate each week?",
    answer: "Online - predominantly weekend sessions.",
  },
  {
    question: "How is DealSchool different from online VC courses?",
    answer:
      "Online courses teach you to study VC from outside videos, frameworks, and theory. DealSchool is a fellowship, not a course. You're part of a live, small cohort working alongside active practitioners from the ecosystem, not learning from pre-recorded content. You shadow real pitch calls, work through due diligence and deal mechanics, and build the screening instinct investors take years to develop. With direct mentor access, peer collaboration, and real feedback on your work, not just lessons to complete on your own.",
  },
  {
    question: "What happens after I complete the fellowship?",
    answer:
      "You leave with a personal investment memo on a real startup, an investment thesis in a sector, your certificate, and introductions to VCs and founders.",
  },
  {
    question: "Is this a self-paced course?",
    answer:
      "No. DealSchool is a live, cohort-based fellowship; sessions happen on a fixed weekend schedule with your cohort, not on-demand videos you work through alone. The structure, peer interaction, and direct mentor access are core to how the program works.",
  },
  {
    question: "Is the course beginner-friendly?",
    answer:
      "It assumes a baseline understanding of finance, but no prior VC experience is required. If you're comfortable with core financial concepts and genuinely curious about startups and investing, you're ready for DealSchool.",
  },
  {
    question: "Can I add this project to my resume?",
    answer:
      "Yes. The investment memo and sector thesis you build are real, original work presented to actual VCs, making them legitimate additions to your resume or portfolio, along with your DealSchool Fellowship Certificate.",
  },
];

export const FAQPage: React.FC<FAQPageProps> = ({ onApplyClick, onChangePage }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    document.title = "FAQ | DealSchool";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleIndex = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="py-12 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
      {/* Header Section */}
      <div className="border-b border-[#111111]/10 pb-10 mb-12 space-y-6">
        <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.12em] uppercase block">
          FREQUENTLY ASKED QUESTIONS
        </span>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-brand-text">
          Questions, <span className="font-serif italic font-medium text-brand-accent">answered.</span>
        </h1>

        <p className="font-serif text-base sm:text-lg text-brand-secondary leading-relaxed max-w-3xl">
          Everything you need to know before applying to the DealSchool Fellowship. Can&apos;t find what you&apos;re looking for? Reach out on our Contact page.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={item.question}
              className={`border rounded-sm bg-brand-bg transition-colors ${
                isOpen ? "border-brand-accent/40 shadow-xs" : "border-brand-secondary/15"
              }`}
            >
              <button
                onClick={() => toggleIndex(idx)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-5 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-4 w-4 text-brand-accent mt-1 flex-shrink-0" />
                  <span className="font-serif text-base sm:text-lg font-bold text-brand-text">
                    {item.question}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-brand-secondary flex-shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-brand-accent" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed px-5 sm:px-6 pl-12 sm:pl-14 pb-5 sm:pb-6 max-w-3xl">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation CTA */}
      <div className="mt-16 pt-8 border-t border-brand-secondary/15 flex flex-col sm:flex-row items-center justify-between gap-4">
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
