/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Award, ArrowRight, Sparkles, Building, User, Mail, FileText } from "lucide-react";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    institution: "",
    major: "",
    excitedSector: "Developer Tools & AI Infra",
    motivation: "",
    cvUrl: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep((curr) => curr + 1);
    } else {
      submitForm();
    }
  };

  const submitForm = () => {
    setIsSubmitting(true);
    // Simulate real transactional backend submission
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3);
    }, 1500);
  };

  const resetAndClose = () => {
    onClose();
    // Wait for exit transition to clean up state
    setTimeout(() => {
      setStep(1);
      setFormData({
        fullName: "",
        email: "",
        institution: "",
        major: "",
        excitedSector: "Developer Tools & AI Infra",
        motivation: "",
        cvUrl: ""
      });
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-[#111111]/65 backdrop-blur-sm"
          />

          {/* Modal Centered position */}
          <div className="flex min-h-full items-center justify-center p-4 md:p-6 relative z-10">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ ease: "easeOut", duration: 0.3 }}
              className="w-full max-w-lg bg-brand-bg border border-brand-secondary/15 rounded-sm shadow-xl p-6 md:p-8 relative"
            >
              <button
                onClick={resetAndClose}
                className="absolute top-4 right-4 p-1.5 rounded-sm hover:bg-brand-secondary/5 text-brand-neutral hover:text-brand-text transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Progress markers */}
              {step < 3 && (
                <div className="flex items-center gap-1.5 mb-6">
                  <div className={`h-1.5 flex-1 rounded-sm transition-all ${step >= 1 ? "bg-brand-accent" : "bg-brand-secondary/10"}`} />
                  <div className={`h-1.5 flex-1 rounded-sm transition-all ${step >= 2 ? "bg-brand-accent" : "bg-brand-secondary/10"}`} />
                  <span className="font-mono text-[9px] text-brand-neutral tracking-widest uppercase ml-2 select-none">
                    STEP {step} OF 2
                  </span>
                </div>
              )}

              {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-5">
                  <div>
                    <span className="font-mono text-[9px] text-brand-accent tracking-[0.25em] font-bold uppercase block mb-1">
                      Fellowship Application
                    </span>
                    <h4 className="font-serif text-xl md:text-2xl font-bold text-brand-text mb-2">
                      Submit Your Credentials
                    </h4>
                    <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                      Please specify your background metrics. DealSchool admits ambitious candidates from across technical, scientific, and business ecosystems.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Full Name field */}
                    <div className="space-y-1">
                      <label className="block font-mono text-[10px] text-brand-secondary font-semibold uppercase">
                        Full Name <span className="text-brand-accent">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 h-4 w-4 text-brand-neutral" />
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Lord Keynes"
                          className="w-full bg-brand-bg text-brand-text pl-10 pr-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-sm"
                        />
                      </div>
                    </div>

                    {/* Email field */}
                    <div className="space-y-1">
                      <label className="block font-mono text-[10px] text-brand-secondary font-semibold uppercase">
                        Enterprise / University Email <span className="text-brand-accent">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-brand-neutral" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="keynes@clara.cam.ac.uk"
                          className="w-full bg-brand-bg text-brand-text pl-10 pr-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-sm"
                        />
                      </div>
                    </div>

                    {/* Institution field */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block font-mono text-[10px] text-brand-secondary font-semibold uppercase">
                          Institution / Firm <span className="text-brand-accent">*</span>
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-3.5 h-4 w-4 text-brand-neutral" />
                          <input
                            type="text"
                            name="institution"
                            required
                            value={formData.institution}
                            onChange={handleInputChange}
                            placeholder="University of Cambridge"
                            className="w-full bg-brand-bg text-brand-text pl-10 pr-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[10px] text-brand-secondary font-semibold uppercase">
                          Degree / Role
                        </label>
                        <input
                          type="text"
                          name="major"
                          value={formData.major}
                          onChange={handleInputChange}
                          placeholder="Mathematics Tripos"
                          className="w-full bg-brand-bg text-brand-text px-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-sm h-[46px]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-brand-secondary hover:bg-brand-dark-blue text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-brand-secondary/20 mt-6 cursor-pointer opacity-100"
                  >
                    Proceed To Analysis Profile <ArrowRight className="h-4 w-4 text-white" />
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleNextStep} className="space-y-5">
                  <div>
                    <span className="font-mono text-[9px] text-brand-accent tracking-[0.25em] font-bold uppercase block mb-1">
                      Admissions Underwriting
                    </span>
                    <h4 className="font-serif text-xl md:text-2xl font-bold text-brand-text mb-2">
                      Describe Your Thesis Focus
                    </h4>
                    <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                      We focus on deep vertical domains. What sector are you most passionate about tracking during your DealSchool fellowship?
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Sector select */}
                    <div className="space-y-1">
                      <label className="block font-mono text-[10px] text-brand-secondary font-semibold uppercase">
                        Primary Vertical Focus <span className="text-brand-accent">*</span>
                      </label>
                      <select
                        name="excitedSector"
                        value={formData.excitedSector}
                        onChange={handleInputChange}
                        className="w-full bg-brand-bg text-brand-text px-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-sm"
                      >
                        <option value="Developer Tools & AI Infra">Developer Tools & AI Infra</option>
                        <option value="SaaS & Fintech Systems">SaaS & Fintech Systems</option>
                        <option value="ClimateTech & energy protocols">ClimateTech & Grid Protocols</option>
                        <option value="DeepTech & synthetic biology">DeepTech & Synthetic Biology</option>
                      </select>
                    </div>

                    {/* Motivation textarea */}
                    <div className="space-y-1">
                      <label className="block font-mono text-[10px] text-brand-secondary font-semibold uppercase">
                        Underwriting Potential (<sup className="text-brand-accent">Examine: Why VC?</sup>)
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-brand-neutral" />
                        <textarea
                          name="motivation"
                          rows={4}
                          required
                          value={formData.motivation}
                          onChange={handleInputChange}
                          placeholder="Briefly state why robust startup underwriting matters to you, or outline are there specific technologies you think are overhyped today..."
                          className="w-full bg-brand-bg text-brand-text pl-10 pr-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3.5 bg-brand-bg hover:bg-brand-secondary/5 text-brand-neutral font-mono text-xs font-bold uppercase border border-[#111111]/25 transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 bg-brand-secondary hover:bg-brand-dark-blue disabled:bg-brand-secondary/55 text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-brand-secondary/20 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>Simulating Underwriting...</span>
                      ) : (
                        <>
                          Complete Application <Sparkles className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-8 text-center space-y-4"
                >
                  <div className="mx-auto h-16 w-16 bg-brand-accent/15 border border-brand-accent rounded-full flex items-center justify-center text-brand-accent animate-orb-glow">
                    <Check className="h-8 w-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="font-mono text-[9px] text-[#D4A62A] tracking-[0.25em] font-bold block uppercase">
                      Credentials Received
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-brand-text">
                      Application Submitted
                    </h3>
                    <p className="font-serif italic text-sm text-brand-neutral">
                      Welcome to the Sourcing Pipeline, {formData.fullName}.
                    </p>
                  </div>

                  {/* Sequoia/McKinsey memo style transaction invoice */}
                  <div className="bg-brand-bg p-5 rounded-sm text-left border border-brand-secondary/10 max-w-sm mx-auto font-mono text-[10px] text-brand-secondary space-y-2">
                    <div className="flex justify-between border-b border-brand-secondary/5 pb-1">
                      <span className="text-brand-neutral">TRANSACTION VALUE:</span>
                      <span className="font-bold text-brand-accent">DEAL_SCHOOL_FELLOWSHIP</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-secondary/5 pb-1">
                      <span className="text-brand-neutral">OUTLOOK:</span>
                      <span className="font-bold">COHORT 1 FALL CANDIDATE</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-secondary/5 pb-1">
                      <span className="text-brand-neutral">DOCKET NO:</span>
                      <span className="font-bold">DS-MV-2026-{(Math.random() * 10000).toFixed(0)}</span>
                    </div>
                    <p className="text-[9px] text-brand-neutral leading-relaxed pt-2.5">
                      Our admissions committee, in collaboration with Middha Ventures General Partners, will audit your thesis parameters. Expect formal interview invitations within 5 business days.
                    </p>
                  </div>

                  <button
                    onClick={resetAndClose}
                    className="mt-4 px-6 py-3 bg-brand-secondary hover:bg-brand-text text-[#FAFAF8] font-mono text-xs font-bold tracking-wider uppercase transition-colors duration-200 cursor-pointer"
                  >
                    Return To Intelligence Report
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
