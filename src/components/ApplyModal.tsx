/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Check, ArrowRight, Sparkles, User, Mail, FileText,
  Phone, Globe, MapPin, UploadCloud, CheckCircle2, ChevronRight, AlertCircle, FileSpreadsheet
} from "lucide-react";
import { db, handleFirestoreError, OperationType, getFriendlyFirestoreError } from "../firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Basic phone format: must start with + or digit, then 5–19 digits/spaces/dashes/parens
const PHONE_REGEX = /^[+\d][\d\s\-(). ]{4,18}$/;

export const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedDocId, setSubmittedDocId] = useState<string>("");

  // Resume Link State
  const [resumeLinkError, setResumeLinkError] = useState<string | null>(null);

  // Ref for modal container — used for focus trap
  const modalRef = useRef<HTMLDivElement>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    linkedinUrl: "",
    city: "",
    currentStatus: "",

    // Student fields
    collegeName: "",
    degree: "",
    graduationYear: "",

    // Recent Graduate fields
    currentRole: "",
    companyName: "",
    degreeEducationalBackground: "",

    // Working Professional fields
    yearsOfExperience: "",

    // Founder fields
    startupName: "",
    industrySector: "",
    startupLinkedinProfile: "",

    // Freelancer fields
    areaOfWork: "",
    freelancerLinkedinProfile: "",

    // Other fields
    otherStatusSpecify: "",

    // Intent reason
    primaryReason: "",
    primaryReasonOther: "",

    // Admissions underwriting (Assessments)
    assessmentQ1: "",
    assessmentQ2: "",
    assessmentQ3: "",

    // Link & discovery
    resumeLink: "",
    discoverySource: "",
    discoverySourceOther: ""
  });

  // Focus trap + Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Move focus to first focusable element on open / step change
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

      // Re-query on each tab press since step content changes
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
  }, [isOpen, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isValidUrl = (urlStr: string) => {
    try {
      const url = new URL(urlStr);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (err) {
      return false;
    }
  };

  // Step validation check gates
  const isStepValid = () => {
    if (step === 1) {
      return (
        formData.fullName.trim() !== "" &&
        PHONE_REGEX.test(formData.mobileNumber.trim()) &&
        formData.email.trim() !== "" &&
        formData.email.includes("@") &&
        formData.linkedinUrl.trim() !== "" &&
        formData.city.trim() !== ""
      );
    }

    if (step === 2) {
      if (!formData.currentStatus) return false;

      switch (formData.currentStatus) {
        case "Student":
          return (
            formData.collegeName.trim() !== "" &&
            formData.degree.trim() !== "" &&
            formData.graduationYear.trim() !== ""
          );
        case "Recent Graduate (0–2 years of experience)":
          return (
            formData.currentRole.trim() !== "" &&
            formData.companyName.trim() !== "" &&
            formData.graduationYear.trim() !== "" &&
            formData.degreeEducationalBackground.trim() !== ""
          );
        case "Working Professional":
          return (
            formData.currentRole.trim() !== "" &&
            formData.companyName.trim() !== "" &&
            formData.yearsOfExperience.trim() !== ""
          );
        case "Founder":
          return (
            formData.startupName.trim() !== "" &&
            formData.industrySector.trim() !== "" &&
            formData.startupLinkedinProfile.trim() !== ""
          );
        case "Freelancer":
          return (
            formData.areaOfWork.trim() !== "" &&
            formData.yearsOfExperience.trim() !== "" &&
            formData.freelancerLinkedinProfile.trim() !== ""
          );
        case "Other":
          return formData.otherStatusSpecify.trim() !== "";
        default:
          return false;
      }
    }

    if (step === 3) {
      return formData.primaryReason !== "" && (formData.primaryReason !== "Other" || formData.primaryReasonOther.trim() !== "");
    }

    if (step === 4) {
      return formData.assessmentQ1.trim() !== "" && formData.assessmentQ2.trim() !== "" && formData.assessmentQ3 !== "";
    }

    if (step === 5) {
      const resumeOk = isValidUrl(formData.resumeLink) && formData.resumeLink.trim() !== "";
      const sourceOk = formData.discoverySource !== "" && (formData.discoverySource !== "Other" || formData.discoverySourceOther.trim() !== "");
      return resumeOk && sourceOk;
    }

    return true;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid()) return;

    if (step < 5) {
      setStep((curr) => curr + 1);
      setErrorMessage(null);
    } else {
      submitForm();
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    if (!isStepValid()) {
      setIsSubmitting(false);
      setErrorMessage("Form validation failed. Please make sure all fields are correctly formatted.");
      return;
    }

    try {
      const appCollRef = collection(db, "applications");
      const docRef = doc(appCollRef);

      // Assemble structured payload based on selected status and reasons
      const payload: Record<string, any> = {
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        linkedinUrl: formData.linkedinUrl,
        city: formData.city,
        currentStatus: formData.currentStatus,

        // Include ONLY relevant fields from conditional sections
        ...(formData.currentStatus === "Student" && {
          collegeName: formData.collegeName,
          degree: formData.degree,
          graduationYear: formData.graduationYear,
        }),
        ...(formData.currentStatus === "Recent Graduate (0–2 years of experience)" && {
          currentRole: formData.currentRole,
          companyName: formData.companyName,
          graduationYear: formData.graduationYear,
          degreeEducationalBackground: formData.degreeEducationalBackground,
        }),
        ...(formData.currentStatus === "Working Professional" && {
          currentRole: formData.currentRole,
          companyName: formData.companyName,
          yearsOfExperience: formData.yearsOfExperience,
        }),
        ...(formData.currentStatus === "Founder" && {
          startupName: formData.startupName,
          industrySector: formData.industrySector,
          startupLinkedinProfile: formData.startupLinkedinProfile,
        }),
        ...(formData.currentStatus === "Freelancer" && {
          areaOfWork: formData.areaOfWork,
          yearsOfExperience: formData.yearsOfExperience,
          freelancerLinkedinProfile: formData.freelancerLinkedinProfile,
        }),
        ...(formData.currentStatus === "Other" && {
          otherStatusSpecify: formData.otherStatusSpecify,
        }),

        primaryReason: formData.primaryReason,
        ...(formData.primaryReason === "Other" && {
          primaryReasonOther: formData.primaryReasonOther,
        }),

        assessmentQ1: formData.assessmentQ1,
        assessmentQ2: formData.assessmentQ2,
        assessmentQ3: formData.assessmentQ3,

        resumeLink: formData.resumeLink,
        discoverySource: formData.discoverySource,
        ...(formData.discoverySource === "Other" && {
          discoverySourceOther: formData.discoverySourceOther,
        }),

        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Direct write — Firebase SDK handles retries and timeouts internally
      await setDoc(docRef, payload);

      setSubmittedDocId(docRef.id);
      setStep(6);
    } catch (error: any) {
      const friendlyMessage = getFriendlyFirestoreError(error);
      console.error("Firestore application submission error:", error.code || error.message);
      setErrorMessage(`Submission failed: ${friendlyMessage}`);
      handleFirestoreError(error, OperationType.WRITE, "applications");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    onClose();
    // Wait for exit transition to clean up state
    setTimeout(() => {
      setStep(1);
      setResumeLinkError(null);
      setErrorMessage(null);
      setSubmittedDocId("");
      setFormData({
        fullName: "",
        mobileNumber: "",
        email: "",
        linkedinUrl: "",
        city: "",
        currentStatus: "",
        collegeName: "",
        degree: "",
        graduationYear: "",
        currentRole: "",
        companyName: "",
        degreeEducationalBackground: "",
        yearsOfExperience: "",
        startupName: "",
        industrySector: "",
        startupLinkedinProfile: "",
        areaOfWork: "",
        freelancerLinkedinProfile: "",
        otherStatusSpecify: "",
        primaryReason: "",
        primaryReasonOther: "",
        assessmentQ1: "",
        assessmentQ2: "",
        assessmentQ3: "",
        resumeLink: "",
        discoverySource: "",
        discoverySourceOther: ""
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
            className="fixed inset-0 bg-[#111111]/70 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Modal Centered position */}
          <div className="flex min-h-full items-center justify-center p-4 md:p-6 relative z-10">
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-step-title"
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              transition={{ ease: "easeOut", duration: 0.25 }}
              className="w-full max-w-xl bg-brand-bg border border-brand-secondary/15 rounded-sm shadow-xl p-5 md:p-8 relative"
            >
              <button
                onClick={resetAndClose}
                aria-label="Close application form"
                className="absolute top-4 right-4 p-1.5 rounded-sm hover:bg-brand-secondary/5 text-brand-neutral hover:text-brand-text transition-all cursor-pointer"
                id="modal-close-btn"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Progress markers */}
              {step < 6 && (
                <div className="flex items-center gap-1.5 mb-6">
                  <div className={`h-1 flex-1 rounded-sm transition-all ${step >= 1 ? "bg-brand-accent" : "bg-brand-secondary/10"}`} />
                  <div className={`h-1 flex-1 rounded-sm transition-all ${step >= 2 ? "bg-brand-accent" : "bg-brand-secondary/10"}`} />
                  <div className={`h-1 flex-1 rounded-sm transition-all ${step >= 3 ? "bg-brand-accent" : "bg-brand-secondary/10"}`} />
                  <div className={`h-1 flex-1 rounded-sm transition-all ${step >= 4 ? "bg-brand-accent" : "bg-brand-secondary/10"}`} />
                  <div className={`h-1 flex-1 rounded-sm transition-all ${step >= 5 ? "bg-brand-accent" : "bg-brand-secondary/10"}`} />
                  <span className="font-mono text-[9px] text-brand-neutral tracking-widest uppercase ml-3 select-none">
                    STEP {step} OF 5
                  </span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-sm text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* STEP 1: Basic Information */}
              {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-4">
                  <div>
                    <span className="font-mono text-[9px] text-brand-accent tracking-[0.25em] font-bold uppercase block mb-1">
                      Admissions Flow 2026
                    </span>
                    <h4 id="modal-step-title" className="font-serif text-xl md:text-2xl font-bold text-brand-text mb-1">
                      Candidate Specifications
                    </h4>
                    <p className="font-sans text-[11px] text-brand-neutral leading-relaxed">
                      All fields are required. DealSchool admits ambitious candidates matching rigorous venture criteria.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">
                        Full Name <span className="text-brand-accent">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-brand-neutral" />
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Devang Sachdeva"
                          className="w-full bg-brand-bg text-brand-text pl-9 pr-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Mobile Number */}
                      <div className="space-y-1">
                        <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">
                          Mobile Number <span className="text-brand-accent">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-brand-neutral" />
                          <input
                            type="tel"
                            name="mobileNumber"
                            required
                            value={formData.mobileNumber}
                            onChange={handleInputChange}
                            placeholder="+91 XXXXX XXXXX"
                            className={`w-full bg-brand-bg text-brand-text pl-9 pr-3 py-2.5 rounded-sm border focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10 transition-colors ${
                              formData.mobileNumber && !PHONE_REGEX.test(formData.mobileNumber.trim())
                                ? "border-red-400"
                                : "border-brand-secondary/15"
                            }`}
                          />
                        </div>
                        {formData.mobileNumber && !PHONE_REGEX.test(formData.mobileNumber.trim()) && (
                          <p className="text-red-600 text-[10px] flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            Enter a valid phone number (e.g. +91 98765 43210)
                          </p>
                        )}
                      </div>

                      {/* Email Profile */}
                      <div className="space-y-1">
                        <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">
                          Email Address <span className="text-brand-accent">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-brand-neutral" />
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="yourname@example.com"
                            className="w-full bg-brand-bg text-brand-text pl-9 pr-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* LinkedIn URL */}
                      <div className="space-y-1">
                        <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">
                          LinkedIn Profile URL <span className="text-brand-accent">*</span>
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 h-4 w-4 text-brand-neutral" />
                          <input
                            type="url"
                            name="linkedinUrl"
                            required
                            value={formData.linkedinUrl}
                            onChange={handleInputChange}
                            placeholder="https://linkedin.com/in/username"
                            className="w-full bg-brand-bg text-brand-text pl-9 pr-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                          />
                        </div>
                      </div>

                      {/* City */}
                      <div className="space-y-1">
                        <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">
                          City <span className="text-brand-accent">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-brand-neutral" />
                          <input
                            type="text"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Mumbai"
                            className="w-full bg-brand-bg text-brand-text pl-9 pr-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!isStepValid()}
                    className="w-full py-3 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-50 text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
                  >
                    Proceed to Alignment Details <ArrowRight className="h-4 w-4 text-white" />
                  </button>
                </form>
              )}

              {/* STEP 2: Current Status & Conditional Fields */}
              {step === 2 && (
                <form onSubmit={handleNextStep} className="space-y-4">
                  <div>
                    <span className="font-mono text-[9px] text-brand-accent tracking-[0.25em] font-bold uppercase block mb-1">
                      Functional Position
                    </span>
                    <h4 id="modal-step-title" className="font-serif text-xl md:text-2xl font-bold text-brand-text mb-1">
                      Professional Trajectory
                    </h4>
                    <p className="font-sans text-[11px] text-brand-neutral leading-relaxed">
                      Select your operational model. Fill out the corresponding short-answer verification fields.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {/* Status Select */}
                    <div className="space-y-1">
                      <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">
                        Current Status <span className="text-brand-accent">*</span>
                      </label>
                      <select
                        name="currentStatus"
                        required
                        value={formData.currentStatus}
                        onChange={handleInputChange}
                        className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10 select-none cursor-pointer"
                      >
                        <option value="">-- Click To Choose --</option>
                        <option value="Student">Student</option>
                        <option value="Recent Graduate (0–2 years of experience)">Recent Graduate (0–2 years of experience)</option>
                        <option value="Working Professional">Working Professional</option>
                        <option value="Founder">Founder</option>
                        <option value="Freelancer">Freelancer</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* DYNAMIC CONDITIONAL SHORT-ANSWER FIELDS */}
                    <AnimatePresence mode="wait">
                      {formData.currentStatus === "Student" && (
                        <motion.div
                          key="Student"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-3 pt-2 border-t border-brand-secondary/5"
                        >
                          <div className="space-y-1">
                            <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">College Name <span className="text-brand-accent">*</span></label>
                            <input
                              type="text"
                              name="collegeName"
                              required
                              value={formData.collegeName}
                              onChange={handleInputChange}
                              placeholder="St. Xavier's College"
                              className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Degree <span className="text-brand-accent">*</span></label>
                              <input
                               type="text"
                               name="degree"
                               required
                               value={formData.degree}
                               onChange={handleInputChange}
                               placeholder="B.A. Economics"
                               className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Graduation Year <span className="text-brand-accent">*</span></label>
                              <input
                               type="text"
                               name="graduationYear"
                               required
                               value={formData.graduationYear}
                               onChange={handleInputChange}
                               placeholder="2027"
                               className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {formData.currentStatus === "Recent Graduate (0–2 years of experience)" && (
                        <motion.div
                          key="RecentGraduate"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-3 pt-2 border-t border-brand-secondary/5"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Current Role <span className="text-brand-accent">*</span></label>
                              <input
                               type="text"
                               name="currentRole"
                               required
                               value={formData.currentRole}
                               onChange={handleInputChange}
                               placeholder="Analyst"
                               className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Company Name <span className="text-brand-accent">*</span></label>
                              <input
                               type="text"
                               name="companyName"
                               required
                               value={formData.companyName}
                               onChange={handleInputChange}
                               placeholder="KPMG"
                               className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Graduation Year <span className="text-brand-accent">*</span></label>
                              <input
                               type="text"
                               name="graduationYear"
                               required
                               value={formData.graduationYear}
                               onChange={handleInputChange}
                               placeholder="2025"
                               className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Degree / Educational Background <span className="text-brand-accent">*</span></label>
                              <input
                               type="text"
                               name="degreeEducationalBackground"
                               required
                               value={formData.degreeEducationalBackground}
                               onChange={handleInputChange}
                               placeholder="B.Tech Computer Science"
                               className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {formData.currentStatus === "Working Professional" && (
                        <motion.div
                          key="WorkingProfessional"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-3 pt-2 border-t border-brand-secondary/5"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Current Role <span className="text-brand-accent">*</span></label>
                              <input
                               type="text"
                               name="currentRole"
                               required
                               value={formData.currentRole}
                               onChange={handleInputChange}
                               placeholder="Product Manager"
                               className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Company Name <span className="text-brand-accent">*</span></label>
                              <input
                               type="text"
                               name="companyName"
                               required
                               value={formData.companyName}
                               onChange={handleInputChange}
                               placeholder="HDFC Bank"
                               className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Years of Experience <span className="text-brand-accent">*</span></label>
                            <input
                              type="text"
                              name="yearsOfExperience"
                              required
                              value={formData.yearsOfExperience}
                              onChange={handleInputChange}
                              placeholder="4.5 Years"
                              className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                            />
                          </div>
                        </motion.div>
                      )}

                      {formData.currentStatus === "Founder" && (
                        <motion.div
                          key="Founder"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-3 pt-2 border-t border-brand-secondary/5"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Startup Name <span className="text-brand-accent">*</span></label>
                              <input
                               type="text"
                               name="startupName"
                               required
                               value={formData.startupName}
                               onChange={handleInputChange}
                               placeholder="Credo Infra"
                               className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Industry / Sector <span className="text-brand-accent">*</span></label>
                              <input
                               type="text"
                               name="industrySector"
                               required
                               value={formData.industrySector}
                               onChange={handleInputChange}
                               placeholder="Fintech Infrastructure"
                               className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Startup LinkedIn Profile <span className="text-brand-accent">*</span></label>
                            <input
                              type="url"
                              name="startupLinkedinProfile"
                              required
                              value={formData.startupLinkedinProfile}
                              onChange={handleInputChange}
                              placeholder="https://linkedin.com/company/startup"
                              className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                            />
                          </div>
                        </motion.div>
                      )}

                      {formData.currentStatus === "Freelancer" && (
                        <motion.div
                          key="Freelancer"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-3 pt-2 border-t border-brand-secondary/5"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Area of Work <span className="text-brand-accent">*</span></label>
                              <input
                               type="text"
                               name="areaOfWork"
                               required
                               value={formData.areaOfWork}
                               onChange={handleInputChange}
                               placeholder="Solidity Audits"
                               className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Years of Experience <span className="text-brand-accent">*</span></label>
                              <input
                               type="text"
                               name="yearsOfExperience"
                               required
                               value={formData.yearsOfExperience}
                               onChange={handleInputChange}
                               placeholder="3 Years"
                               className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">LinkedIn Profile <span className="text-brand-accent">*</span></label>
                            <input
                              type="url"
                              name="freelancerLinkedinProfile"
                              required
                              value={formData.freelancerLinkedinProfile}
                              onChange={handleInputChange}
                              placeholder="https://linkedin.com/in/username"
                              className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                            />
                          </div>
                        </motion.div>
                      )}

                      {formData.currentStatus === "Other" && (
                        <motion.div
                          key="Other"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="pt-2 border-t border-brand-secondary/5"
                        >
                          <div className="space-y-1">
                            <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Please Specify <span className="text-brand-accent">*</span></label>
                            <input
                              type="text"
                              name="otherStatusSpecify"
                              required
                              value={formData.otherStatusSpecify}
                              onChange={handleInputChange}
                              placeholder="Briefly state your unique professional archetype..."
                              className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-3 bg-brand-bg hover:bg-brand-secondary/5 text-brand-neutral font-mono text-xs font-bold uppercase border border-brand-secondary/15 transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!isStepValid()}
                      className="flex-1 py-3 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-50 text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Proceed to Motivation & Intent <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Motivation & Intent */}
              {step === 3 && (
                <form onSubmit={handleNextStep} className="space-y-4">
                  <div>
                    <span className="font-mono text-[9px] text-brand-accent tracking-[0.25em] font-bold uppercase block mb-1">
                      MEMBERSHIP FOCUS
                    </span>
                    <h4 id="modal-step-title" className="font-serif text-xl md:text-2xl font-bold text-brand-text mb-1">
                      Motivation & Intent
                    </h4>
                    <p className="font-sans text-[11px] text-brand-neutral leading-relaxed">
                      This helps us customize and align program vertical loops to match your primary goal. This step feels quick and easy to complete.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Primary Reason dropdown selection */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase leading-relaxed">
                        What best describes your primary reason for joining DealSchool? <span className="text-brand-accent">*</span>
                      </label>
                      <select
                        name="primaryReason"
                        required
                        value={formData.primaryReason}
                        onChange={handleInputChange}
                        className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-11 select-none cursor-pointer animate-fadeIn"
                      >
                        <option value="">-- Choose Priority Reason --</option>
                        <option value="Explore a career in VC">Explore a career in VC</option>
                        <option value="Understand startups & investing">Understand startups & investing</option>
                        <option value="Improve startup evaluation skills">Improve startup evaluation skills</option>
                        <option value="Prepare for startup or VC internships">Prepare for startup or VC internships</option>
                        <option value="Learn directly from founders & investors">Learn directly from founders & investors</option>
                        <option value="Expand network">Expand network</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {formData.primaryReason === "Other" && (
                      <div className="space-y-1 my-3 animate-fadeIn">
                        <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Please Specify <span className="text-brand-accent">*</span></label>
                        <input
                          type="text"
                          name="primaryReasonOther"
                          required
                          value={formData.primaryReasonOther}
                          onChange={handleInputChange}
                          placeholder="Your specific motive..."
                          className="w-full bg-brand-bg text-brand-text px-3 py-2 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs h-10"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-3 bg-brand-bg hover:bg-brand-secondary/5 text-brand-neutral font-mono text-xs font-bold uppercase border border-brand-secondary/15 transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!isStepValid()}
                      className="flex-1 py-3 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-50 text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Proceed to Thinking Assessment <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: Assessment Questions */}
              {step === 4 && (
                <form onSubmit={handleNextStep} className="space-y-6 max-h-[78vh] overflow-y-auto pr-2">
                  <div>
                    <span className="font-mono text-[9px] text-brand-accent tracking-[0.25em] font-bold uppercase block mb-1">
                      Analytical Lens
                    </span>
                    <h4 id="modal-step-title" className="font-serif text-xl md:text-2xl font-bold text-brand-text mb-1">
                      Assessment & Thinking Framework
                    </h4>
                    <p className="font-sans text-[11.5px] text-brand-neutral leading-relaxed">
                      There are no right or wrong answers. We are interested in how you think about startups, investing, and decision-making.
                    </p>
                  </div>

                  <div className="space-y-6 max-w-full">
                    {/* Assessment Question 1: Textarea */}
                    <div className="space-y-2">
                      <label className="block text-xs md:text-sm font-medium text-brand-secondary leading-relaxed">
                        A startup is growing very fast but losing heavy money every month on marketing. Is this a good or bad sign and would you invest? <span className="text-brand-accent">*</span>
                      </label>
                      <textarea
                        name="assessmentQ1"
                        rows={4}
                        required
                        value={formData.assessmentQ1}
                        onChange={handleInputChange}
                        placeholder="Analyze customer acquisition costs (CAC) unit economics, payback thresholds, or market dynamics..."
                        className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs leading-relaxed min-h-[110px]"
                      />
                      <p className="text-[10px] text-brand-neutral/80 leading-normal italic font-sans">
                        Hint: We are looking for insights into CAC/LTV dynamics, payback periods, market saturation, and whether marketing burn builds genuine pricing power or just buys temporary growth.
                      </p>
                    </div>

                    {/* Assessment Question 2: Textarea */}
                    <div className="space-y-2">
                      <label className="block text-xs md:text-sm font-medium text-brand-secondary leading-relaxed">
                        If you had ₹10 lakhs to invest into ONE startup sector for the next 10 years, which sector would you choose and why? <span className="text-brand-accent">*</span>
                      </label>
                      <textarea
                        name="assessmentQ2"
                        rows={4}
                        required
                        value={formData.assessmentQ2}
                        onChange={handleInputChange}
                        placeholder="Elaborate on structural macroeconomic tailwinds, regulatory environments, and scaling parameters..."
                        className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs leading-relaxed min-h-[110px]"
                      />
                      <p className="text-[10px] text-brand-neutral/80 leading-normal italic font-sans">
                        Hint: Bring out your structural view: highlight durable macroeconomic shifts, technology transitions, market size potential, and key competitive risks.
                      </p>
                    </div>

                    {/* Assessment Question 3: Select */}
                    <div className="space-y-2">
                      <label className="block text-xs md:text-sm font-medium text-brand-secondary leading-relaxed">
                        In your opinion, what matters more in an early-stage startup? <span className="text-brand-accent">*</span>
                      </label>
                      <select
                        name="assessmentQ3"
                        required
                        value={formData.assessmentQ3}
                        onChange={handleInputChange}
                        className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-11 select-none cursor-pointer"
                      >
                        <option value="">-- Choose One Parameter --</option>
                        <option value="Founder">Founder</option>
                        <option value="Product">Product</option>
                        <option value="Market">Market</option>
                      </select>
                      <p className="text-[10px] text-brand-neutral/80 leading-normal italic font-sans">
                        Hint: Outline your core philosophy—do you favor the pedigree and resilience of the execution team (Founder), the breakthrough usability (Product), or a massive systemic demand (Market)?
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-5 py-3 bg-brand-bg hover:bg-brand-secondary/5 text-brand-neutral font-mono text-xs font-bold uppercase border border-brand-secondary/15 transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!isStepValid()}
                      className="flex-1 py-3 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-50 text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Proceed to Resume Link <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 5: Resume URL input & Discovery Source */}
              {step === 5 && (
                <form onSubmit={handleNextStep} className="space-y-5">
                  <div>
                    <span className="font-mono text-[9px] text-brand-accent tracking-[0.25em] font-bold uppercase block mb-1">
                      RESUME HANDSHAKE
                    </span>
                    <h4 id="modal-step-title" className="font-serif text-xl md:text-2xl font-bold text-brand-text mb-1">
                      Resume Link
                    </h4>
                    <p className="font-sans text-[11px] text-brand-neutral leading-relaxed">
                      Please provide a shareable Google Drive, Dropbox, OneDrive, Notion, or direct PDF link to your resume. Make sure the link is publicly accessible and does not require access approval.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Resume URL Field with real-time UI validation */}
                    <div className="space-y-1">
                      <label htmlFor="resumeLink" className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">
                        Resume Link <span className="text-brand-accent">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-4 w-4 text-brand-neutral/60" />
                        </div>
                        <input
                          id="resumeLink"
                          type="url"
                          name="resumeLink"
                          required
                          value={formData.resumeLink}
                          onChange={(e) => {
                            handleInputChange(e);
                            if (e.target.value.trim() !== "" && !isValidUrl(e.target.value)) {
                              setResumeLinkError("Please enter a valid URL starting with http:// or https://");
                            } else {
                              setResumeLinkError(null);
                            }
                          }}
                          placeholder="https://drive.google.com/..."
                          className={`w-full bg-brand-bg text-brand-text pl-9 pr-3 py-2.5 rounded-sm border focus:outline-none text-xs md:text-sm h-11 transition-all ${
                            formData.resumeLink.trim() === ""
                              ? "border-brand-secondary/15 focus:border-brand-accent"
                              : isValidUrl(formData.resumeLink)
                              ? "border-green-600 bg-green-50/5 focus:border-green-600"
                              : "border-red-600 bg-red-50/5 focus:border-red-600"
                          }`}
                        />
                      </div>

                      {resumeLinkError && (
                        <p className="text-red-700 text-[10px] font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {resumeLinkError}
                        </p>
                      )}
                      {formData.resumeLink.trim() !== "" && isValidUrl(formData.resumeLink) && (
                        <p className="text-green-700 text-[10px] font-semibold mt-1 flex items-center gap-1">
                          <Check className="h-3 w-3 shrink-0" />
                          Resume link formatted successfully
                        </p>
                      )}
                    </div>

                    {/* How did you hear about DealSchool */}
                    <div className="space-y-1">
                      <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">
                        How did you hear about DealSchool? <span className="text-brand-accent">*</span>
                      </label>
                      <select
                        name="discoverySource"
                        required
                        value={formData.discoverySource}
                        onChange={handleInputChange}
                        className="w-full bg-brand-bg text-brand-text px-3 py-2 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10 select-none cursor-pointer"
                      >
                        <option value="">-- Click To Select Origin --</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Social Media">Social Media</option>
                        <option value="College">College</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {formData.discoverySource === "Other" && (
                      <div className="space-y-1 animate-fadeIn">
                        <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Please Specify <span className="text-brand-accent">*</span></label>
                        <input
                          type="text"
                          name="discoverySourceOther"
                          required
                          value={formData.discoverySourceOther}
                          onChange={handleInputChange}
                          placeholder="Referral name, web page, or newsletter..."
                          className="w-full bg-brand-bg text-brand-text px-3 py-2 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs h-10"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="px-5 py-3 bg-brand-bg hover:bg-brand-secondary/5 text-brand-neutral font-mono text-xs font-bold uppercase border border-brand-secondary/15 transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!isStepValid() || isSubmitting}
                      className="flex-1 py-3 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-50 text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>Analyzing Credentials...</span>
                      ) : (
                        <>
                          Complete Enrollment <Sparkles className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* SUCCESS RECEIPT PAGE (Step 6) */}
              {step === 6 && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-6 text-center space-y-4"
                  id="application-success-receipt"
                >
                  <div className="mx-auto h-16 w-16 bg-brand-accent/15 border border-brand-accent rounded-full flex items-center justify-center text-brand-accent shadow-md shadow-brand-accent/10">
                    <Check className="h-8 w-8 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <span className="font-mono text-[9px] text-[#D4A62A] tracking-[0.25em] font-bold block uppercase">
                      Credentials Received
                    </span>
                    <h3 id="modal-step-title" className="font-serif text-xl md:text-2xl font-bold text-brand-text">
                      Application Submitted
                    </h3>
                    <p className="font-serif italic text-xs md:text-sm text-brand-neutral">
                      Welcome to the DealSchool Sourcing Hub, {formData.fullName}.
                    </p>
                  </div>

                  {/* Aesthetic Ledger Invoice */}
                  <div className="bg-[#FAF8F5] p-5 rounded-sm text-left border border-brand-secondary/10 max-w-sm mx-auto font-mono text-[10px] text-brand-secondary space-y-2 shadow-xs">
                    <div className="flex justify-between border-b border-brand-secondary/5 pb-1">
                      <span className="text-brand-neutral font-bold uppercase">OUTLOOK ROLE:</span>
                      <span className="font-bold text-brand-accent uppercase">{formData.currentStatus}</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-secondary/5 pb-1">
                      <span className="text-brand-neutral font-bold">COHORT CYCLE:</span>
                      <span className="font-bold text-brand-accent">FALL CYCLE 1 INCUBATE</span>
                    </div>
                    <div className="flex justify-between border-b border-brand-secondary/5 pb-1">
                      <span className="text-brand-neutral font-bold">REF ID:</span>
                      <span className="font-bold">DS-{submittedDocId.substring(0, 8).toUpperCase()}</span>
                    </div>
                    <p className="text-[9px] text-brand-neutral leading-relaxed pt-2">
                      Our selection committee, in concert with Middha Ventures General Partners, will inspect your financial and technological thesis answers. Expect interview parameters inside 5 enterprise days.
                    </p>
                  </div>

                  <button
                    onClick={resetAndClose}
                    className="mt-4 px-6 py-2.5 bg-brand-secondary hover:bg-brand-text text-[#FAFAF8] font-mono text-xs font-bold tracking-wider uppercase transition-colors duration-200 cursor-pointer"
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
