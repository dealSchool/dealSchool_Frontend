/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, ArrowRight, AlertCircle, User, Mail, Phone, MapPin, Download } from "lucide-react";
import { API_URL } from "@shared/config";

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_REGEX = /^\d{7,15}$/;

// Static brochure PDF served from public/
const BROCHURE_PDF_URL = "/Long%20form%20brochure%20deal%20school.pdf";

export const BrochureModal: React.FC<BrochureModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: "", contact: "", email: "", city: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);

  // Focus trap + Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusable: HTMLElement[] = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector));
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        resetAndClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusableNow: HTMLElement[] = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector));
      const first = focusableNow[0];
      const last = focusableNow[focusableNow.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () =>
    formData.name.trim() !== "" &&
    CONTACT_REGEX.test(formData.contact.trim()) &&
    EMAIL_REGEX.test(formData.email.trim()) &&
    formData.city.trim() !== "";

  const downloadBrochure = () => {
    const link = document.createElement("a");
    link.href = BROCHURE_PDF_URL;
    link.download = "Long form brochure deal school.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_URL}/brochure-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          contact: formData.contact.trim(),
          email: formData.email.trim(),
          city: formData.city.trim(),
        }),
      });

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        setErrorMessage(
          retryAfter
            ? `Too many requests. Please wait ${retryAfter} seconds before submitting again.`
            : "Too many requests. Please wait before submitting again."
        );
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
        throw new Error(err.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error("Something went wrong. Please try again.");
      }

      setSubmitted(true);
      downloadBrochure();
    } catch (error: any) {
      console.error("Brochure request error:", error.message);
      setErrorMessage(error.message || "Submission failed. Please try again.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    onClose();
    // Wait for exit transition to clean up state
    setTimeout(() => {
      setFormData({ name: "", contact: "", email: "", city: "" });
      setErrorMessage(null);
      setSubmitted(false);
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
            className="fixed inset-0 bg-[#111111]/70 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Modal centered position */}
          <div className="flex min-h-full items-center justify-center p-4 md:p-6 relative z-10">
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="brochure-modal-title"
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              transition={{ ease: "easeOut", duration: 0.25 }}
              className="w-full max-w-md bg-brand-bg border border-brand-secondary/15 rounded-sm shadow-2xl relative p-6 md:p-8"
            >
              <button
                onClick={resetAndClose}
                aria-label="Close brochure request form"
                className="absolute top-4 right-4 p-1.5 rounded-sm hover:bg-brand-secondary/5 text-brand-neutral hover:text-brand-text transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-brand-secondary/8 pb-4">
                    <span className="font-mono text-[9px] text-brand-accent tracking-[0.12em] font-bold uppercase block mb-1">
                      Program Brochure
                    </span>
                    <h4 id="brochure-modal-title" className="font-serif text-xl md:text-2xl font-bold text-brand-text mb-1">
                      Request the Brochure
                    </h4>
                    <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                      Share your details below and we'll unlock the download instantly.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-sm text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider">
                        Full Name <span className="text-brand-accent">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral/60 pointer-events-none" />
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          className="w-full bg-white text-brand-text pl-9 pr-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm transition-all h-11"
                        />
                      </div>
                    </div>

                    {/* Contact Number */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider">
                        Contact Number <span className="text-brand-accent">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral/60 pointer-events-none" />
                        <input
                          type="tel"
                          name="contact"
                          required
                          value={formData.contact}
                          onChange={handleInputChange}
                          placeholder="9876543210"
                          className={`w-full bg-white text-brand-text pl-9 pr-3 py-3 rounded-sm border focus:outline-none focus:ring-2 text-sm h-11 transition-all ${
                            formData.contact && !CONTACT_REGEX.test(formData.contact.trim())
                              ? "border-red-400 focus:border-red-400 focus:ring-red-400/10"
                              : "border-brand-secondary/15 focus:border-brand-accent focus:ring-brand-accent/10"
                          }`}
                        />
                      </div>
                      {formData.contact && !CONTACT_REGEX.test(formData.contact.trim()) && (
                        <p className="text-red-600 text-[10px] flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          Enter 7–15 digits, no spaces or symbols
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider">
                        Email Address <span className="text-brand-accent">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral/60 pointer-events-none" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="yourname@example.com"
                          className="w-full bg-white text-brand-text pl-9 pr-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm h-11 transition-all"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider">
                        City <span className="text-brand-accent">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral/60 pointer-events-none" />
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Mumbai, Delhi, Pune..."
                          className="w-full bg-white text-brand-text pl-9 pr-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm h-11 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    className="w-full py-3.5 bg-brand-accent hover:bg-[#B24122] disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer rounded-sm"
                  >
                    {isSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        Get the Brochure <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-2 text-center space-y-5"
                >
                  <div className="mx-auto h-14 w-14 bg-brand-accent/15 border border-brand-accent/40 rounded-full flex items-center justify-center text-brand-accent">
                    <Check className="h-6 w-6" strokeWidth={2.5} />
                  </div>

                  <div className="space-y-1.5">
                    <h3 id="brochure-modal-title" className="font-serif text-2xl font-bold text-brand-text">
                      Your Download Has Started
                    </h3>
                    <p className="font-sans text-sm text-brand-neutral">
                      Thanks, <span className="font-semibold text-brand-text">{formData.name}</span>. If the download
                      didn't start automatically, use the button below.
                    </p>
                  </div>

                  <button
                    onClick={downloadBrochure}
                    className="w-full py-3 bg-brand-secondary hover:bg-brand-dark-blue text-[#FAFAF8] font-mono text-xs font-bold tracking-wider uppercase transition-colors duration-200 cursor-pointer rounded-sm flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" /> Download Brochure Again
                  </button>

                  <button
                    onClick={resetAndClose}
                    className="w-full py-3 bg-white hover:bg-brand-secondary/5 text-brand-neutral font-mono text-xs font-bold uppercase border border-brand-secondary/15 rounded-sm transition-all cursor-pointer"
                  >
                    Close
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
