/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Check, ArrowRight, Sparkles, User, Mail, FileText,
  Phone, Globe, MapPin, UploadCloud, CheckCircle2, ChevronRight, AlertCircle, FileSpreadsheet, Loader2
} from "lucide-react";
import { CustomSelect } from "./CustomSelect";
import { API_URL } from "@shared/config";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Basic phone format: must start with + or digit, then 5–19 digits/spaces/dashes/parens
const PHONE_REGEX = /^[+\d][\d\s\-(). ]{4,18}$/;

// Basic client-side email format check — avoids firing obviously-invalid emails at the API
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DUPLICATE_CHECK_DEBOUNCE_MS = 500;

interface DuplicateFieldState {
  checking: boolean;
  alreadyApplied: boolean;
  message: string | null;
}

const INITIAL_DUPLICATE_FIELD_STATE: DuplicateFieldState = {
  checking: false,
  alreadyApplied: false,
  message: null,
};

// Character limits — above industry standard for generous UX
const LIMITS = {
  fullName: 80, mobile: 20, email: 254, linkedinUrl: 300, city: 100,
  collegeName: 150, degree: 100, graduationYear: 4, currentRole: 100,
  companyName: 150, degreeBackground: 150, yearsOfExperience: 30,
  startupName: 150, industrySector: 100, startupLinkedin: 300,
  areaOfWork: 100, freelancerLinkedin: 300, otherStatus: 300,
  primaryReasonOther: 300, assessmentQ1: 1500, assessmentQ2: 1500,
  resumeLink: 2048, discoveryOther: 200,
} as const;

const CharCount: React.FC<{ value: string; max: number }> = ({ value, max }) => {
  const len = value.length;
  const near = (max - len) < Math.ceil(max * 0.1);
  return (
    <div className="flex justify-end mt-0.5">
      <span className={`font-mono text-[9px] tabular-nums transition-colors ${near ? "text-amber-600 font-semibold" : "text-brand-neutral/35"}`}>
        {len} / {max}
      </span>
    </div>
  );
};

const INITIAL_FORM_DATA = {
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
  discoverySourceOther: "",
};

type ApplyFormData = typeof INITIAL_FORM_DATA;

// Same-device resume — remembers the in-progress draft across visits without a server round-trip
const DRAFT_STORAGE_KEY = "dealschool_apply_draft_v1";

interface StoredDraft {
  draftId: string;
  currentStep: number;
  formData: Partial<ApplyFormData>;
}

const readStoredDraft = (): StoredDraft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.draftId) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeStoredDraft = (draft: StoredDraft) => {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // localStorage unavailable (private mode, quota) — same-device resume degrades gracefully
  }
};

const clearStoredDraft = () => {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
};

// Builds the exact `fields` payload the PATCH endpoint expects for a given step,
// sending only what that step (and the applicant's chosen status branch) actually collects.
const buildStepFields = (stepNum: number, data: ApplyFormData): Record<string, unknown> => {
  if (stepNum === 2) {
    const base: Record<string, unknown> = { currentStatus: data.currentStatus };
    switch (data.currentStatus) {
      case "Student":
        return { ...base, collegeName: data.collegeName, degree: data.degree, graduationYear: data.graduationYear };
      case "Recent Graduate (0–2 years of experience)":
        return { ...base, currentRole: data.currentRole, companyName: data.companyName, graduationYear: data.graduationYear, degreeEducationalBackground: data.degreeEducationalBackground };
      case "Working Professional":
        return { ...base, currentRole: data.currentRole, companyName: data.companyName, yearsOfExperience: data.yearsOfExperience };
      case "Founder":
        return { ...base, startupName: data.startupName, industrySector: data.industrySector, startupLinkedinProfile: data.startupLinkedinProfile };
      case "Freelancer":
        return { ...base, areaOfWork: data.areaOfWork, yearsOfExperience: data.yearsOfExperience, freelancerLinkedinProfile: data.freelancerLinkedinProfile };
      case "Other":
        return { ...base, otherStatusSpecify: data.otherStatusSpecify };
      default:
        return base;
    }
  }

  if (stepNum === 3) {
    return data.primaryReason === "Other"
      ? { primaryReason: data.primaryReason, primaryReasonOther: data.primaryReasonOther }
      : { primaryReason: data.primaryReason };
  }

  if (stepNum === 4) {
    return { assessmentQ1: data.assessmentQ1, assessmentQ2: data.assessmentQ2, assessmentQ3: data.assessmentQ3 };
  }

  return {};
};

export const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedDocId, setSubmittedDocId] = useState<string>("");

  // Resume Link State
  const [resumeLinkError, setResumeLinkError] = useState<string | null>(null);

  // Terms & Conditions acknowledgement (required before final submission)
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Duplicate application check — tracked independently per field so an
  // email check result never clobbers a phone check result (and vice versa)
  const [dupCheck, setDupCheck] = useState<{
    email: DuplicateFieldState;
    phone: DuplicateFieldState;
  }>({ email: INITIAL_DUPLICATE_FIELD_STATE, phone: INITIAL_DUPLICATE_FIELD_STATE });

  // Debounce timers for the "already applied" check, one per field
  const dupCheckTimers = useRef<{ email: ReturnType<typeof setTimeout> | null; phone: ReturnType<typeof setTimeout> | null }>({
    email: null,
    phone: null,
  });

  // Server-side draft id — null until Step 1 is saved (POST /applications/draft) or a
  // cross-device draft is restored via OTP verification
  const [draftId, setDraftId] = useState<string | null>(null);

  // Cross-device recovery: phone-number lookup + OTP verification state
  const [draftLookup, setDraftLookup] = useState<{ status: "idle" | "checking" | "found" | "none"; maskedEmail: string | null }>({
    status: "idle",
    maskedEmail: null,
  });
  const [otp, setOtp] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const draftLookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref for modal container — used for focus trap
  const modalRef = useRef<HTMLDivElement>(null);

  // Form Fields
  const [formData, setFormData] = useState<ApplyFormData>(INITIAL_FORM_DATA);

  // Same-device resume — on first mount, pick up any draft left in localStorage
  // (the modal component stays mounted for the page's lifetime, so this only runs once)
  useEffect(() => {
    const stored = readStoredDraft();
    if (!stored) return;
    setDraftId(stored.draftId);
    setFormData((prev) => ({ ...prev, ...stored.formData }));
    setStep(Math.min(Math.max(stored.currentStep, 1), 5));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        handleClose();
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

  const checkDuplicate = async (field: "email" | "phone", value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setDupCheck(prev => ({ ...prev, [field]: { checking: true, alreadyApplied: false, message: null } }));
    try {
      const body = field === "email" ? { email: trimmed } : { phone: trimmed };
      const res = await fetch(`${API_URL}/applications/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        // Fail silently on 4xx/5xx — this is a UX nicety, not a hard gate
        setDupCheck(prev => ({ ...prev, [field]: { ...prev[field], checking: false } }));
        return;
      }
      const data = await res.json();
      setDupCheck(prev => ({
        ...prev,
        [field]: {
          checking: false,
          alreadyApplied: data.alreadyApplied === true,
          message: data.alreadyApplied ? (data.message ?? "You have already applied. Please wait for our team to review your application.") : null,
        },
      }));
    } catch {
      // Network error — fail silently
      setDupCheck(prev => ({ ...prev, [field]: { ...prev[field], checking: false } }));
    }
  };

  // Debounce wrapper — cancels any pending check for the field before
  // scheduling a new one, so rapid blur/refocus cycles don't pile up requests
  const scheduleDuplicateCheck = (field: "email" | "phone", value: string) => {
    const existingTimer = dupCheckTimers.current[field];
    if (existingTimer) clearTimeout(existingTimer);
    dupCheckTimers.current[field] = setTimeout(() => {
      checkDuplicate(field, value);
    }, DUPLICATE_CHECK_DEBOUNCE_MS);
  };

  // Cross-device recovery: check whether this phone number already has a saved draft.
  // Only relevant on a fresh browser/device — skipped once we already hold a draftId.
  const lookupDraft = async (mobileNumber: string) => {
    const trimmed = mobileNumber.trim();
    if (!trimmed || draftId) return;
    setDraftLookup({ status: "checking", maskedEmail: null });
    try {
      const res = await fetch(`${API_URL}/applications/draft/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: trimmed }),
      });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        setDupCheck((prev) => ({
          ...prev,
          phone: {
            checking: false,
            alreadyApplied: true,
            message: data.error || "You have already applied to DealSchool. Our team will review your application and get in touch.",
          },
        }));
        setDraftLookup({ status: "idle", maskedEmail: null });
        return;
      }

      if (!res.ok) {
        setDraftLookup({ status: "idle", maskedEmail: null });
        return;
      }

      const data = await res.json();
      setDraftLookup(data.found ? { status: "found", maskedEmail: data.maskedEmail } : { status: "none", maskedEmail: null });
    } catch {
      // Network error — fail silently, this is a UX nicety, not a hard gate
      setDraftLookup({ status: "idle", maskedEmail: null });
    }
  };

  const scheduleDraftLookup = (mobileNumber: string) => {
    if (draftLookupTimer.current) clearTimeout(draftLookupTimer.current);
    draftLookupTimer.current = setTimeout(() => lookupDraft(mobileNumber), DUPLICATE_CHECK_DEBOUNCE_MS);
  };

  const dismissDraftLookup = () => {
    setDraftLookup({ status: "idle", maskedEmail: null });
    setOtp("");
    setOtpError(null);
  };

  const resendDraftOtp = () => {
    setOtp("");
    setOtpError(null);
    lookupDraft(formData.mobileNumber);
  };

  const verifyDraftOtp = async () => {
    const trimmed = otp.trim();
    if (!trimmed) return;
    setOtpVerifying(true);
    setOtpError(null);
    try {
      const res = await fetch(`${API_URL}/applications/draft/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: formData.mobileNumber.trim(), otp: trimmed }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setOtpError(data.error || "Invalid code. Please try again.");
        return;
      }

      const restoredFormData: ApplyFormData = { ...formData, ...data.formData };
      setFormData(restoredFormData);
      setDraftId(data.draftId);
      setDraftLookup({ status: "idle", maskedEmail: null });
      setOtp("");
      const nextStep = Math.min(Math.max(Number(data.currentStep) || 1, 1), 5);
      writeStoredDraft({ draftId: data.draftId, currentStep: nextStep, formData: restoredFormData });
      setStep(nextStep);
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Step validation check gates
  const isStepValid = () => {
    if (step === 1) {
      return (
        draftLookup.status !== "found" &&
        !dupCheck.email.alreadyApplied &&
        !dupCheck.phone.alreadyApplied &&
        formData.fullName.trim() !== "" &&
        PHONE_REGEX.test(formData.mobileNumber.trim()) &&
        EMAIL_REGEX.test(formData.email.trim()) &&
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
            formData.industrySector.trim() !== ""
          );
        case "Freelancer":
          return (
            formData.areaOfWork.trim() !== "" &&
            formData.yearsOfExperience.trim() !== ""
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
      return resumeOk && sourceOk && agreedToTerms;
    }

    return true;
  };

  // Step 1 "Continue" — creates (or upserts, if resubmitted in the same session) the server draft
  const createOrResumeDraft = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`${API_URL}/applications/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          email: formData.email.trim(),
          linkedinUrl: formData.linkedinUrl.trim(),
          city: formData.city.trim(),
        }),
      });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        setDupCheck((prev) => ({
          ...prev,
          email: {
            checking: false,
            alreadyApplied: true,
            message: data.error || "You have already applied to DealSchool. Our team will review your application and get in touch.",
          },
        }));
        return;
      }
      if (res.status === 429) {
        setErrorMessage("Too many attempts from your connection. Please wait a few minutes and try again.");
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
        throw new Error(err.error || `Server error (${res.status})`);
      }

      const { draftId: newDraftId } = await res.json();
      setDraftId(newDraftId);
      writeStoredDraft({ draftId: newDraftId, currentStep: 2, formData });
      setStep(2);
      setErrorMessage(null);
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Steps 2–4 "Continue" — saves that step's fields, but never blocks navigation on the result
  const patchDraftStep = (stepNum: number) => {
    if (!draftId) return;
    const fields = buildStepFields(stepNum, formData);
    writeStoredDraft({ draftId, currentStep: stepNum + 1, formData });
    fetch(`${API_URL}/applications/draft/${draftId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: stepNum, fields }),
    }).catch((err) => console.error("Draft step save failed (non-fatal):", err));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid()) return;

    if (step === 1) {
      createOrResumeDraft();
      return;
    }

    if (step >= 2 && step <= 4) {
      patchDraftStep(step);
      setStep((curr) => curr + 1);
      setErrorMessage(null);
      return;
    }

    submitForm();
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    if (!isStepValid()) {
      setIsSubmitting(false);
      setErrorMessage("Form validation failed. Please make sure all fields are correctly formatted.");
      return;
    }

    if (!draftId) {
      setIsSubmitting(false);
      setErrorMessage("Your session could not be found. Please review your details and try again.");
      setStep(1);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/applications/draft/${draftId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeUrl: formData.resumeLink,
          discoverySource: formData.discoverySource,
          discoverySourceOther: formData.discoverySourceOther,
        }),
      });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        setDupCheck(prev => ({
          ...prev,
          email: {
            checking: false,
            alreadyApplied: true,
            message: data.error || "You have already applied to DealSchool. Our team will review your application and get in touch.",
          },
        }));
        setStep(1);
        return;
      }
      if (res.status === 404) {
        clearStoredDraft();
        setDraftId(null);
        setErrorMessage("Your saved progress could not be found. Please review your details and try again.");
        setStep(1);
        return;
      }
      if (res.status === 429) {
        setErrorMessage("Too many submissions from your connection. Please wait a few minutes and try again.");
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
        throw new Error(err.error || `Server error (${res.status})`);
      }

      const { applicationId } = await res.json();
      setSubmittedDocId(applicationId);
      clearStoredDraft();
      setStep(6);
    } catch (error: any) {
      console.error("Application submission error:", error.message);
      setErrorMessage(error.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Closing the modal mid-flow (X, backdrop, Escape) keeps the draft intact for same-device
  // resume — only a completed submission (see handleBackToWebsite) wipes local state.
  const handleClose = () => {
    if (dupCheckTimers.current.email) clearTimeout(dupCheckTimers.current.email);
    if (dupCheckTimers.current.phone) clearTimeout(dupCheckTimers.current.phone);
    if (draftLookupTimer.current) clearTimeout(draftLookupTimer.current);
    onClose();
  };

  const handleBackToWebsite = () => {
    handleClose();
    clearStoredDraft();
    // Wait for exit transition to clean up state
    setTimeout(() => {
      setStep(1);
      setDraftId(null);
      setResumeLinkError(null);
      setErrorMessage(null);
      setSubmittedDocId("");
      setAgreedToTerms(false);
      setDupCheck({ email: INITIAL_DUPLICATE_FIELD_STATE, phone: INITIAL_DUPLICATE_FIELD_STATE });
      setDraftLookup({ status: "idle", maskedEmail: null });
      setOtp("");
      setOtpError(null);
      setFormData(INITIAL_FORM_DATA);
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
            onClick={handleClose}
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
              className={`w-full bg-brand-bg border border-brand-secondary/15 rounded-sm shadow-2xl relative ${step === 6 ? 'max-w-md p-8' : 'max-w-2xl p-6 md:p-10'}`}
            >
              <button
                onClick={handleClose}
                aria-label="Close application form"
                className="absolute top-4 right-4 p-1.5 rounded-sm hover:bg-brand-secondary/5 text-brand-neutral hover:text-brand-text transition-all cursor-pointer"
                id="modal-close-btn"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Step progress indicator */}
              {step < 6 && (
                <div className="mb-8">
                  <div className="flex items-center">
                    {([
                      { n: 1, label: "Personal" },
                      { n: 2, label: "Background" },
                      { n: 3, label: "Motivation" },
                      { n: 4, label: "Assessment" },
                      { n: 5, label: "Documents" },
                    ] as const).map(({ n, label }, i) => (
                      <React.Fragment key={n}>
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-bold transition-all duration-200 shrink-0 ${
                            step > n
                              ? "bg-brand-secondary text-white"
                              : step === n
                              ? "bg-brand-accent text-white shadow-md shadow-brand-accent/30"
                              : "bg-brand-secondary/8 text-brand-neutral/50"
                          }`}>
                            {step > n ? <Check className="h-3 w-3" /> : n}
                          </div>
                          <span className={`font-mono text-[8px] uppercase tracking-wider hidden sm:block select-none transition-colors ${
                            step === n ? "text-brand-accent font-bold" : step > n ? "text-brand-secondary/70" : "text-brand-neutral/35"
                          }`}>{label}</span>
                        </div>
                        {i < 4 && (
                          <div className={`h-px flex-1 mb-4 mx-1 transition-all duration-300 ${step > n ? "bg-brand-secondary/40" : "bg-brand-secondary/10"}`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
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
                <form onSubmit={handleNextStep} className="space-y-5">
                  <div className="border-b border-brand-secondary/8 pb-4">
                    <span className="font-mono text-[9px] text-brand-accent tracking-[0.12em] font-bold uppercase block mb-1">
                      Admissions Flow 2026
                    </span>
                    <h4 id="modal-step-title" className="font-serif text-xl md:text-2xl font-bold text-brand-text mb-1">
                      Candidate Specifications
                    </h4>
                    <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                      DealSchool admits ambitious candidates matching rigorous venture criteria. Fields marked <span className="text-brand-accent font-semibold">*</span> are required.
                    </p>
                  </div>

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
                          name="fullName"
                          required
                          maxLength={LIMITS.fullName}
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Your full legal name"
                          className="w-full bg-white text-brand-text pl-9 pr-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm transition-all h-11"
                        />
                      </div>
                      <CharCount value={formData.fullName} max={LIMITS.fullName} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Mobile Number */}
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider">
                          Mobile Number <span className="text-brand-accent">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral/60 pointer-events-none" />
                          <input
                            type="tel"
                            name="mobileNumber"
                            required
                            maxLength={LIMITS.mobile}
                            value={formData.mobileNumber}
                            onChange={(e) => {
                              handleInputChange(e);
                              if (dupCheck.phone.alreadyApplied || dupCheck.phone.checking) {
                                setDupCheck(prev => ({ ...prev, phone: INITIAL_DUPLICATE_FIELD_STATE }));
                              }
                              if (draftLookup.status !== "idle") {
                                setDraftLookup({ status: "idle", maskedEmail: null });
                                setOtp("");
                                setOtpError(null);
                              }
                            }}
                            onBlur={() => {
                              if (PHONE_REGEX.test(formData.mobileNumber.trim())) {
                                scheduleDuplicateCheck("phone", formData.mobileNumber);
                                if (!draftId) scheduleDraftLookup(formData.mobileNumber);
                              }
                            }}
                            placeholder="+91 98765 43210"
                            className={`w-full bg-white text-brand-text pl-9 pr-3 py-3 rounded-sm border focus:outline-none focus:ring-2 text-sm h-11 transition-all ${
                              formData.mobileNumber && !PHONE_REGEX.test(formData.mobileNumber.trim())
                                ? "border-red-400 focus:border-red-400 focus:ring-red-400/10"
                                : "border-brand-secondary/15 focus:border-brand-accent focus:ring-brand-accent/10"
                            }`}
                          />
                        </div>
                        {formData.mobileNumber && !PHONE_REGEX.test(formData.mobileNumber.trim()) && (
                          <p className="text-red-600 text-[10px] flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            e.g. +91 98765 43210
                          </p>
                        )}
                        {dupCheck.phone.checking && (
                          <p className="text-brand-neutral/50 text-[10px] font-mono flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Checking...
                          </p>
                        )}
                        {draftLookup.status === "checking" && (
                          <p className="text-brand-neutral/50 text-[10px] font-mono flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Checking for a saved application...
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
                            maxLength={LIMITS.email}
                            value={formData.email}
                            onChange={(e) => {
                              handleInputChange(e);
                              if (dupCheck.email.alreadyApplied || dupCheck.email.checking) {
                                setDupCheck(prev => ({ ...prev, email: INITIAL_DUPLICATE_FIELD_STATE }));
                              }
                            }}
                            onBlur={() => {
                              if (EMAIL_REGEX.test(formData.email.trim())) {
                                scheduleDuplicateCheck("email", formData.email);
                              }
                            }}
                            placeholder="yourname@example.com"
                            className="w-full bg-white text-brand-text pl-9 pr-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm h-11 transition-all"
                          />
                        </div>
                        {dupCheck.email.checking && (
                          <p className="text-brand-neutral/50 text-[10px] font-mono flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Checking...
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* LinkedIn URL */}
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider">
                          LinkedIn Profile <span className="text-brand-neutral/40 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral/60 pointer-events-none" />
                          <input
                            type="url"
                            name="linkedinUrl"
                            maxLength={LIMITS.linkedinUrl}
                            value={formData.linkedinUrl}
                            onChange={handleInputChange}
                            placeholder="linkedin.com/in/username"
                            className="w-full bg-white text-brand-text pl-9 pr-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm h-11 transition-all"
                          />
                        </div>
                        <p className="text-[10px] text-brand-neutral/50 font-sans">Include https://</p>
                      </div>

                      {/* City */}
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider">
                          City / Location <span className="text-brand-accent">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral/60 pointer-events-none" />
                          <input
                            type="text"
                            name="city"
                            required
                            maxLength={LIMITS.city}
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Mumbai, Delhi, Pune..."
                            className="w-full bg-white text-brand-text pl-9 pr-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm h-11 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cross-device recovery — a saved draft was found for this phone number; OTP gates Continue via isStepValid */}
                  {draftLookup.status === "found" && (
                    <div className="flex flex-col gap-3 p-4 bg-brand-secondary/[0.04] border border-brand-secondary/15 rounded-sm">
                      <div className="flex items-start gap-3">
                        <FileSpreadsheet className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
                        <div>
                          <p className="font-mono text-[10px] font-bold text-brand-text uppercase tracking-wider">Saved Application Found</p>
                          <p className="font-sans text-xs text-brand-neutral leading-relaxed mt-1">
                            We found a previously started application for this number. Enter the code sent to{" "}
                            <span className="font-semibold text-brand-text">{draftLookup.maskedEmail}</span> to resume where you left off.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 items-start">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="6-digit code"
                          className="flex-1 bg-white text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-sm h-10 tracking-widest font-mono"
                        />
                        <button
                          type="button"
                          onClick={verifyDraftOtp}
                          disabled={otp.trim().length < 4 || otpVerifying}
                          className="px-4 h-10 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-[10px] font-bold uppercase rounded-sm transition-all cursor-pointer shrink-0"
                        >
                          {otpVerifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Verify"}
                        </button>
                      </div>
                      {otpError && (
                        <p className="text-red-600 text-[10px] flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {otpError}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={resendDraftOtp} className="font-mono text-[9px] text-brand-accent hover:underline cursor-pointer">
                          Resend code
                        </button>
                        <button type="button" onClick={dismissDraftLookup} className="font-mono text-[9px] text-brand-neutral hover:underline cursor-pointer">
                          Not you? Continue as a new applicant
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Duplicate application warning — inline, non-blocking notice (Continue is disabled via isStepValid) */}
                  {(dupCheck.email.alreadyApplied || dupCheck.phone.alreadyApplied) && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-sm">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-mono text-[10px] font-bold text-amber-800 uppercase tracking-wider">Already Applied</p>
                        <p className="font-sans text-xs text-amber-700 leading-relaxed">
                          {(dupCheck.email.message || dupCheck.phone.message || "").replace("admin@dealschool.in", "").trim()}
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!isStepValid() || dupCheck.email.checking || dupCheck.phone.checking || draftLookup.status === "checking" || isSubmitting}
                    className="w-full py-3.5 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-40 disabled:cursor-not-allowed text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer rounded-sm"
                  >
                    {isSubmitting ? <span>Saving...</span> : <>Continue to Background <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>
              )}

              {/* STEP 2: Current Status & Conditional Fields */}
              {step === 2 && (
                <form onSubmit={handleNextStep} className="space-y-5">
                  <div className="border-b border-brand-secondary/8 pb-4">
                    <span className="font-mono text-[9px] text-brand-accent tracking-[0.12em] font-bold uppercase block mb-1">
                      Functional Position
                    </span>
                    <h4 id="modal-step-title" className="font-serif text-xl md:text-2xl font-bold text-brand-text mb-1">
                      Professional Background
                    </h4>
                    <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                      Select your current professional status, then complete the relevant fields below.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Status Select */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider">
                        Current Status <span className="text-brand-accent">*</span>
                      </label>
                      <CustomSelect
                        value={formData.currentStatus}
                        onChange={(value) => setFormData((prev) => ({ ...prev, currentStatus: value }))}
                        placeholder="-- Click To Choose --"
                        className="bg-white text-brand-text px-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm h-11 transition-all"
                        options={[
                          { value: "Student", label: "Student" },
                          { value: "Recent Graduate (0–2 years of experience)", label: "Recent Graduate (0–2 years of experience)" },
                          { value: "Working Professional", label: "Working Professional" },
                          { value: "Founder", label: "Founder" },
                          { value: "Freelancer", label: "Freelancer" },
                          { value: "Other", label: "Other" },
                        ]}
                      />
                    </div>

                    {/* DYNAMIC CONDITIONAL SHORT-ANSWER FIELDS */}
                    {formData.currentStatus && (
                      <div className="bg-brand-secondary/[0.03] border border-brand-secondary/10 rounded-sm p-4">
                        <span className="font-mono text-[8px] text-brand-secondary/60 uppercase tracking-widest block mb-3">
                          {formData.currentStatus}: Additional Details
                        </span>
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
                              maxLength={LIMITS.collegeName}
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
                               maxLength={LIMITS.degree}
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
                               maxLength={LIMITS.graduationYear}
                               inputMode="numeric"
                               pattern="\d{4}"
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
                               maxLength={LIMITS.currentRole}
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
                               maxLength={LIMITS.companyName}
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
                               maxLength={LIMITS.graduationYear}
                               inputMode="numeric"
                               pattern="\d{4}"
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
                               maxLength={LIMITS.degreeBackground}
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
                               maxLength={LIMITS.currentRole}
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
                               maxLength={LIMITS.companyName}
                               value={formData.companyName}
                               onChange={handleInputChange}
                               placeholder="HDFC Bank"
                               className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Years of Experience <span className="text-brand-accent">*</span></label>
                            <CustomSelect
                              value={formData.yearsOfExperience}
                              onChange={(value) => setFormData((prev) => ({ ...prev, yearsOfExperience: value }))}
                              placeholder="Select years of experience..."
                              className="bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              options={[
                                { value: "0–2 years", label: "0–2 years" },
                                { value: "2–5 years", label: "2–5 years" },
                                { value: "5+ years", label: "5+ years" },
                              ]}
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
                               maxLength={LIMITS.startupName}
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
                               maxLength={LIMITS.industrySector}
                               value={formData.industrySector}
                               onChange={handleInputChange}
                               placeholder="Fintech Infrastructure"
                               className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Startup LinkedIn Profile <span className="text-brand-neutral/40 font-normal">(Optional)</span></label>
                            <input
                              type="url"
                              name="startupLinkedinProfile"
                              maxLength={LIMITS.startupLinkedin}
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
                               maxLength={LIMITS.areaOfWork}
                               value={formData.areaOfWork}
                               onChange={handleInputChange}
                               placeholder="Solidity Audits"
                               className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">Years of Experience <span className="text-brand-accent">*</span></label>
                              <CustomSelect
                                value={formData.yearsOfExperience}
                                onChange={(value) => setFormData((prev) => ({ ...prev, yearsOfExperience: value }))}
                                placeholder="Select years of experience..."
                                className="bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                                options={[
                                  { value: "0–2 years", label: "0–2 years" },
                                  { value: "2–5 years", label: "2–5 years" },
                                  { value: "5+ years", label: "5+ years" },
                                ]}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase">LinkedIn Profile <span className="text-brand-neutral/40 font-normal">(Optional)</span></label>
                            <input
                              type="url"
                              name="freelancerLinkedinProfile"
                              maxLength={LIMITS.freelancerLinkedin}
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
                              maxLength={LIMITS.otherStatus}
                              value={formData.otherStatusSpecify}
                              onChange={handleInputChange}
                              placeholder="Briefly state your unique professional archetype..."
                              className="w-full bg-brand-bg text-brand-text px-3 py-2.5 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent text-xs md:text-sm h-10"
                            />
                            <CharCount value={formData.otherStatusSpecify} max={LIMITS.otherStatus} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-3 bg-white hover:bg-brand-secondary/5 text-brand-neutral font-mono text-xs font-bold uppercase border border-brand-secondary/15 rounded-sm transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!isStepValid()}
                      className="flex-1 py-3.5 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-40 disabled:cursor-not-allowed text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer rounded-sm"
                    >
                      Continue to Motivation <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Motivation & Intent */}
              {step === 3 && (
                <form onSubmit={handleNextStep} className="space-y-5">
                  <div className="border-b border-brand-secondary/8 pb-4">
                    <span className="font-mono text-[9px] text-brand-accent tracking-[0.12em] font-bold uppercase block mb-1">
                      Membership Focus
                    </span>
                    <h4 id="modal-step-title" className="font-serif text-xl md:text-2xl font-bold text-brand-text mb-1">
                      Motivation & Intent
                    </h4>
                    <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                      This helps us align the program to your primary goal. One selection required.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider">
                        Primary reason for joining DealSchool <span className="text-brand-accent">*</span>
                      </label>
                      <CustomSelect
                        value={formData.primaryReason}
                        onChange={(value) => setFormData((prev) => ({ ...prev, primaryReason: value }))}
                        placeholder="Select the closest option..."
                        className="bg-white text-brand-text px-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm h-11 transition-all"
                        options={[
                          { value: "Explore a career in VC", label: "Explore a career in VC" },
                          { value: "Understand startups & investing", label: "Understand startups & investing" },
                          { value: "Improve startup evaluation skills", label: "Improve startup evaluation skills" },
                          { value: "Prepare for startup or VC internships", label: "Prepare for startup or VC internships" },
                          { value: "Learn directly from founders & investors", label: "Learn directly from founders & investors" },
                          { value: "Expand network", label: "Expand network" },
                          { value: "Other", label: "Other (please specify)" },
                        ]}
                      />
                    </div>

                    {formData.primaryReason === "Other" && (
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider">
                          Please Specify <span className="text-brand-accent">*</span>
                        </label>
                        <input
                          type="text"
                          name="primaryReasonOther"
                          required
                          maxLength={LIMITS.primaryReasonOther}
                          value={formData.primaryReasonOther}
                          onChange={handleInputChange}
                          placeholder="Describe your specific reason..."
                          className="w-full bg-white text-brand-text px-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm h-11 transition-all"
                        />
                        <CharCount value={formData.primaryReasonOther} max={LIMITS.primaryReasonOther} />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-3.5 bg-white hover:bg-brand-secondary/5 text-brand-neutral font-mono text-xs font-bold uppercase border border-brand-secondary/15 rounded-sm transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!isStepValid()}
                      className="flex-1 py-3.5 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-40 disabled:cursor-not-allowed text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer rounded-sm"
                    >
                      Continue to Assessment <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: Assessment Questions */}
              {step === 4 && (
                <form onSubmit={handleNextStep} className="space-y-5">
                  <div className="border-b border-brand-secondary/8 pb-4">
                    <span className="font-mono text-[9px] text-brand-accent tracking-[0.12em] font-bold uppercase block mb-1">
                      Analytical Lens
                    </span>
                    <h4 id="modal-step-title" className="font-serif text-xl md:text-2xl font-bold text-brand-text mb-1">
                      Thinking Assessment
                    </h4>
                    <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                      No right or wrong answers. We want to see how you reason about startups and investing. Write freely.
                    </p>
                  </div>

                  <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin">
                    {/* Q1 */}
                    <div className="space-y-2">
                      <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider leading-relaxed">
                        Q1: A startup grows fast but burns heavy cash on marketing. Good or bad sign, would you invest? <span className="text-brand-accent">*</span>
                      </label>
                      <textarea
                        name="assessmentQ1"
                        rows={5}
                        required
                        maxLength={LIMITS.assessmentQ1}
                        value={formData.assessmentQ1}
                        onChange={handleInputChange}
                        placeholder="Think about CAC, LTV, payback periods, unit economics, market saturation..."
                        className="w-full bg-white text-brand-text px-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm leading-relaxed resize-none"
                      />
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-[10px] text-brand-neutral/60 leading-normal font-sans flex-1 italic">
                          Hint: CAC/LTV dynamics, payback periods, and whether burn creates real pricing power or buys temporary growth.
                        </p>
                        <CharCount value={formData.assessmentQ1} max={LIMITS.assessmentQ1} />
                      </div>
                    </div>

                    {/* Q2 */}
                    <div className="space-y-2">
                      <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider leading-relaxed">
                        Q2: If you had ₹10 lakhs to invest in ONE startup sector for 10 years, which and why? <span className="text-brand-accent">*</span>
                      </label>
                      <textarea
                        name="assessmentQ2"
                        rows={5}
                        required
                        maxLength={LIMITS.assessmentQ2}
                        value={formData.assessmentQ2}
                        onChange={handleInputChange}
                        placeholder="Think about macro tailwinds, regulation, market size, competitive dynamics..."
                        className="w-full bg-white text-brand-text px-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm leading-relaxed resize-none"
                      />
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-[10px] text-brand-neutral/60 leading-normal font-sans flex-1 italic">
                          Hint: Durable macro shifts, tech transitions, market scale potential, and key competitive risks.
                        </p>
                        <CharCount value={formData.assessmentQ2} max={LIMITS.assessmentQ2} />
                      </div>
                    </div>

                    {/* Q3 */}
                    <div className="space-y-2">
                      <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider">
                        Q3: In an early-stage startup, what matters most? <span className="text-brand-accent">*</span>
                      </label>
                      <CustomSelect
                        value={formData.assessmentQ3}
                        onChange={(value) => setFormData((prev) => ({ ...prev, assessmentQ3: value }))}
                        placeholder="Choose your conviction..."
                        className="bg-white text-brand-text px-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm h-11 transition-all"
                        options={[
                          { value: "Founder", label: "Founder: team, grit, pedigree" },
                          { value: "Product", label: "Product: usability, differentiation" },
                          { value: "Market", label: "Market: size, demand, tailwind" },
                        ]}
                      />
                      <p className="text-[10px] text-brand-neutral/60 leading-normal font-sans italic">
                        Hint: Execution team resilience (Founder), breakthrough usability (Product), or massive systemic demand (Market)?
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-5 py-3.5 bg-white hover:bg-brand-secondary/5 text-brand-neutral font-mono text-xs font-bold uppercase border border-brand-secondary/15 rounded-sm transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!isStepValid()}
                      className="flex-1 py-3.5 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-40 disabled:cursor-not-allowed text-[#FAFAF8] font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer rounded-sm"
                    >
                      Continue to Resume <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 5: Resume URL input & Discovery Source */}
              {step === 5 && (
                <form onSubmit={handleNextStep} className="space-y-5">
                  <div className="border-b border-brand-secondary/8 pb-4">
                    <span className="font-mono text-[9px] text-brand-accent tracking-[0.12em] font-bold uppercase block mb-1">
                      Final Step
                    </span>
                    <h4 id="modal-step-title" className="font-serif text-xl md:text-2xl font-bold text-brand-text mb-1">
                      Resume & Discovery
                    </h4>
                    <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                      Share a publicly accessible link to your resume: Google Drive, Dropbox, or direct PDF. Ensure "Anyone with the link" can view it.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Resume URL */}
                    <div className="space-y-1.5">
                      <label htmlFor="resumeLink" className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider">
                        Resume Link <span className="text-brand-accent">*</span>
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral/60 pointer-events-none" />
                        <input
                          id="resumeLink"
                          type="url"
                          name="resumeLink"
                          required
                          maxLength={LIMITS.resumeLink}
                          value={formData.resumeLink}
                          onChange={(e) => {
                            handleInputChange(e);
                            if (e.target.value.trim() !== "" && !isValidUrl(e.target.value)) {
                              setResumeLinkError("Please enter a valid URL starting with https://");
                            } else {
                              setResumeLinkError(null);
                            }
                          }}
                          placeholder="https://drive.google.com/file/..."
                          className={`w-full bg-white text-brand-text pl-9 pr-3 py-3 rounded-sm border focus:outline-none focus:ring-2 text-sm h-11 transition-all ${
                            formData.resumeLink.trim() === ""
                              ? "border-brand-secondary/15 focus:border-brand-accent focus:ring-brand-accent/10"
                              : isValidUrl(formData.resumeLink)
                              ? "border-green-500 focus:border-green-500 focus:ring-green-400/15"
                              : "border-red-400 focus:border-red-400 focus:ring-red-400/10"
                          }`}
                        />
                      </div>
                      {resumeLinkError && (
                        <p className="text-red-600 text-[10px] flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {resumeLinkError}
                        </p>
                      )}
                      {formData.resumeLink.trim() !== "" && isValidUrl(formData.resumeLink) && (
                        <p className="text-green-700 text-[10px] flex items-center gap-1 font-semibold">
                          <Check className="h-3 w-3 shrink-0" />
                          Valid resume link
                        </p>
                      )}
                    </div>

                    {/* Discovery Source */}
                    <div className="space-y-1.5">
                      <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider">
                        How did you hear about DealSchool? <span className="text-brand-accent">*</span>
                      </label>
                      <CustomSelect
                        value={formData.discoverySource}
                        onChange={(value) => setFormData((prev) => ({ ...prev, discoverySource: value }))}
                        placeholder="Select how you found us..."
                        className="bg-white text-brand-text px-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm h-11 transition-all"
                        options={[
                          { value: "LinkedIn", label: "LinkedIn" },
                          { value: "Social Media", label: "Social Media (Instagram / Twitter)" },
                          { value: "College", label: "College / Campus" },
                          { value: "Friend / Referral", label: "Friend / Referral" },
                          { value: "Other", label: "Other" },
                        ]}
                      />
                    </div>

                    {formData.discoverySource === "Other" && (
                      <div className="space-y-1.5">
                        <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider">
                          Please Specify <span className="text-brand-accent">*</span>
                        </label>
                        <input
                          type="text"
                          name="discoverySourceOther"
                          required
                          maxLength={LIMITS.discoveryOther}
                          value={formData.discoverySourceOther}
                          onChange={handleInputChange}
                          placeholder="Referral name, website, newsletter..."
                          className="w-full bg-white text-brand-text px-3 py-3 rounded-sm border border-brand-secondary/15 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 text-sm h-11 transition-all"
                        />
                        <CharCount value={formData.discoverySourceOther} max={LIMITS.discoveryOther} />
                      </div>
                    )}

                    {/* Terms & Conditions consent */}
                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        id="agreeTerms"
                        type="checkbox"
                        required
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border border-brand-secondary/30 text-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20 cursor-pointer"
                      />
                      <label htmlFor="agreeTerms" className="font-sans text-xs text-brand-neutral leading-relaxed cursor-pointer select-none">
                        I have read and agree to the{" "}
                        <a
                          href="/terms-and-conditions"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-brand-accent font-semibold underline hover:text-brand-text transition-colors"
                        >
                          Terms &amp; Conditions
                        </a>{" "}
                        <span className="text-brand-accent">*</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="px-5 py-3.5 bg-white hover:bg-brand-secondary/5 text-brand-neutral font-mono text-xs font-bold uppercase border border-brand-secondary/15 rounded-sm transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!isStepValid() || isSubmitting}
                      className="flex-1 py-3.5 bg-brand-accent hover:bg-[#c49620] disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer rounded-sm shadow-md shadow-brand-accent/20"
                    >
                      {isSubmitting ? (
                        <span>Submitting Application...</span>
                      ) : (
                        <>
                          Submit Application <Sparkles className="h-4 w-4" />
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
                  className="py-2 text-center space-y-5"
                  id="application-success-receipt"
                >
                  {/* Icon */}
                  <div className="mx-auto h-14 w-14 bg-brand-accent/15 border border-brand-accent/40 rounded-full flex items-center justify-center text-brand-accent">
                    <Check className="h-6 w-6" strokeWidth={2.5} />
                  </div>

                  {/* Heading */}
                  <div className="space-y-1.5">
                    <h3 id="modal-step-title" className="font-serif text-2xl md:text-3xl font-bold text-brand-text">
                      Application Submitted
                    </h3>
                    <p className="font-sans text-sm text-brand-neutral">
                      Welcome to DealSchool, <span className="font-semibold text-brand-text">{formData.fullName}</span>.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="w-12 h-px bg-brand-accent/40 mx-auto" />

                  {/* What happens next */}
                  <div className="bg-[#F7F5F1] border border-brand-secondary/10 rounded-sm px-6 py-5 text-left space-y-3 max-w-sm mx-auto">
                    <p className="font-mono text-[9px] text-brand-accent uppercase tracking-[0.1em] font-bold">What Happens Next</p>
                    <ul className="space-y-2.5">
                      {[
                        "Our team will review your application within 5 business days.",
                        "Shortlisted applicants will receive an interview invite by email.",
                        "Selected fellows are confirmed before the cohort start date.",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-0.5 h-4 w-4 rounded-full bg-brand-accent/15 border border-brand-accent/30 text-brand-accent font-mono text-[8px] font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="font-sans text-xs text-brand-neutral leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleBackToWebsite}
                    className="px-8 py-3 bg-brand-secondary hover:bg-brand-text text-[#FAFAF8] font-mono text-xs font-bold tracking-wider uppercase transition-colors duration-200 cursor-pointer"
                  >
                    Back to Website
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
