/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { Mail, ArrowUpRight } from "lucide-react";

interface RefundCancellationPageProps {
  onApplyClick?: () => void;
  onChangePage?: (
    page:
      | "home"
      | "about"
      | "program"
      | "team"
      | "contact"
      | "terms-and-conditions"
      | "privacy-policy"
      | "refund-and-cancellation"
      | "admin-login"
      | "admin"
  ) => void;
}

export const RefundCancellationPage: React.FC<RefundCancellationPageProps> = ({
  onApplyClick,
  onChangePage,
}) => {
  useEffect(() => {
    document.title = "Refund & Cancellation Policy | DealSchool";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="py-12 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
      {/* Header Section */}
      <div className="border-b border-[#111111]/10 pb-10 mb-12 space-y-6">
        <div>
          <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.25em] uppercase block">
            REFUND &amp; CANCELLATION POLICY
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-brand-text">
          Refund &amp; <span className="font-serif italic font-medium text-brand-accent">Cancellation Policy</span>
        </h1>

        <p className="font-serif text-base sm:text-lg text-brand-secondary leading-relaxed max-w-3xl">
          Please review our refund and cancellation policies governing enrolments, cohort transfers, deferrals, and cancellation requests for the DealSchool Fellowship Programme.
        </p>
      </div>

      {/* Main Content Container */}
      <article className="prose prose-slate max-w-none space-y-10 text-[#111111]">

        {/* Section 1 */}
        <section className="space-y-4 pt-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">1</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Cancellation by the Fellow
            </h2>
          </div>
          
          <div className="pl-2 sm:pl-8 pt-2 overflow-x-auto">
            <table className="w-full text-left border-collapse border border-brand-secondary/20 text-xs sm:text-sm font-sans">
              <thead>
                <tr className="bg-brand-secondary/10 text-brand-text font-mono text-xs uppercase tracking-wider">
                  <th className="p-3 border border-brand-secondary/20 font-bold">Cancellation Timing</th>
                  <th className="p-3 border border-brand-secondary/20 font-bold">Refund</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-secondary/10 text-brand-secondary">
                <tr className="hover:bg-brand-secondary/5 transition-colors">
                  <td className="p-3 border border-brand-secondary/20">5 or more days before programme start</td>
                  <td className="p-3 border border-brand-secondary/20 font-semibold text-brand-text">100% refund</td>
                </tr>
                <tr className="hover:bg-brand-secondary/5 transition-colors">
                  <td className="p-3 border border-brand-secondary/20">1 to 5 days before programme start</td>
                  <td className="p-3 border border-brand-secondary/20 font-semibold text-brand-text">50% refund</td>
                </tr>
                <tr className="hover:bg-brand-secondary/5 transition-colors">
                  <td className="p-3 border border-brand-secondary/20">After programme commencement</td>
                  <td className="p-3 border border-brand-secondary/20 font-semibold text-brand-text">No refund</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">2</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Transfer of Seat
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            If a fellow is unable to attend, they may transfer their seat to another eligible candidate at no extra charge, provided the transfer request is made at least 48 hours before the programme start date. No transfers will be accepted after commencement. No transfer will be accepted after the window is closed.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">3</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Deferral to Next Cohort
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            Fellows who cancel between 1–5 days before the start date may opt to defer to the next available cohort instead of taking a 50% refund — keeping 100% of their fee credit. This option is available once per enrolment.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">4</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              No-Show Policy
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            Fellows who do not attend without prior written intimation will be treated as post-commencement cancellations and will not be eligible for any refund or deferral.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">5</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Cancellation by DealSchool
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            In the rare event that a cohort is cancelled or postponed due to unforeseen circumstances, enrolled fellows will receive a full 100% refund or priority enrollment in the next cohort — at the fellow&apos;s choice.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">6</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              How to Request a Refund
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            All cancellation and refund requests must be submitted in writing to the DealSchool team via email. Refunds will be processed within 7–10 working days of approval, to the original payment method.
          </p>
          <div className="bg-brand-bg border border-brand-secondary/15 rounded-sm p-4 space-y-2 font-sans text-xs sm:text-sm ml-2 sm:ml-8 max-w-lg shadow-xs">
            <p className="text-brand-secondary flex items-center gap-2">
              <strong>Email Requests:</strong>{" "}
              <a
                href="mailto:support@dealschool.in"
                className="text-brand-accent font-bold underline hover:text-brand-secondary transition-colors inline-flex items-center gap-1.5"
              >
                <Mail className="h-4 w-4" />
                support@dealschool.in
              </a>
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">7</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Programme Fee Clarity
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            The programme fee does not include travel, accommodation, or any costs associated with the in-person VC meet (If any) at the end of the fellowship. Those costs are borne by the fellow independently.
          </p>
        </section>

        {/* Notice Footer Note */}
        <div className="pt-6 border-t border-brand-secondary/10">
          <p className="font-sans text-xs italic text-brand-secondary/80 pl-2 sm:pl-8">
            This policy is subject to change at the discretion of Deal School. Fellows will be notified of any changes prior to their cohort commencement date.
          </p>
        </div>

      </article>

      {/* Bottom Navigation CTA */}
      <div className="mt-16 pt-8 border-t border-brand-secondary/15 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => {
            if (onChangePage) {
              onChangePage("home");
            }
          }}
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
