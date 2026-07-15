/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  StaircaseIllustration,
  CertificateKeyIllustration,
  MarketAnalysisIllustration,
  CollaborationIllustration,
  CirclePersonIllustration,
} from "./components/SVGIllustrations";
import { ApplyModal } from "./components/ApplyModal";
import { BrochureModal } from "./components/BrochureModal";
import { HeaderNavbar } from "./components/HeaderNavbar";
import { FooterPanel } from "./components/FooterPanel";
import { PaymentCallback } from "./components/PaymentCallback";
import { TermsAndConditionsPage } from "./components/TermsAndConditionsPage";
import { PrivacyPolicyPage } from "./components/PrivacyPolicyPage";
import { RefundCancellationPage } from "./components/RefundCancellationPage";
import { FAQPage } from "./components/FAQPage";
import { CustomSelect } from "./components/CustomSelect";
import { API_URL } from "@shared/config";
import tusshaarImg from "./assets/Tusshaar.jpg.jpeg";
import rishabhImg from "./assets/Rishabh.png";
import {
  Compass, 
  Search, 
  BarChart4, 
  UserCheck, 
  FolderPlus, 
  Globe, 
  ChevronRight, 
  Bookmark, 
  Target, 
  FileSpreadsheet, 
  Users2, 
  Megaphone,
  Briefcase,
  Play,
  ArrowRight,
  TrendingUp,
  Sparkles,
  MapPin,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ExternalLink,
  Award,
  HelpCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

type AppPage = "home" | "about" | "program" | "team" | "contact" | "faq" | "terms-and-conditions" | "privacy-policy" | "refund-and-cancellation";

const FoundingTeamSection: React.FC<{ className?: string }> = ({ className = "" }) => {
  const founders = [
    {
      img: tusshaarImg,
      name: "Tusshaar Chawla",
      role: "Head of Growth & Strategy",
      bio: "Tusshaar has experience across Venture Capital & Investment Banking. His work includes startup screening, investment research, due diligence, pitch decks, stakeholder communication, and founder engagement. He is part of the core team at Middha Ventures, contributing to Venture Strategy & Ecosystem initiatives and the development of DealSchool.",
      linkedin: "https://www.linkedin.com/in/tusshaarchawla/",
    },
    {
      img: rishabhImg,
      name: "Rishabh Agrawal",
      role: "Head of Strategy & Operations",
      bio: "Rishabh's experience spans venture capital, investment banking, capital markets, and startup ecosystems, with hands-on exposure to startup evaluation, fundraising, and investment research. He leads the fellowship's strategy and operations, overseeing program development, partnerships, and execution.",
      linkedin: "https://www.linkedin.com/in/rishabh-agrawal11/",
    },
  ];

  return (
    <section 
      id="founding-team" 
      className={`relative overflow-hidden py-20 lg:py-28 border-b border-brand-secondary/10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-accent/[0.035] via-[#FAFAF8] to-[#F5F0E6] ${className}`}
    >
      {/* Subtle background ambient lighting & structural grid lines */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-brand-accent/[0.04] rounded-full blur-3xl select-none" />
        <div className="max-w-7xl mx-auto h-full border-x border-brand-secondary/[0.04] hidden md:block" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-brand-secondary/10">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-text tracking-tight">
            Founding Team
          </h2>

          
        </div>

        {/* Founder Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-12 items-stretch">
          {founders.map((person) => (
            <div
              key={person.name}
              className="group relative bg-[#FAFAF8] border border-brand-secondary/15 rounded-sm overflow-hidden shadow-2xs hover:shadow-xl hover:border-brand-accent/40 transition-all duration-300 hover:-translate-y-1 flex flex-col sm:flex-row h-full"
            >
              {/* Subtle top card accent bar on hover */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-accent/0 via-brand-accent/60 to-brand-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

              {/* Portrait Container — Square Crop with Studio Framing */}
              <div className="w-full sm:w-5/12 lg:w-4/12 xl:w-5/12 aspect-square flex-shrink-0 bg-[#EFECE6] relative overflow-hidden border-b sm:border-b-0 sm:border-r border-brand-secondary/10">
                <img
                  src={person.img}
                  alt={person.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                
                {/* Soft inner shadow & frame outline */}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
              </div>

              {/* Content Panel */}
              <div className="w-full sm:w-7/12 lg:w-8/12 xl:w-7/12 p-6 sm:p-7 lg:p-8 flex flex-col justify-between flex-grow bg-brand-bg/50">
                <div className="space-y-4">
                  
                  {/* Header info */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-[10px] text-brand-accent font-bold uppercase tracking-widest block">
                        {person.role}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl lg:text-[26px] font-bold text-brand-text tracking-tight group-hover:text-brand-secondary transition-colors">
                      {person.name}
                    </h3>
                  </div>

                  {/* Divider */}
                  <div className="w-12 h-px bg-brand-accent/40" />

                  {/* Biography - Constrained reading width ~60-70 chars per line */}
                  <p className="font-sans text-xs sm:text-sm text-[#4A4E53] leading-relaxed max-w-[62ch]">
                    {person.bio}
                  </p>
                </div>

                {/* Footer Action - LinkedIn Link */}
                <div className="pt-6 mt-6 border-t border-brand-secondary/10 flex items-center justify-between">
                  <a
                    href={person.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 font-mono text-xs font-bold text-brand-secondary hover:text-brand-accent uppercase tracking-wider transition-colors duration-200 group/link"
                  >
                    <svg className="h-4 w-4 fill-current text-brand-secondary group-hover/link:text-brand-accent transition-colors" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>LinkedIn Profile</span>
                    <ExternalLink className="h-3 w-3 opacity-60 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 transition-all" />
                  </a>

                  <span className="hidden sm:inline-block font-mono text-[10px] text-brand-neutral/60 tracking-wider">
                    DEALSCHOOL
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Closing Section Description Paragraph */}
        <div className="mt-12 lg:mt-16 text-center max-w-2xl mx-auto">
          <p className="font-serif text-sm sm:text-base text-brand-neutral leading-relaxed">
            DealSchool is developed and led by active investors, operators, and venture strategists from the Middha Ventures ecosystem.
          </p>
        </div>

      </div>
    </section>
  );
};

const PAGE_PATHS: Record<string, AppPage> = {
  "/": "home",
  "/about": "about",
  "/program": "program",
  "/team": "team",
  "/contact": "contact",
  "/faq": "faq",
  "/terms-and-conditions": "terms-and-conditions",
  "/privacy-policy": "privacy-policy",
  "/refund-and-cancellation": "refund-and-cancellation",
};

const PATH_FROM_PAGE: Record<AppPage, string> = {
  home: "/",
  about: "/about",
  program: "/program",
  team: "/team",
  contact: "/contact",
  faq: "/faq",
  "terms-and-conditions": "/terms-and-conditions",
  "privacy-policy": "/privacy-policy",
  "refund-and-cancellation": "/refund-and-cancellation",
};

function pageFromPathname(pathname: string): AppPage {
  return PAGE_PATHS[pathname] ?? "home";
}

export default function App() {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isBrochureModalOpen, setIsBrochureModalOpen] = useState(false);
  const [activePage, setActivePage] = useState<AppPage>(
    pageFromPathname(window.location.pathname)
  );
  // Payment gateway callback — detected from URL query params on mount
  const [paymentCallbackParams, setPaymentCallbackParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("razorpay_payment_link_id")) {
      setPaymentCallbackParams(params);
      // Remove query params from URL so the user doesn't see them on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Section 7: Memo Process page state (used on About Page or Program Page)
  const [activeMemoPage, setActiveMemoPage] = useState(0);

  // Stateful contact form
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "Application Inquiry",
    message: ""
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleApplyClick = () => {
    setIsApplyModalOpen(true);
  };

  const handleBrochureClick = () => {
    setIsBrochureModalOpen(true);
  };

  useEffect(() => {
    const onPopState = () => {
      setActivePage(pageFromPathname(window.location.pathname));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handlePageChange = (pageId: AppPage) => {
    setActivePage(pageId);
    window.history.pushState({}, "", PATH_FROM_PAGE[pageId]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError(null);

    try {
      const res = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          subject: contactForm.subject,
          message: contactForm.message,
        }),
      });

      if (res.status === 409) {
        setContactError("A message from this email was already submitted recently. Please wait before submitting again.");
        return;
      }
      if (res.status === 429) {
        setContactError("Too many requests from your connection. Please wait a few minutes and try again.");
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
        throw new Error(err.error || `Server error (${res.status})`);
      }

      setContactSubmitted(true);
      setContactForm({ name: "", email: "", subject: "Application Inquiry", message: "" });
    } catch (error: any) {
      console.error("Contact submission error:", error.message);
      setContactError(error.message || "Submission failed. Please try again.");
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-accent selection:text-brand-dark-blue relative overflow-x-clip bg-[#FCFAF6] text-[#111111]">
      
      {/* Decorative Background Textures - Artistic Flair Branding Watermark */}
      <div className="fixed bottom-12 left-12 pointer-events-none opacity-[0.025] select-none -z-10 hidden xl:block">
        <h2 className="text-[180px] font-serif font-black italic -mb-[50px] leading-none text-brand-text">Insight</h2>
        <h2 className="text-[180px] font-serif font-black italic leading-none text-brand-text">Conviction</h2>
      </div>

      {/* Premium Top Navigation */}
      <HeaderNavbar onApplyClick={handleApplyClick} activePage={activePage} onChangePage={handlePageChange} />

      {/* RENDER PAGES DYNAMICALLY USING SMOOTH TRANSITIONS */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* ----------------- PAGE 1: HOMEPAGE ----------------- */}
            {activePage === "home" && (
              <>
                {/* HERO SECTION */}
                <section className="relative overflow-hidden pt-12 pb-16 md:py-24 border-b border-[#111111]/10">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-accent/[0.03] via-transparent to-transparent pointer-events-none" />

                  {/* Illustration — right side background, behind text */}
                  <div className="hidden lg:flex absolute right-0 top-0 bottom-0 w-[50%] items-center pr-8 pointer-events-none select-none opacity-85">
                    <StaircaseIllustration />
                  </div>

                  <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                    <div className="max-w-2xl space-y-6">
                      <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.12em] uppercase block mb-1">
                        An Initiative by Middha Ventures
                      </span>

                      <h1 className="font-sans not-italic font-bold text-5xl sm:text-6xl md:text-[68px] leading-[0.95] md:leading-[0.9] text-brand-text tracking-tight mb-8">
                        Built for those who want a <span className="text-brand-accent">seat at the table</span>,{" "}
                        <span className="block font-sans not-italic font-bold text-brand-text mt-3 md:mt-4">
                          not a seat in the classroom.
                        </span>
                      </h1>

                      <p className="font-serif text-base md:text-lg text-brand-neutral leading-relaxed max-w-xl opacity-90">
                        DealSchool is a 10-week, cohort-based VC fellowship. You won&apos;t be taught about startups. You&apos;ll screen them, sit inside pitch calls, run due diligence, talk directly to founders, and make actual investment calls. Not slides. Not theory. The real thing.
                      </p>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-6">
                        <button
                          onClick={handleApplyClick}
                          className="bg-brand-secondary text-brand-bg px-8 py-4 font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-secondary/25 hover:bg-brand-dark-blue transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                        >
                          Apply for the Next Cohort <ArrowRight className="h-4 w-4 text-brand-accent" />
                        </button>
                        <button
                          onClick={() => handlePageChange("program")}
                          className="border border-brand-secondary/35 px-8 py-4 font-mono font-bold text-xs uppercase tracking-wider text-brand-secondary hover:bg-brand-secondary hover:text-brand-bg transition-colors duration-300 text-center cursor-pointer"
                        >
                          See the Program
                        </button>
                      </div>
                    </div>

                    {/* Mobile illustration */}
                    <div className="lg:hidden mt-10">
                      <StaircaseIllustration />
                    </div>
                  </div>
                </section>

                {/* STATISTICS SECTION */}
                <section className="py-16 bg-brand-secondary/5 border-b border-brand-secondary/10">
                  <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                      <div className="p-6 space-y-2 border border-brand-secondary/10 bg-brand-bg rounded-sm shadow-sm">
                        <div className="font-serif text-5xl md:text-6xl font-black text-brand-accent">20</div>
                        <div className="font-sans font-bold text-sm text-brand-text uppercase tracking-wider">Fellows per cohort</div>
                        <p className="font-serif text-xs text-brand-neutral max-w-xs mx-auto">
                          Small enough that you get face time, not front-row seats.
                        </p>
                      </div>

                      <div className="p-6 space-y-1 border border-brand-secondary/10 bg-brand-bg rounded-sm shadow-sm">
  <div className="font-serif text-5xl md:text-6xl font-black text-brand-accent">
    ₹18K<span className="align-super text-xl md:text-2xl">*</span>
  </div>

  <div className="font-sans font-bold text-sm text-brand-text uppercase tracking-wider">
    Pricing
  </div>

  <p className="font-serif text-xs text-brand-neutral max-w-xs mx-auto">
    One price. Ten weeks. Zero fluff.
  </p>

  <p className="font-sans text-[11px] text-brand-accent tracking-wide">
    *Exclusive of GST
  </p>
</div>

                      <div className="p-6 space-y-2 border border-brand-secondary/10 bg-brand-bg rounded-sm shadow-sm">
                        <div className="font-serif text-5xl md:text-6xl font-black text-brand-accent">10 Weeks</div>
                        <div className="font-sans font-bold text-sm text-brand-text uppercase tracking-wider">Weekend Sessions</div>
                        <p className="font-serif text-xs text-brand-neutral max-w-xs mx-auto">
                          Fits around your college. Fits around your job.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* WHAT THIS IS NOT SECTION */}
                <section className="py-20 border-b border-brand-secondary/10 bg-[#FAF7F0]">
                  <div className="max-w-4xl mx-auto px-4 md:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                      <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-text tracking-tight">
                        What This Is Not
                      </h2>
                      <p className="font-serif italic text-sm text-brand-neutral mt-2">
                        Venture capital cannot be mastered through standard decks or recorded coursework.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        "Another CFA prep class dressed up as startup education",
                        "A 3-hour YouTube masterclass you'll never finish",
                        "A placement guarantee wrapped in a certificate",
                        "Taught by people who've never written a cheque",
                        "A lecture series about what VCs do. You'll be doing it."
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-5 bg-brand-bg border border-brand-secondary/10 rounded-sm shadow-xs hover:border-brand-accent/40 transition-all">
                          <XCircle className="h-5 w-5 text-brand-accent mt-0.5 flex-shrink-0" />
                          <p className="font-sans text-sm md:text-base text-brand-secondary font-medium">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="text-center mt-12 bg-brand-secondary text-brand-bg rounded-sm p-8 border border-brand-accent/20">
                      <p className="font-serif italic text-lg md:text-xl font-bold">
                        &ldquo;It&apos;s a fellowship. With real investors. Real startups. Real decisions.&rdquo;
                      </p>
                    </div>
                  </div>
                </section>
 {/* SOCIAL PROOF (TESTIMONIALS) */}
                <section className="py-20 border-b border-[#111111]/10 bg-brand-bg/50">
                  <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                      <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.12em] uppercase block mb-2">
                        Fellow Testimonials
                      </span>
                      <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-text tracking-tight">
                        Tested in the Field
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                      {/* Testimonial 1 */}
                      <div className="bg-brand-bg border border-brand-secondary/15 rounded-sm p-8 md:p-10 shadow-sm relative space-y-6 flex flex-col justify-between">
                        <span className="absolute top-4 right-6 text-7xl font-serif text-brand-accent/10 pointer-events-none select-none font-bold">&ldquo;</span>
                        <div className="space-y-4 font-serif italic text-sm md:text-base text-brand-secondary leading-relaxed relative z-10 flex-grow">
                          <p>
                            &ldquo;My experience at DealSchool was a valuable introduction to the venture capital and startup ecosystem. I had the opportunity to engage with founders across a wide range of sectors and gain firsthand exposure to early-stage entrepreneurship. What I appreciated most was observing how investors evaluate opportunities, identify emerging trends, and support founders during the early stages of company building. The fellowship also connected me with a network of founders, operators, and investors, broadening my perspective on the startup ecosystem and strengthening my interest in venture investing. I am grateful to the DealSchool team for the mentorship, exposure, and learning opportunities they provided.&rdquo;
                          </p>
                        </div>
                        <div className="border-t border-brand-secondary/10 pt-4 font-sans text-[11px] font-bold text-brand-accent uppercase tracking-widest mt-auto">
                          &mdash; Anika Mathur
                        </div>
                      </div>

                      {/* Testimonial 2 */}
                      <div className="bg-brand-bg border border-brand-secondary/15 rounded-sm p-8 md:p-10 shadow-sm relative space-y-6 flex flex-col justify-between">
                        <span className="absolute top-4 right-6 text-7xl font-serif text-brand-accent/10 pointer-events-none select-none font-bold">&ldquo;</span>
                        <div className="space-y-4 font-serif italic text-sm md:text-base text-brand-secondary leading-relaxed relative z-10 flex-grow">
                          <p>
                            &ldquo;My time at DealSchool was an incredible crash course in the startup world. I got to dive into the stories of 100+ early-stage founders, using qualitative data to understand their vision and figure out where they fit best. The highlight was teaming up with the other interns to run an online Pitch Day and it was incredibly rewarding to see one of the startups we shortlisted go on to secure funding from the board. This fellowship wasn&apos;t just about analyzing data, it taught me how to spot real potential and gave me a genuine look into how VC works.&rdquo;
                          </p>
                        </div>
                        <div className="border-t border-brand-secondary/10 pt-4 font-sans text-[11px] font-bold text-brand-accent uppercase tracking-widest mt-auto">
                          &mdash; Lakshit Jangid
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* IDEAL PARTICIPANT SECTION */}
                <section className="py-20 border-b border-brand-secondary/10">
                  <div className="max-w-4xl mx-auto px-4 md:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                      <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-text tracking-tight">
                        Ideal Participants
                      </h2>
                      <p className="font-serif italic text-sm text-brand-neutral mt-2">
                        DealSchool is built specifically for:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        "Students trying to break into venture capital",
                        "MBA, Finance, CA, CFA and Economics students",
                        "Professionals transitioning toward VC",
                        "Startup founders wanting to understand investors",
                        "Founder’s Office aspirants"
                      ].map((desc, idx) => (
                        <div key={idx} className="bg-brand-bg p-5 border border-brand-secondary/10 rounded-sm hover:shadow-xs transition-all flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-brand-accent flex-shrink-0" />
                          <span className="font-sans text-sm font-medium text-brand-secondary">
                            {desc}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-center mt-10">
                      <p className="font-serif italic text-sm text-brand-neutral">
                        If any of these sound like you, you belong here.
                      </p>
                    </div>
                  </div>
                </section>

                {/* HOW IT WORKS SECTION */}
                <section className="py-20 bg-[#FAF7F0] border-b border-brand-secondary/10">
                  <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                      <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.12em] uppercase block mb-2">
                        Methodology
                      </span>
                      <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#111111]">
                        How It Works
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-brand-bg border border-brand-secondary/10 p-6 rounded-sm space-y-4">
                        <div className="font-mono text-xs font-bold text-brand-accent block">STEP 01</div>
                        <h4 className="font-serif text-base font-bold text-brand-text">Apply</h4>
                        <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                          Short application. We screen for curiosity, not credentials. 20 seats per cohort.
                        </p>
                      </div>

                      <div className="bg-brand-bg border border-brand-secondary/10 p-6 rounded-sm space-y-4">
                        <div className="font-mono text-xs font-bold text-brand-accent block">STEP 02</div>
                        <h4 className="font-serif text-base font-bold text-brand-text">Get Access</h4>
                        <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                          Weekend sessions over 10 weeks. Structured around your schedule. Fits college & work.
                        </p>
                      </div>

                      <div className="bg-brand-bg border border-brand-secondary/10 p-6 rounded-sm space-y-4">
                        <div className="font-mono text-xs font-bold text-brand-accent block">STEP 03</div>
                        <h4 className="font-serif text-base font-bold text-brand-text">Do The Work</h4>
                        <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                          Sit in real pitch calls, shadow due diligence, talk to founders, build investment theses, and debate mentors.
                        </p>
                      </div>

                      <div className="bg-brand-bg border border-brand-secondary/10 p-6 rounded-sm space-y-4">
                        <div className="font-mono text-xs font-bold text-brand-accent block">STEP 04</div>
                        <h4 className="font-serif text-base font-bold text-brand-text">Take Your Seat</h4>
                        <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                          Graduate with a comprehensive investment thesis, DealSchool certificate, and real venture capital experience.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* MIDDHA VENTURES FAMILY OFFICE SECTION */}
                <section className="py-24 border-b border-brand-secondary/10">
                  <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="max-w-[750px] text-left">
                      <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.12em] uppercase block mb-4">
                        An Initiative by Middha Ventures
                      </span>
                      <p className="font-serif text-lg md:text-xl text-brand-secondary leading-relaxed">
                        DealSchool is built within the <span className="font-bold text-brand-text">Middha Ventures</span> ecosystem, drawing practical insights from active participation in portfolio companies including <span className="text-brand-accent font-serif font-bold italic">Sochu</span>, <span className="text-brand-accent font-serif font-bold italic">Fitreak</span>, and <span className="text-brand-accent font-serif font-bold italic">Ruskle</span>. The platform reflects real-world experience in screening, evaluating, and supporting early-stage ventures.
                      </p>
                    </div>
                  </div>
                </section>

                {/* FINAL CTA SECTION */}
                <section className="py-24 bg-brand-dark-blue text-brand-bg relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 bg-brand-accent/10 rounded-full filter blur-3xl select-none pointer-events-none"></div>

                  <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-8">
                    <div className="flex justify-center">
                      <div className="h-4 w-4 bg-brand-accent rounded-full animate-orb-glow" />
                    </div>

                    <div className="space-y-4">
                      <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.14em] uppercase block">
                        Cohort seats fill fast. We cap it at 20.
                      </span>
                      <h2 className="font-serif text-4xl sm:text-5xl md:text-[54px] font-black tracking-tight leading-[1.05] text-white">
                        Applications for Cohort 1 <br />are now open.
                      </h2>
                      <p className="font-serif text-sm sm:text-base text-brand-bg/70 max-w-lg mx-auto leading-relaxed">
                        If you&apos;ve been waiting for the right moment to step into venture capital, this is it.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button
                        onClick={handleApplyClick}
                        className="px-10 py-5 bg-brand-accent hover:bg-[#B24122] text-white font-mono text-xs font-bold tracking-widest uppercase rounded-sm transition-all shadow-md inline-flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 z-20 cursor-pointer"
                      >
                        Apply Now <Sparkles className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={() => handlePageChange("program")}
                        className="px-10 py-5 bg-transparent hover:bg-brand-bg/5 text-white border border-white/20 font-mono text-xs font-bold tracking-widest uppercase rounded-sm transition-all inline-flex items-center justify-center cursor-pointer"
                      >
                        See the Program
                      </button>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* ----------------- PAGE 2: ABOUT PAGE ----------------- */}
            {activePage === "about" && (
              <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8 space-y-16">
                
                {/* Intro block */}
                <div className="max-w-3xl space-y-6">
                  <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.12em] uppercase block">
                    Why We Built DealSchool
                  </span>
                  
                  <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-brand-text">
                    Bridging the Exposure Gap in <span className="text-brand-accent font-serif italic font-medium">Venture Capital.</span>
                  </h1>

                  <p className="font-serif text-base md:text-lg text-brand-secondary leading-relaxed">
                    The Indian VC ecosystem is growing rapidly. Most finance graduates have little exposure to how venture capital actually works in practice.
                  </p>
                </div>

                {/* Comparative Matrix Section */}
                <section className="py-8">
                  <div className="mb-6">
                    <span className="font-mono text-[10px] text-brand-accent font-bold tracking-widest uppercase block mb-1">
                      CURRICULUM BENCHMARKS
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-brand-text mb-4">How We Compare</h3>
                  </div>

                  <div className="max-w-[800px] text-left">
                    <p className="font-serif text-base md:text-lg leading-relaxed text-brand-secondary">
                      While traditional programs such as the <span className="font-bold text-brand-text">CFA®</span> focus on public markets and portfolio management, and <span className="font-bold text-brand-text">MBA Finance</span> programs emphasize corporate finance and business administration, <span className="text-brand-accent font-bold">DealSchool</span> is designed around the realities of early-stage investing. The curriculum focuses on founder evaluation, technical diligence, venture economics, and live deal execution—providing practical exposure to how venture capital decisions are made.
                    </p>
                  </div>
                </section>

                {/* Core Insight Split Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAF7F0] p-8 rounded-sm border border-brand-secondary/10">
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-brand-text">The Core Insight</h3>
                    <p className="font-serif text-sm leading-relaxed text-brand-neutral">
                      Anyone can study standard valuation models, read startup case studies, and watch static analysis webinars. But very few ever see real pitch calls, actual startup evaluations, term sheets, or general partner investment committee sessions. DealSchool provides that exact operational exposure.
                    </p>
                  </div>
                  <div className="lg:col-span-5">
                    <CertificateKeyIllustration />
                  </div>
                </div>

                {/* Philosophy Pillars */}
                <div className="space-y-10">
                  <div className="text-center max-w-xl mx-auto">
                    <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.12em] uppercase block mb-1">
                      Sovereign Principles
                    </span>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-text">Our Philosophy</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3 bg-brand-bg border border-brand-secondary/10 p-6 rounded-sm">
                      <div className="font-mono text-xs text-brand-accent font-bold">01 / EXPOSURE OVER EXPLANATION</div>
                      <p className="font-serif text-xs text-brand-neutral leading-relaxed">
                        The best way to understand venture capital is to be inside it. The discomfort of evaluating real, raw, messy startup pipelines with ambiguous data is the actual curriculum.
                      </p>
                    </div>

                    <div className="space-y-3 bg-brand-bg border border-brand-secondary/10 p-6 rounded-sm">
                      <div className="font-mono text-xs text-brand-accent font-bold">02 / SMALL ROOMS, REAL ACCESS</div>
                      <p className="font-serif text-xs text-brand-neutral leading-relaxed">
                        Each cohort is strictly capped at 20 fellows. High-quality professional development doesn&apos;t happen in 500-person webinars. Learning occurs through real conversation and participation.
                      </p>
                    </div>

                    <div className="space-y-3 bg-brand-bg border border-brand-secondary/10 p-6 rounded-sm">
                      <div className="font-mono text-xs text-brand-accent font-bold">03 / BUILT BY PRACTITIONERS</div>
                      <p className="font-serif text-xs text-brand-neutral leading-relaxed">
                        Say goodbye to purely academic lecturers. DealSchool is developed and delivered by active venture capitalists, founders, and operating general partners from the Middha Ventures ecosystem.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Call to action */}
                <div className="bg-brand-secondary text-brand-bg p-8 md:p-12 text-center rounded-sm border border-brand-accent/20">
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-2">Claim Your Seat At The Table</h3>
                  <p className="font-serif italic text-xs md:text-sm text-brand-bg opacity-80 max-w-md mx-auto mb-6">
                    Join an elite cohort of mathematical founders, CA finalists, and technology-driven analysts.
                  </p>
                  <button
                    onClick={handleApplyClick}
                    className="px-8 py-4 bg-brand-accent text-white font-mono text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-[#B24122] transition-all cursor-pointer"
                  >
                    Apply for Next Cohort
                  </button>
                </div>

              </div>
            )}

            {/* ----------------- PAGE 3: PROGRAM PAGE ----------------- */}
            {activePage === "program" && (
              <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8 space-y-16">
                
                {/* Intro block */}
                <div className="max-w-3xl space-y-4">
                  <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.12em] uppercase block">
                    Curriculum Map & Frameworks
                  </span>
                  
                  <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-brand-text">
                    10 weeks. One complete view of <span className="font-serif italic font-medium text-brand-accent">how a VC thinks.</span>
                  </h1>

                  <p className="font-serif text-base md:text-lg text-brand-secondary leading-relaxed">
                    The fellowship follows the exact process used by actual venture funds. Participants move sequentially through the investment lifecycle rather than studying it academically.
                  </p>
                </div>

                {/* Sequential Phase Syllabus Grid */}
                <section className="space-y-6">
                  <h3 className="font-serif text-xl font-bold text-brand-text border-b border-brand-secondary/10 pb-2">The Four Phases</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Phase 1 */}
                    <div className="bg-brand-bg border border-brand-secondary/15 rounded-sm p-6 space-y-3 hover:shadow-xs relative">
                      <div className="absolute top-4 right-6 font-mono text-brand-accent/20 text-4xl font-extrabold select-none">01</div>
                      <span className="font-mono text-[10px] text-brand-accent font-semibold block uppercase">WEEKS 1 - 2</span>
                      <h4 className="font-serif text-base font-bold text-brand-text">Phase 1 — The Ecosystem</h4>
                      <p className="font-serif text-xs text-brand-neutral leading-relaxed">
                        Build the map before evaluating deals. Understand startups, markets, and macroeconomic venture ecosystems inside robust frameworks.
                      </p>
                    </div>

                    {/* Phase 2 */}
                    <div className="bg-brand-bg border border-brand-secondary/15 rounded-sm p-6 space-y-3 hover:shadow-xs relative">
                      <div className="absolute top-4 right-6 font-mono text-brand-accent/20 text-4xl font-extrabold select-none">02</div>
                      <span className="font-mono text-[10px] text-brand-accent font-semibold block uppercase">WEEKS 3 - 4</span>
                      <h4 className="font-serif text-base font-bold text-brand-text">Phase 2 — Screening & Evaluation</h4>
                      <p className="font-serif text-xs text-brand-neutral leading-relaxed">
                        Shadow real pitch calls. Develop rigorous qualitative screening instincts. Learn exactly how professional investors evaluate opportunities in under 20 minutes.
                      </p>
                    </div>

                    {/* Phase 3 */}
                    <div className="bg-brand-bg border border-brand-secondary/15 rounded-sm p-6 space-y-3 hover:shadow-xs relative">
                      <div className="absolute top-4 right-6 font-mono text-brand-accent/20 text-4xl font-extrabold select-none">03</div>
                      <span className="font-mono text-[10px] text-brand-accent font-semibold block uppercase">WEEKS 5 - 6</span>
                      <h4 className="font-serif text-base font-bold text-brand-text">Phase 3 — The Founder Side</h4>
                      <p className="font-serif text-xs text-brand-neutral leading-relaxed">
                        Understand founders deeply. Shift from evaluating standard slide decks to assessing raw human capabilities, executive limits, and conviction drivers.
                      </p>
                    </div>

                    {/* Phase 4 */}
                    <div className="bg-brand-bg border border-brand-secondary/15 rounded-sm p-6 space-y-3 hover:shadow-xs relative">
                      <div className="absolute top-4 right-6 font-mono text-brand-accent/20 text-4xl font-extrabold select-none">04</div>
                      <span className="font-mono text-[10px] text-brand-accent font-semibold block uppercase">WEEKS 7 - 10</span>
                      <h4 className="font-serif text-base font-bold text-brand-text">Phase 4 — Due Diligence & Deal Mechanics</h4>
                      <p className="font-serif text-xs text-brand-neutral leading-relaxed">
                        The critical work between the pitch and the investment. Deep dive into raw financial data rooms, custom reference calls, Cap Table dilution, and term sheet mechanics.
                      </p>
                    </div>

                  </div>

                  {/* Week 10 Specific Box */}
                  <div className="bg-brand-secondary text-brand-bg rounded-sm p-6 md:p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 border border-brand-accent/15">
                    <div className="space-y-2 max-w-xl">
                      <span className="font-mono text-xs text-brand-accent font-bold tracking-widest block uppercase">WEEK 10 SPECIAL</span>
                      <h4 className="font-serif text-lg font-bold text-white">Week 10 — Something You Must Experience Yourself</h4>
                      <p className="font-serif text-xs text-brand-bg opacity-85 leading-relaxed">
                        A secretive, immersive concluding weekend. Details of syllabus graduation exercises, live boardroom defensibility scenarios, and network operations are strictly available inside our program brochure.
                      </p>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={handleBrochureClick}
                        className="px-6 py-3.5 bg-brand-accent text-white font-mono text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-[#B24122] transition-all cursor-pointer whitespace-nowrap"
                      >
                        Request Program Brochure
                      </button>
                    </div>
                  </div>
                </section>





              </div>
            )}

            {activePage === "team" && (
              <div className="min-h-screen">

                {/* Hero Banner with refined transition */}
                <div className="bg-brand-secondary border-b border-brand-accent/20 py-16 md:py-24 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-accent/[0.08] via-transparent to-transparent pointer-events-none" />
                  <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                    <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.12em] uppercase block mb-4">
                      Advisors & General Partners
                    </span>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#FAFAF8]">
                      The people inside <span className="font-serif italic font-medium text-brand-accent">the room.</span>
                    </h1>
                    <p className="font-sans text-sm md:text-base text-[#FAFAF8]/70 leading-relaxed max-w-lg mt-4">
                      DealSchool is run by active investors, founders, and operating partners who are still practicing what they teach.
                    </p>
                  </div>

                  {/* Transitional accent line at bottom of hero banner */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-accent/60 to-transparent pointer-events-none" />
                </div>

                {/* Founding Team Section */}
                <FoundingTeamSection />

              </div>
            )}


            {/* ----------------- PAGE 5: CONTACT PAGE ----------------- */}
            {activePage === "contact" && (
              <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  
                  {/* Left Column (Details & Info) */}
                  <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-4">
                      <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.12em] uppercase block">
                        Direct Inquiry Portal
                      </span>
                      
                      <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-brand-text">
                        Got questions? <br />
                        We&apos;re <span className="font-serif italic text-brand-accent font-medium">easy to reach.</span>
                      </h1>

                      <p className="font-serif text-sm md:text-base text-brand-neutral leading-relaxed">
                        Applications, mentor collaborations, or simply understanding whether DealSchool is the right fit.
                      </p>
                    </div>

                    {/* Operational Details Docket card */}
                    <div className="bg-brand-bg border border-brand-secondary/15 rounded-sm p-6 shadow-xs space-y-4">
                      <div className="font-mono text-[9px] text-brand-accent font-bold tracking-widest block uppercase border-b border-brand-secondary/5 pb-1">
                        DOCKET NO: DS-CONTACT-HQ
                      </div>

                      <div className="space-y-3 font-sans text-xs">
                        <div className="flex items-start gap-3">
                          <Mail className="h-4 w-4 text-brand-accent mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="block text-brand-neutral uppercase font-mono text-[8px] tracking-wider">EMAIL ADMISSIONS DESK</span>
                            <a href="mailto:support@dealschool.in" className="font-bold text-brand-text underline hover:text-brand-accent transition-colors">
                              support@dealschool.in
                            </a>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-brand-accent mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="block text-brand-neutral uppercase font-mono text-[8px] tracking-wider">ADDRESS</span>
                            <span className="font-bold text-brand-text">Navi Mumbai, Maharashtra, India</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Globe className="h-4 w-4 text-brand-accent mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="block text-brand-neutral uppercase font-mono text-[8px] tracking-wider">PROGRAM STRUCTURE</span>
                            <span className="font-bold text-brand-text">Online-First</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (The Actual Stateful Inquiry Form) */}
                  <div className="lg:col-span-7 bg-brand-bg border border-brand-secondary/15 rounded-sm p-6 md:p-8 shadow-sm">
                    <span className="font-mono text-[9px] text-brand-accent font-bold tracking-widest uppercase block mb-2">
                      TRANSACTION FORM
                    </span>
                    <h3 className="font-serif text-xl font-bold text-brand-text mb-4">Submit Your Inquiry</h3>

                    <AnimatePresence mode="wait">
                      {!contactSubmitted ? (
                        <motion.form
                          key="form"
                          onSubmit={handleContactSubmit}
                          className="space-y-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {/* Name & Email row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="block font-mono text-[9px] text-brand-secondary uppercase font-bold tracking-wider">
                                Full Name <span className="text-brand-accent">*</span>
                              </label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral/50 pointer-events-none" />
                                <input
                                  type="text"
                                  required
                                  maxLength={100}
                                  value={contactForm.name}
                                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                  placeholder="Your full name"
                                  className="w-full bg-white text-brand-text pl-9 pr-3 py-3 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm h-11 transition-all"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="block font-mono text-[9px] text-brand-secondary uppercase font-bold tracking-wider">
                                Email Address <span className="text-brand-accent">*</span>
                              </label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral/50 pointer-events-none" />
                                <input
                                  type="email"
                                  required
                                  maxLength={254}
                                  value={contactForm.email}
                                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                  placeholder="name@domain.com"
                                  className="w-full bg-white text-brand-text pl-9 pr-3 py-3 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm h-11 transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Subject Select */}
                          <div className="space-y-1.5">
                            <label className="block font-mono text-[9px] text-brand-secondary uppercase font-bold tracking-wider">
                              Subject <span className="text-brand-accent">*</span>
                            </label>
                            <CustomSelect
                              value={contactForm.subject}
                              onChange={(value) => setContactForm({ ...contactForm, subject: value })}
                              placeholder="Select a subject"
                              className="bg-white text-brand-text px-3 py-3 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm h-11 transition-all"
                              options={[
                                { value: "Application Inquiry", label: "Application Inquiry — Cohort 1" },
                                { value: "Syllabus/Brochure Request", label: "Venture Curriculum / Brochure" },
                                { value: "Operator Collaboration", label: "Partner / Mentor Engagement" },
                                { value: "Other", label: "General Question" },
                              ]}
                            />
                          </div>

                          {/* Message Textarea */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block font-mono text-[9px] text-brand-secondary uppercase font-bold tracking-wider">
                                Your Message <span className="text-brand-accent">*</span>
                              </label>
                              <span className={`font-mono text-[9px] tabular-nums transition-colors ${(2000 - contactForm.message.length) < 200 ? "text-amber-600 font-semibold" : "text-brand-neutral/35"}`}>
                                {contactForm.message.length} / 2000
                              </span>
                            </div>
                            <textarea
                              rows={6}
                              required
                              minLength={20}
                              maxLength={2000}
                              value={contactForm.message}
                              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                              placeholder="Describe your question, background, or inquiry in detail. The more context you share, the better we can help."
                              className="w-full bg-white text-brand-text px-3 py-3 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm leading-relaxed transition-all resize-none"
                            />
                            {contactForm.message.length > 0 && contactForm.message.length < 20 && (
                              <p className="text-[10px] text-brand-neutral/60 font-sans">
                                Please write at least 20 characters.
                              </p>
                            )}
                          </div>

                          {contactError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-xs flex items-center gap-2 font-sans font-medium">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <span>{contactError}</span>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={contactSubmitting}
                            className="w-full py-4 bg-brand-secondary hover:bg-brand-dark-blue text-brand-bg font-mono text-xs font-bold tracking-widest uppercase rounded-sm transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {contactSubmitting ? (
                              <span>Routing Message Pipeline...</span>
                            ) : (
                              <>
                                Submit Secure Query <ArrowRight className="h-4 w-4 text-brand-accent" />
                              </>
                            )}
                          </button>
                        </motion.form>
                      ) : (
                        <motion.div
                          key="success"
                          className="py-10 text-center space-y-4"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="mx-auto h-12 w-12 bg-brand-accent/10 border border-brand-accent rounded-full flex items-center justify-center text-brand-accent">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-serif text-lg font-bold text-brand-text">Message routed successfully</h4>
                            <p className="font-serif italic text-xs text-brand-neutral">
                              Our DealSchool admissions and operating desk has logged your ticket.
                            </p>
                          </div>
                          
                          <div className="bg-[#FAF7F0] p-4 rounded-sm border border-brand-secondary/10 max-w-sm mx-auto text-left font-sans text-xs leading-relaxed text-brand-secondary">
                            We will compile adjacent metrics and send diagnostic responses to your email within 24 to 48 hours. Thank you for your inquiry interest.
                          </div>

                          <button
                            onClick={() => { setContactSubmitted(false); setContactError(null); }}
                            className="px-6 py-2 bg-brand-secondary text-brand-bg font-mono text-[10px] font-bold uppercase rounded-sm hover:bg-brand-text transition-colors cursor-pointer"
                          >
                            Submit Another Query
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              </div>
            )}

            {activePage === "faq" && (
              <FAQPage
                onApplyClick={handleApplyClick}
                onChangePage={handlePageChange}
              />
            )}

            {activePage === "terms-and-conditions" && (
              <TermsAndConditionsPage
                onApplyClick={handleApplyClick}
                onChangePage={handlePageChange}
              />
            )}

            {activePage === "privacy-policy" && (
              <PrivacyPolicyPage
                onApplyClick={handleApplyClick}
                onChangePage={handlePageChange}
              />
            )}

            {activePage === "refund-and-cancellation" && (
              <RefundCancellationPage
                onApplyClick={handleApplyClick}
                onChangePage={handlePageChange}
              />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* GLOBAL FOOTER REFERENCES */}
      <FooterPanel onChangePage={handlePageChange} />

      {/* Payment gateway callback overlay */}
      {paymentCallbackParams && (
        <PaymentCallback
          params={paymentCallbackParams}
          onClose={() => setPaymentCallbackParams(null)}
        />
      )}

      {/* DYNAMIC APPLICATIONS OVERLAY MODAL */}
      <ApplyModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />

      {/* PROGRAM BROCHURE REQUEST MODAL */}
      <BrochureModal isOpen={isBrochureModalOpen} onClose={() => setIsBrochureModalOpen(false)} />

    </div>
  );
}
