/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { Mail, ArrowUpRight } from "lucide-react";

interface PrivacyPolicyPageProps {
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

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  onApplyClick,
  onChangePage,
}) => {
  useEffect(() => {
    document.title = "Privacy Policy | DealSchool";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="py-12 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
      {/* Header Section */}
      <div className="border-b border-[#111111]/10 pb-10 mb-12 space-y-6">
        <div>
          <span className="font-mono text-xs text-brand-accent font-bold tracking-[0.12em] uppercase block">
            PRIVACY POLICY
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-brand-text">
          Privacy <span className="font-serif italic font-medium text-brand-accent">Policy</span>
        </h1>

        <p className="font-serif text-base sm:text-lg text-brand-secondary leading-relaxed max-w-3xl">
          This Privacy Policy explains how we collect, use, store, and protect your personal information when you apply for or participate in the DealSchool Fellowship.
        </p>
      </div>

      {/* Main Content Container */}
      <article className="prose prose-slate max-w-none space-y-10 text-[#111111]">

        {/* Section 1 */}
        <section className="space-y-4 pt-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">1</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Information We Collect
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            When you register, apply, or participate in DealSchool, we may collect the following categories of personal information:
          </p>
          <ul className="list-disc list-outside pl-7 sm:pl-14 space-y-2 text-xs sm:text-sm text-brand-secondary leading-relaxed font-sans">
            <li><strong>Identity information:</strong> Full name, photograph, date of birth</li>
            <li><strong>Contact information:</strong> Email address, mobile number, city of residence</li>
            <li><strong>Academic &amp; professional information:</strong> Educational qualifications, certifications, institution name, year of study or graduation</li>
            <li><strong>Payment information:</strong> Transaction ID, payment method (we do not store card or bank details directly payments are processed via secure third-party gateways)</li>
            <li><strong>Programme interaction data:</strong> Attendance records, diligence submissions, feedback responses, and participation logs</li>
            <li><strong>Communication data:</strong> Emails, WhatsApp messages, or any correspondence with the DealSchool team</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">2</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              How We Use Your Information
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            We use your personal information strictly for the following purposes:
          </p>
          <ul className="list-disc list-outside pl-7 sm:pl-14 space-y-2 text-xs sm:text-sm text-brand-secondary leading-relaxed font-sans">
            <li>Processing your application and confirming enrolment</li>
            <li>Communicating programme schedules, updates, and resources</li>
            <li>Facilitating introductions to founders, VCs, and fellow cohort members</li>
            <li>Issuing your DealSchool certification upon completion</li>
            <li>Sending programme-related announcements and future cohort information</li>
            <li>Internal analytics to improve the quality of future cohorts</li>
          </ul>
          <p className="font-sans text-sm text-brand-neutral leading-relaxed pl-2 sm:pl-8 pt-2">
            We will never use your personal data for unsolicited third-party marketing without your explicit consent.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">3</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Data Sharing
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            We do not sell or rent your personal data to any third party. We may share your information with:
          </p>
          <ul className="list-disc list-outside pl-7 sm:pl-14 space-y-2 text-xs sm:text-sm text-brand-secondary leading-relaxed font-sans">
            <li>Founders and VCs participating in DealSchool sessions — limited to your name and professional background, solely for the purpose of meaningful engagement during the programme</li>
            <li>Payment gateway providers — for transaction verification only</li>
            <li>Technology platforms used to deliver the programme (e.g. Zoom, Google Meet, WhatsApp) — subject to their own privacy policies</li>
          </ul>
          <p className="font-sans text-sm text-brand-neutral leading-relaxed pl-2 sm:pl-8 pt-2">
            Any such sharing is governed by confidentiality obligations and is limited to what is strictly necessary.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">4</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Data Retention
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            Your personal data will be retained for a period of 3 years from the date of your cohort completion. After this period, data will be anonymised or deleted unless you have provided consent for continued communication. You may request deletion of your data at any time by writing to us.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">5</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Your Rights
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            As a DealSchool fellow, you have the following rights with respect to your personal data:
          </p>
          <ul className="list-disc list-outside pl-7 sm:pl-14 space-y-2 text-xs sm:text-sm text-brand-secondary leading-relaxed font-sans">
            <li><strong>Right to access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong>Right to correction:</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong>Right to withdraw consent:</strong> Opt out of non-essential communications at any time</li>
          </ul>
          <p className="font-sans text-sm text-brand-neutral leading-relaxed pl-2 sm:pl-8 pt-2">
            To exercise any of these rights, please write to us at the contact details provided at the end of this document.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">6</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Data Security
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            We take reasonable technical and organisational measures to protect your personal data from unauthorised access, loss, misuse, or disclosure. However, no method of digital transmission is 100% secure. We encourage you to keep your login credentials and programme materials confidential.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">7</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Cookies &amp; Digital Platforms
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            Our website and registration forms may use cookies and analytics tools (such as Google Analytics) to understand user behaviour and improve the enrolment experience. You may disable cookies through your browser settings, though this may affect functionality.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">8</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Children&apos;s Privacy
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            Deal School is designed for individuals aged 18 years and above. We do not knowingly collect personal data from anyone under the age of 18. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">9</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Changes to This Policy
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            Deal School reserves the right to update this Privacy Policy from time to time. Fellows will be notified of material changes via email or WhatsApp at least 7 days before the changes take effect. Continued participation in the programme after notification constitutes acceptance of the revised policy.
          </p>
        </section>

        {/* Section 10 */}
        <section className="space-y-4 pt-6 border-t border-brand-secondary/10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-sm">10</span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-text m-0">
              Contact Us
            </h2>
          </div>
          <p className="font-sans text-sm text-brand-neutral leading-relaxed pl-2 sm:pl-8">
            For any privacy-related queries, requests, or complaints, please contact:
          </p>

          <div className="bg-brand-bg border border-brand-secondary/15 rounded-sm p-6 space-y-3 font-sans text-xs sm:text-sm ml-2 sm:ml-8 max-w-lg shadow-xs">
            <p className="font-bold text-brand-text text-base">DealSchool</p>
            <p className="text-brand-secondary flex items-center gap-2">
              <strong>Email:</strong>{" "}
              <a
                href="mailto:support@dealschool.in"
                className="text-brand-accent font-bold underline hover:text-brand-secondary transition-colors inline-flex items-center gap-1.5 text-sm sm:text-base"
              >
                <Mail className="h-4 w-4" />
                support@dealschool.in
              </a>
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
