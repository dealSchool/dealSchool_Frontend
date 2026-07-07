/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { Mail, ArrowUpRight } from "lucide-react";

interface TermsAndConditionsPageProps {
  onApplyClick?: () => void;
  onChangePage?: (
    page:
      | "home"
      | "about"
      | "program"
      | "team"
      | "contact"
      | "terms-and-conditions"
  ) => void;
}

export const TermsAndConditionsPage: React.FC<TermsAndConditionsPageProps> = ({
  onApplyClick,
  onChangePage,
}) => {
  useEffect(() => {
    document.title = "Terms & Conditions | DealSchool";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="py-12 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
      {/* Header Section */}
      <div className="border-b border-[#111111]/10 pb-10 mb-12 space-y-6">
        <div>
          <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.12em] uppercase block">
            TERMS &amp; CONDITIONS
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-brand-text">
          Terms &amp; <span className="font-serif italic font-medium text-brand-accent">Conditions</span>
        </h1>

        <p className="font-serif text-base sm:text-lg text-brand-secondary leading-relaxed max-w-3xl">
          Please read these Terms &amp; Conditions carefully before enrolling in the DealSchool Fellowship. By completing your registration and payment, you agree to be bound by these terms.
        </p>
      </div>

      {/* Main Legal Content Container */}
      <article className="prose prose-slate max-w-none space-y-10 text-[#111111]">

        {/* Section 1 */}
        <section className="space-y-4 pt-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">1</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Programme Overview
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            DealSchool is a 10 week, cohort-based VC fellowship programme (herein after referred to as &apos;the Organiser&apos;). The programme is open to anyone with a basic understanding of or exposure to finance whether through formal education, professional experience, or self-learning. This fellowship programme offers practical exposure to venture capital deal screening, due diligence, and investment decision-making.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">2</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Eligibility
            </h2>
          </div>
          <p className="font-sans text-sm text-brand-neutral leading-relaxed pl-2 sm:pl-8 font-medium">
            Participation in DealSchool is open to individuals who:
          </p>
          <ul className="list-disc list-outside pl-7 sm:pl-14 space-y-2 text-xs sm:text-sm text-brand-secondary leading-relaxed font-sans">
            <li>Are 18 years of age or older at the time of enrolment</li>
            <li>Have a basic understanding of or exposure to finance whether through formal education, professional experience, or self-learning</li>
            <li>Have successfully completed the application and selection process</li>
            <li>Have paid the full programme fee prior to the cohort start date</li>
          </ul>
          <p className="font-sans text-sm text-brand-neutral leading-relaxed pl-2 sm:pl-8 pt-2">
            The Organiser reserves the right to deny enrolment to any applicant at its sole discretion, without being obligated to provide reasons.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">3</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Programme Fee &amp; Payment
            </h2>
          </div>
          <ul className="list-disc list-outside pl-7 sm:pl-14 space-y-2 text-xs sm:text-sm text-brand-secondary leading-relaxed font-sans">
            <li>The programme fee must be paid in full prior to the cohort commencement date</li>
            <li>Fees are non-transferable except as outlined in the Refund &amp; Cancellation Policy</li>
            <li>The fee covers access to all programme sessions, materials, and the final VC meet</li>
            <li>Travel, accommodation, and personal expenses for in-person sessions are not included and are the sole responsibility of the fellow</li>
            <li>GST or applicable taxes will be charged additionally as per prevailing rates</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">4</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Refund &amp; Cancellation
            </h2>
          </div>
          <p className="font-sans text-sm text-brand-neutral leading-relaxed pl-2 sm:pl-8 font-medium">
            The following refund policy applies to all enrolments:
          </p>
          <ul className="list-disc list-outside pl-7 sm:pl-14 space-y-2 text-xs sm:text-sm text-brand-secondary leading-relaxed font-sans">
            <li>Cancellation 5 or more days before programme start: 100% refund</li>
            <li>Cancellation 1 to 5 days before programme start: 50% refund</li>
            <li>Cancellation after programme commencement: No refund</li>
            <li>Fellows have an option to defer to the next cohort and retain 100% fee credit (one-time option)</li>
            <li>Seat transfers to another eligible candidate are permitted up to 2 weeks after program starts.</li>
            <li>No-shows without prior written notice will be treated as post-commencement cancellations</li>
          </ul>
          <p className="font-sans text-sm text-brand-neutral leading-relaxed pl-2 sm:pl-8 pt-2">
            In the event of programme cancellation by Deal School, fellows will receive a full 100% refund or priority enrolment in the next cohort, at their choice.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">5</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Fellow Obligations
            </h2>
          </div>
          <p className="font-sans text-sm text-brand-neutral leading-relaxed pl-2 sm:pl-8 font-medium">
            By enrolling in DealSchool, fellows agree to:
          </p>
          <ul className="list-disc list-outside pl-7 sm:pl-14 space-y-2 text-xs sm:text-sm text-brand-secondary leading-relaxed font-sans">
            <li>Attend all sessions with punctuality and professional conduct</li>
            <li>Maintain strict confidentiality of all deal-related information, founder details, financials, and internal discussions shared during the programme</li>
            <li>Not share, reproduce, or distribute any programme materials, pitch decks, term sheets, or proprietary content without written permission from the Organiser</li>
            <li>Treat all founders, VCs, mentors, and fellow cohort members with respect</li>
            <li>Refrain from using any information gained during the programme for personal commercial gain outside the scope of the fellowship</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">6</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Confidentiality
            </h2>
          </div>
          <p className="font-sans text-sm text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            DealSchool exposes fellows to live deal flow, founder information, and investment discussions that are commercially sensitive. Fellows agree to:
          </p>
          <ul className="list-disc list-outside pl-7 sm:pl-14 space-y-2 text-xs sm:text-sm text-brand-secondary leading-relaxed font-sans">
            <li>Keep all such information strictly confidential during and after the programme</li>
            <li>Not disclose any information about specific startups, valuations, or investment discussions to any third party</li>
            <li>Sign a separate Non-Disclosure Agreement (NDA) if required by the Organiser or any participating founder or VC</li>
          </ul>
          <p className="font-sans text-sm text-brand-neutral leading-relaxed pl-2 sm:pl-8 pt-2">
            Breach of confidentiality obligations will result in immediate removal from the programme without refund and may attract legal action.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">7</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Intellectual Property
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            All content, frameworks, templates, session recordings, and materials provided during DealSchool remain the intellectual property of Deal School and the respective content creators. Fellows are granted a limited, non-exclusive, non-transferable licence to use programme materials for personal learning purposes only. Any commercial use, reproduction, or distribution without written consent is strictly prohibited.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">8</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Programme Changes
            </h2>
          </div>
          <p className="font-sans text-sm text-brand-neutral leading-relaxed pl-2 sm:pl-8 font-medium">
            The Organiser reserves the right to:
          </p>
          <ul className="list-disc list-outside pl-7 sm:pl-14 space-y-2 text-xs sm:text-sm text-brand-secondary leading-relaxed font-sans">
            <li>Modify the programme schedule, session format, or delivery mode (online/offline) as required</li>
            <li>Replace or substitute guest speakers, VCs, or mentors without prior notice</li>
            <li>Reschedule sessions due to unforeseen circumstances, including technical issues, speaker unavailability, or force majeure events</li>
          </ul>
          <p className="font-sans text-sm text-brand-neutral leading-relaxed pl-2 sm:pl-8 pt-2">
            Material changes to the programme structure will be communicated to enrolled fellows with reasonable advance notice.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">9</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Certification
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            Fellows who successfully complete all 10 weeks of the programme and meet minimum participation requirements will receive a DealSchool Certificate of Completion issued by Deal School. The Organiser reserves the right to withhold certification from fellows who fail to meet attendance or conduct standards. The certificate does not constitute a professional qualification or guarantee of employment.
          </p>
        </section>

        {/* Section 10 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">10</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Limitation of Liability
            </h2>
          </div>
          <p className="font-sans text-sm text-brand-neutral leading-relaxed pl-2 sm:pl-8 font-medium">
            To the fullest extent permitted by law, Deal School and its associated entities shall not be liable for:
          </p>
          <ul className="list-disc list-outside pl-7 sm:pl-14 space-y-2 text-xs sm:text-sm text-brand-secondary leading-relaxed font-sans">
            <li>Any loss of income, employment opportunity, or career outcome arising from participation or non-participation in DealSchool</li>
            <li>Any investment decisions made by fellows based on insights or information gained during the programme</li>
            <li>Technical failures, interruptions, or delays in online programme delivery</li>
            <li>Actions or conduct of third parties including founders, VCs, or guest speakers</li>
          </ul>
        </section>

        {/* Section 11 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">11</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Code of Conduct
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            DealSchool maintains a zero-tolerance policy for behaviour that is disrespectful, discriminatory, harassing, or disruptive. The Organiser reserves the right to remove any fellow from the programme without refund if their conduct is deemed inappropriate, at the sole discretion of the Organiser.
          </p>
        </section>

        {/* Section 12 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">12</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Governing Law &amp; Dispute Resolution
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            These Terms &amp; Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall first be attempted to be resolved through mutual discussion. If unresolved, disputes shall be subject to the exclusive jurisdiction of the courts of Navi Mumbai, Maharashtra.
          </p>
        </section>

        {/* Section 13 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">13</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Amendments
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            Deal School reserves the right to amend these Terms &amp; Conditions at any time. Fellows enrolled in an active cohort will be notified of changes via email or WhatsApp. Continued participation constitutes acceptance of the revised terms.
          </p>
        </section>

        {/* Section 14 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">14</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Contact
            </h2>
          </div>

          <div className="bg-brand-bg border border-brand-secondary/15 rounded-sm p-6 space-y-3 font-sans text-xs sm:text-sm ml-2 sm:ml-8 max-w-lg shadow-xs">
            <p className="font-bold text-brand-text text-base">DealSchool</p>
            <p className="text-brand-secondary flex items-center gap-2">
              <a
                href="mailto:support@dealschool.in"
                className="text-brand-accent font-bold underline hover:text-brand-secondary transition-colors inline-flex items-center gap-1.5 text-sm sm:text-base"
              >
                <Mail className="h-4 w-4" />
                support@dealschool.in
              </a>
            </p>
            <p className="text-brand-secondary">
              <strong>Address:</strong> Navi Mumbai, Maharashtra, India
            </p>
          </div>
        </section>

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
