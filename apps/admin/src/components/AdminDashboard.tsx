import React, { useState, useEffect, useCallback, useRef } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, logOutAdmin } from "@shared/firebase";
import { FellowshipApplication, ContactMessage } from "@shared/types";
import { AdminChangePassword } from "./AdminChangePassword";
import { CohortSettingsPanel } from "./CohortSettingsPanel";
import { CustomSelect } from "./CustomSelect";
import dealschoolLogo from "../assets/images/dealschool_logo_1781074477214.png";
import { API_URL, WEBSITE_URL } from "@shared/config";
import {
  Search, ShieldAlert, LogOut, X, Mail, Trash2,
  AlertTriangle, CheckCircle2, User, ExternalLink,
  MessageSquare, KeyRound, CreditCard, RefreshCw,
  ArrowLeft, Phone, MapPin, FileText, Clock,
  Eye, Users, Ban, CalendarCog,
} from "lucide-react";

const goToSite = () => {
  window.location.href = WEBSITE_URL;
};

const getInitials = (name: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0][0] ?? "?").toUpperCase();
  return ((parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")).toUpperCase();
};

// Status config used by both row and detail panel
const APP_STATUS_CFG: Record<string, {
  dot: string; label: string;
  badge: string; darkBadge: string;
  avatarRing: string; avatarBg: string; avatarText: string;
}> = {
  pending:           { dot: "bg-amber-400",       label: "Pending",   badge: "bg-amber-50 text-amber-700 border border-amber-200",      darkBadge: "bg-[#D4A62A]/25 text-[#D4A62A] border border-[#D4A62A]/40",      avatarRing: "ring-amber-300",   avatarBg: "bg-[#D4A62A]/10",   avatarText: "text-[#D4A62A]" },
  under_review:      { dot: "bg-brand-secondary",  label: "Auditing",  badge: "bg-blue-50 text-blue-700 border border-blue-200",         darkBadge: "bg-sky-400/20 text-sky-300 border border-sky-400/30",             avatarRing: "ring-blue-400",    avatarBg: "bg-brand-secondary/10",    avatarText: "text-brand-secondary" },
  interview_invited: { dot: "bg-purple-500",       label: "Interview", badge: "bg-purple-50 text-purple-700 border border-purple-200",   darkBadge: "bg-purple-400/20 text-purple-300 border border-purple-400/30",    avatarRing: "ring-purple-400",  avatarBg: "bg-purple-100",  avatarText: "text-purple-700" },
  accepted:          { dot: "bg-emerald-500",      label: "Accepted",  badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",darkBadge: "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30", avatarRing: "ring-emerald-400", avatarBg: "bg-emerald-100", avatarText: "text-emerald-700" },
  declined:          { dot: "bg-red-500",          label: "Declined",  badge: "bg-red-50 text-red-600 border border-red-200",            darkBadge: "bg-red-400/20 text-red-300 border border-red-400/30",             avatarRing: "ring-red-400",     avatarBg: "bg-red-100",     avatarText: "text-red-700" },
  cancelled:         { dot: "bg-gray-400",         label: "Cancelled", badge: "bg-gray-100 text-gray-600 border border-gray-300",        darkBadge: "bg-white/10 text-white/60 border border-white/20",                avatarRing: "ring-gray-300",    avatarBg: "bg-gray-100",    avatarText: "text-gray-600" },
};

const CONTACT_STATUS_CFG: Record<string, { dot: string; label: string; badge: string; darkBadge: string }> = {
  unread:   { dot: "bg-blue-500",          label: "Unread",    badge: "bg-blue-50 text-blue-700 border border-blue-200",    darkBadge: "bg-sky-400/20 text-sky-300 border border-sky-400/30" },
  read:     { dot: "bg-brand-neutral/40",  label: "Read",      badge: "bg-gray-50 text-gray-500 border border-gray-200",     darkBadge: "bg-white/15 text-white/70 border border-white/20" },
  archived: { dot: "bg-brand-neutral/20",  label: "Archived",  badge: "bg-gray-50 text-gray-400 border border-gray-150",     darkBadge: "bg-white/10 text-white/50 border border-white/15" },
};

// Reusable section header — left accent bar
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-[3px] h-3.5 bg-[#D4A62A] rounded-full shrink-0" />
    <span className="font-mono text-[9px] text-[#082C6C] uppercase tracking-[0.1em] font-bold">{children}</span>
  </div>
);

// Reusable info row inside detail panel
const InfoRow: React.FC<{ label: string; value?: string | null; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="space-y-0.5">
    <span className="block font-mono text-[8px] text-brand-neutral/45 uppercase tracking-widest">{label}</span>
    <span className={`${mono ? "font-mono text-[11px]" : "font-sans text-[12px]"} text-brand-text font-semibold leading-snug`}>
      {value || <span className="text-brand-neutral/30 font-normal italic text-xs">—</span>}
    </span>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [applications, setApplications] = useState<FellowshipApplication[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCohortSettings, setShowCohortSettings] = useState(false);

  const [cancelModal, setCancelModal] = useState<{
    appId: string;
    applicantName: string;
    hasPaid: boolean;
  } | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  const [paymentWarningModal, setPaymentWarningModal] = useState<{
    appId: string;
    applicantName: string;
    applicantEmail: string;
    feeDisplay: string;
    rzpPaymentId: string;
    message: string;
  } | null>(null);

  const [statusChangeWarningModal, setStatusChangeWarningModal] = useState<{
    appId: string;
    newStatus: string;
    applicantName: string;
    applicantEmail: string;
    feeDisplay: string;
    rzpPaymentId: string;
  } | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4000);
  };

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  const showConfirm = (message: string, onConfirm: () => Promise<void>) => {
    setConfirmModal({ message, onConfirm });
  };

  const [activeTab, setActiveTab] = useState<"applications" | "contacts">("applications");

  const [appSearch, setAppSearch]         = useState("");
  const [sectorFilter, setSectorFilter]   = useState("all");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [contactSearch, setContactSearch] = useState("");
  const [contactStatusFilter, setContactStatusFilter] = useState("all");

  const [selectedApp, setSelectedApp]         = useState<FellowshipApplication | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);

  const [resendingPaymentLink, setResendingPaymentLink] = useState(false);
  const [isActioning, setIsActioning] = useState(false);

  const [appPage, setAppPage]                       = useState(1);
  const [appPageCursors, setAppPageCursors]         = useState<(string | null)[]>([null]);
  const [appTotalPages, setAppTotalPages]           = useState(1);
  const [appHasMore, setAppHasMore]                 = useState(false);
  const [appPageLoading, setAppPageLoading]         = useState(false);
  const appPageRef                                  = useRef(1);

  const [contactPage, setContactPage]               = useState(1);
  const [contactPageCursors, setContactPageCursors] = useState<(string | null)[]>([null]);
  const [contactTotalPages, setContactTotalPages]   = useState(1);
  const [contactHasMore, setContactHasMore]         = useState(false);
  const [contactPageLoading, setContactPageLoading] = useState(false);
  const contactPageRef                              = useRef(1);

  const [appCounts, setAppCounts]         = useState({ total: 0, pending: 0, under_review: 0, accepted: 0, paid: 0 });
  const [contactCounts, setContactCounts] = useState({ total: 0, unread: 0 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAdminAuthorized(!!user);
    });
    return unsubscribe;
  }, []);

  const getToken = async (): Promise<string> => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Not authenticated");
    return token;
  };

  const fetchAppPage = useCallback(async (
    page: number,
    cursors: (string | null)[],
    signal?: AbortSignal,
  ) => {
    if (!auth.currentUser) { setDbLoading(false); return; }
    try {
      const token = await auth.currentUser.getIdToken();
      if (signal?.aborted) return;
      const cursor = cursors[page - 1] ?? null;
      const url    = cursor
        ? `${API_URL}/applications?limit=10&after=${cursor}`
        : `${API_URL}/applications?limit=10`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal });
      if (res.status === 401) { setIsAdminAuthorized(false); setDbError("Access denied."); setDbLoading(false); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { applications: list, hasMore, nextCursor, counts } = await res.json();
      setApplications(list as FellowshipApplication[]);
      setAppHasMore(hasMore);
      if (nextCursor) {
        setAppPageCursors((prev) => { const c = [...prev]; c[page] = nextCursor; return c; });
        setAppTotalPages((prev) => Math.max(prev, page + 1));
      } else {
        setAppTotalPages(page);
      }
      if (counts) setAppCounts(counts);
      setDbLoading(false);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("Failed to load applications:", err);
      setDbError("Failed to load applications. Please refresh.");
      setDbLoading(false);
    }
  }, []);

  const fetchContactPage = useCallback(async (
    page: number,
    cursors: (string | null)[],
    signal?: AbortSignal,
  ) => {
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      if (signal?.aborted) return;
      const cursor = cursors[page - 1] ?? null;
      const url    = cursor
        ? `${API_URL}/contacts?limit=10&after=${cursor}`
        : `${API_URL}/contacts?limit=10`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal });
      if (res.status === 401) { setIsAdminAuthorized(false); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { contacts: list, hasMore, nextCursor, counts } = await res.json();
      setContacts(list as ContactMessage[]);
      setContactHasMore(hasMore);
      if (nextCursor) {
        setContactPageCursors((prev) => { const c = [...prev]; c[page] = nextCursor; return c; });
        setContactTotalPages((prev) => Math.max(prev, page + 1));
      } else {
        setContactTotalPages(page);
      }
      if (counts) setContactCounts(counts);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("Failed to load contacts:", err);
    }
  }, []);

  const goToAppPage = async (page: number) => {
    if (page === appPage || appPageLoading || page < 1) return;
    if (page > 1 && !appPageCursors[page - 1]) return;
    setAppPageLoading(true);
    setSelectedApp(null);
    await fetchAppPage(page, appPageCursors);
    setAppPage(page);
    appPageRef.current = page;
    setAppPageLoading(false);
  };

  const goToContactPage = async (page: number) => {
    if (page === contactPage || contactPageLoading || page < 1) return;
    if (page > 1 && !contactPageCursors[page - 1]) return;
    setContactPageLoading(true);
    setSelectedContact(null);
    await fetchContactPage(page, contactPageCursors);
    setContactPage(page);
    contactPageRef.current = page;
    setContactPageLoading(false);
  };

  useEffect(() => {
    if (!currentUser || !isAdminAuthorized) {
      setApplications([]);
      setContacts([]);
      setAppPage(1); setAppPageCursors([null]); setAppTotalPages(1); setAppHasMore(false);
      setContactPage(1); setContactPageCursors([null]); setContactTotalPages(1); setContactHasMore(false);
      return;
    }

    setDbLoading(true);
    setDbError(null);

    const initialAppCursors     = [null] as (string | null)[];
    const initialContactCursors = [null] as (string | null)[];

    const initialController = new AbortController();
    fetchAppPage(1, initialAppCursors, initialController.signal);
    fetchContactPage(1, initialContactCursors, initialController.signal);

    const appCursorsRef     = { current: initialAppCursors };
    const contactCursorsRef = { current: initialContactCursors };

    const syncCursors = () => {
      setAppPageCursors((c) => { appCursorsRef.current = c; return c; });
      setContactPageCursors((c) => { contactCursorsRef.current = c; return c; });
    };

    let pollController: AbortController | null = null;
    const interval = setInterval(() => {
      pollController?.abort();
      pollController = new AbortController();
      syncCursors();
      fetchAppPage(appPageRef.current, appCursorsRef.current, pollController.signal);
      fetchContactPage(contactPageRef.current, contactCursorsRef.current, pollController.signal);
    }, 15000);

    return () => {
      initialController.abort();
      pollController?.abort();
      clearInterval(interval);
    };
  }, [currentUser, isAdminAuthorized, fetchAppPage, fetchContactPage]);

  const handleLogout = async () => {
    try {
      await logOutAdmin();
      setSelectedApp(null);
      setSelectedContact(null);
    } catch (err: any) {
      console.error("Logout failure:", err);
    }
  };

  const handleUpdateAppStatus = (appId: string, transitionStatus: FellowshipApplication["status"]) => {
    if (isActioning) return;
    const app = applications.find((a) => a.id === appId) ?? selectedApp;
    if (app?.status === transitionStatus) return;

    if (app?.paymentStatus === "paid") {
      const feePaise = (app as any).amount ?? null;
      const feeDisplay = feePaise ? `₹${(feePaise / 100).toFixed(0)}` : "Fellowship Fee";
      setStatusChangeWarningModal({
        appId,
        newStatus: transitionStatus,
        applicantName: String(app.fullName || "this applicant"),
        applicantEmail: String(app.email || ""),
        feeDisplay,
        rzpPaymentId: String((app as any).rzpPaymentId || ""),
      });
      return;
    }

    const confirmMessages: Record<string, string> = {
      under_review:      "Move to Auditing? A status update email will be sent to the applicant.",
      interview_invited: "Invite to Interview? A notification email will be sent to the applicant.",
      accepted:          "Accept as Fellow? A Cashfree payment link will be created and emailed to the applicant.",
      declined:          "Decline this application? A rejection email will be sent to the applicant.",
    };
    const message = confirmMessages[transitionStatus] ?? `Change status to "${transitionStatus.replace(/_/g, " ")}"?`;

    showConfirm(message, async () => {
      await _doStatusUpdate(appId, transitionStatus);
    });
  };

  const _doStatusUpdate = async (appId: string, transitionStatus: string) => {
    setIsActioning(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: transitionStatus }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const { application: updated } = await res.json();
      setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, ...updated } : a));
      if (selectedApp?.id === appId) setSelectedApp((prev) => prev ? { ...prev, ...updated } : null);
      showToast(`Status updated to "${transitionStatus.replace(/_/g, " ")}"`, "success");
    } catch (err: any) {
      console.error("Error updating application status:", err);
      showToast(`Status update failed: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleConfirmedStatusChange = async () => {
    if (!statusChangeWarningModal || isActioning) return;
    const { appId, newStatus } = statusChangeWarningModal;
    setStatusChangeWarningModal(null);
    await _doStatusUpdate(appId, newStatus);
  };

  const handleDeleteApplication = (appId: string) => {
    showConfirm(
      "Are you sure you want to permanently delete this application record?",
      async () => {
        if (isActioning) return;
        setIsActioning(true);
        try {
          const token = await getToken();
          const res = await fetch(`${API_URL}/applications/${appId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.status === 409) {
            const data = await res.json();
            if (data.requiresConfirmation) {
              setPaymentWarningModal({ appId, ...data });
              return;
            }
          }
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
            throw new Error(err.error || `HTTP ${res.status}`);
          }
          setApplications((prev) => prev.filter((a) => a.id !== appId));
          setSelectedApp(null);
          showToast("Application deleted successfully.", "success");
        } catch (err: any) {
          console.error("Error deleting application:", err);
          showToast(`Delete operation failed: ${err.message}`, "error");
        } finally {
          setIsActioning(false);
        }
      }
    );
  };

  const handleForceDeleteApplication = async () => {
    if (!paymentWarningModal || isActioning) return;
    const { appId } = paymentWarningModal;
    setIsActioning(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/applications/${appId}?confirmed=true`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      setSelectedApp(null);
      setPaymentWarningModal(null);
      showToast("Application deleted. Process the refund via Cashfree dashboard.", "success");
    } catch (err: any) {
      console.error("Error force-deleting application:", err);
      showToast(`Delete failed: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleUpdateContactStatus = async (contactId: string, targetStatus: ContactMessage["status"]) => {
    if (isActioning) return;
    setIsActioning(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { contact: updated } = await res.json();
      setContacts((prev) => prev.map((c) => c.id === contactId ? { ...c, ...updated } : c));
      if (selectedContact?.id === contactId) setSelectedContact((prev) => prev ? { ...prev, ...updated } : null);
      showToast(`Message marked as "${targetStatus}"`, "success");
    } catch (err: any) {
      console.error("Error updating enquiry status:", err);
      showToast(`Status update failed: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleDeleteContact = (contactId: string) => {
    showConfirm(
      "Are you sure you want to remove this inquiry from the archive?",
      async () => {
        if (isActioning) return;
        setIsActioning(true);
        try {
          const token = await getToken();
          const res = await fetch(`${API_URL}/contacts/${contactId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          setContacts((prev) => prev.filter((c) => c.id !== contactId));
          setSelectedContact(null);
        } catch (err: any) {
          console.error("Error deleting contact:", err);
          showToast(`Delete inquiry failed: ${err.message}`, "error");
        } finally {
          setIsActioning(false);
        }
      }
    );
  };

  const handleResendPaymentLink = async (appId: string) => {
    setResendingPaymentLink(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/payment/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ applicationId: appId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      showToast("Payment link resent successfully!", "success");
    } catch (err: any) {
      showToast(`Resend failed: ${err.message}`, "error");
    } finally {
      setResendingPaymentLink(false);
    }
  };

  const handleCreatePaymentLink = async (appId: string) => {
    setResendingPaymentLink(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/payment/create-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ applicationId: appId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      showToast("Payment link created and sent!", "success");
    } catch (err: any) {
      showToast(`Create link failed: ${err.message}`, "error");
    } finally {
      setResendingPaymentLink(false);
    }
  };

  const handleCancelAndRefund = async () => {
    if (!cancelModal || isCancelling) return;
    setIsCancelling(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/applications/${cancelModal.appId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(cancelReason.trim() ? { reason: cancelReason.trim() } : {}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const updated = data.application;
      setApplications((prev) => prev.map((a) => a.id === updated.id ? { ...a, ...updated } : a));
      if (selectedApp?.id === updated.id) setSelectedApp((prev) => prev ? { ...prev, ...updated } : null);

      const refundMsg = data.refundPercent > 0
        ? `Cancelled. ${data.refundPercent}% refund initiated${data.refundAmountPaise ? ` (₹${(data.refundAmountPaise / 100).toFixed(0)})` : ""}.`
        : "Application cancelled. No refund applicable.";
      showToast(refundMsg, "success");
      setCancelModal(null);
      setCancelReason("");
    } catch (err: any) {
      showToast(`Cancellation failed: ${err.message}`, "error");
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const term = appSearch.toLowerCase();
    const searchText =
      (app.id || "") + (app.fullName || "") + (app.email || "") + (app.collegeName || "") +
      (app.companyName || "") + (app.startupName || "") + (app.areaOfWork || "") +
      (app.city || "") + (app.currentStatus || "");
    const matchesSearch     = !term || searchText.toLowerCase().includes(term);
    const matchesSector     = sectorFilter === "all" || app.currentStatus === sectorFilter;
    const matchesStatus     = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesSector && matchesStatus;
  });

  const filteredContacts = contacts.filter((c) => {
    const term = contactSearch.toLowerCase();
    const searchText = (c.name || "") + (c.email || "") + (c.subject || "") + (c.message || "");
    const matchesSearch = !term || searchText.toLowerCase().includes(term);
    const matchesStatus = contactStatusFilter === "all" || c.status === contactStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderTimestamp = (ts: any): string => {
    if (!ts) return "N/A";
    let date: Date;
    if (ts?.toDate) date = ts.toDate();
    else if (ts?._seconds !== undefined) date = new Date(ts._seconds * 1000);
    else if (ts?.seconds !== undefined) date = new Date(ts.seconds * 1000);
    else date = new Date(ts);
    if (isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const renderShortDate = (ts: any): string => {
    if (!ts) return "";
    let date: Date;
    if (ts?.toDate) date = ts.toDate();
    else if (ts?._seconds !== undefined) date = new Date(ts._seconds * 1000);
    else if (ts?.seconds !== undefined) date = new Date(ts.seconds * 1000);
    else date = new Date(ts);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
  };

  // ── Computed counts ──────────────────────────────────────────────────────────
  const totalApps       = appCounts.total;
  const pendingApps     = appCounts.pending;
  const underReviewApps = appCounts.under_review;
  const acceptedApps    = appCounts.accepted;
  const paidApps        = appCounts.paid;
  const unreadContacts  = contactCounts.unread;

  // ── Not authorized screen ────────────────────────────────────────────────────
  if (!isAdminAuthorized) {
    return (
      <section className="py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="max-w-md mx-auto bg-brand-bg border border-red-500/25 rounded-sm p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto h-12 w-12 bg-red-100/30 rounded-full flex items-center justify-center text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold text-brand-text">Access Restricted</h3>
            <p className="font-sans text-xs text-brand-neutral leading-relaxed">
              Your account is not authorized to access the DealSchool Supervisor Portal.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-brand-secondary text-[#FAFAF8] font-mono text-xs font-bold uppercase hover:bg-brand-dark-blue cursor-pointer rounded-sm"
          >
            Sign Out
          </button>
        </div>
      </section>
    );
  }

  // ── Pre-computed derived data (avoids TypeScript narrowing issues in JSX) ────
  const appSC = APP_STATUS_CFG[selectedApp?.status ?? "pending"] ?? APP_STATUS_CFG.pending;
  const appPayBadge: { label: string; cls: string } | null = !selectedApp ? null
    : selectedApp.status === "accepted" && selectedApp.paymentStatus === "paid"
      ? { label: "Paid",             cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" }
    : selectedApp.status === "accepted" && selectedApp.paymentStatus === "link_sent"
      ? { label: "Awaiting Payment", cls: "bg-amber-50 text-amber-700 border border-amber-200" }
    : selectedApp.status === "accepted" && selectedApp.paymentStatus === "expired"
      ? { label: "Link Expired",     cls: "bg-orange-50 text-orange-700 border border-orange-200" }
    : selectedApp.status === "accepted" && selectedApp.paymentStatus === "processing"
      ? { label: "Generating…",      cls: "bg-blue-50 text-blue-700 border border-blue-200" }
    : selectedApp.status === "accepted" && (selectedApp.paymentStatus === "error" || selectedApp.paymentStatus === "failed")
      ? { label: "Link Failed",      cls: "bg-red-50 text-red-700 border border-red-200" }
    : selectedApp.status === "cancelled" && selectedApp.paymentStatus === "refund_pending"
      ? { label: "Refund Processing", cls: "bg-blue-50 text-blue-700 border border-blue-200" }
    : selectedApp.status === "cancelled" && selectedApp.paymentStatus === "refunded"
      ? { label: "Refunded",         cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" }
    : selectedApp.status === "cancelled" && selectedApp.paymentStatus === "refund_failed"
      ? { label: "Refund Failed",    cls: "bg-red-50 text-red-700 border border-red-200" }
    : null;
  const contactSC = CONTACT_STATUS_CFG[selectedContact?.status ?? "read"] ?? CONTACT_STATUS_CFG.read;

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <>
    <div className="min-h-screen bg-[#ECEAE6] flex flex-col">

      {/* ════════════════ STICKY HEADER ════════════════ */}
      <header className="sticky top-0 z-30 bg-[#082C6C] border-b border-white/10 h-14 px-5 md:px-8 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/10 rounded-lg p-1 ring-1 ring-white/15">
              <img src={dealschoolLogo} alt="DealSchool" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-sans text-sm font-bold text-white tracking-tight">DealSchool</span>
          </div>
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/15">
            <span className="font-mono text-[9px] text-[#D4A62A] uppercase tracking-[0.12em] font-bold">Admissions Board</span>
            <button
              onClick={goToSite}
              className="flex items-center gap-1 font-mono text-[9px] text-white/45 hover:text-white uppercase tracking-wider transition-colors cursor-pointer group"
            >
              <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
              Back to site
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="hidden md:block font-mono text-[10px] text-white/50 mr-2">
            {currentUser?.email}
          </span>
          <button
            onClick={async () => {
              setDbLoading(true);
              await Promise.all([
                fetchAppPage(appPage, appPageCursors),
                fetchContactPage(contactPage, contactPageCursors),
              ]);
              showToast("Data refreshed", "success");
            }}
            disabled={isActioning}
            title="Refresh data"
            className="h-8 w-8 flex items-center justify-center rounded text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowCohortSettings(true)}
            className="hidden md:flex h-8 items-center gap-1.5 px-3 font-mono text-[10px] text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer uppercase tracking-wider"
          >
            <CalendarCog className="h-3.5 w-3.5" /> Cohort
          </button>
          <button
            onClick={() => setShowChangePassword(true)}
            className="hidden md:flex h-8 items-center gap-1.5 px-3 font-mono text-[10px] text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer uppercase tracking-wider"
          >
            <KeyRound className="h-3.5 w-3.5" /> Password
          </button>
          <button
            onClick={handleLogout}
            className="h-8 flex items-center gap-1.5 px-3 font-mono text-[10px] text-[#D4A62A] hover:bg-white/10 hover:text-white rounded transition-colors cursor-pointer uppercase tracking-wider ml-1"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </header>

      {/* ════════════════ CONTENT BODY ════════════════ */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-5 space-y-4">

        {/* ── Metrics strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {([
            { label: "Total",      value: totalApps,       Icon: Users,         iconBg: "bg-white/10",        iconColor: "text-white/70",       border: "border-white/10"          },
            { label: "Pending",    value: pendingApps,      Icon: Clock,         iconBg: "bg-[#D4A62A]/20",    iconColor: "text-[#D4A62A]",      border: "border-[#D4A62A]/35"      },
            { label: "Auditing",   value: underReviewApps,  Icon: Eye,           iconBg: "bg-sky-400/15",      iconColor: "text-sky-300",        border: "border-sky-400/25"        },
            { label: "Accepted",   value: acceptedApps,     Icon: CheckCircle2,  iconBg: "bg-emerald-400/15",  iconColor: "text-emerald-400",    border: "border-emerald-400/25"    },
            { label: "Fees Paid",  value: paidApps,         Icon: CreditCard,    iconBg: "bg-teal-400/10",     iconColor: "text-teal-300",       border: "border-teal-400/20"       },
            { label: "Unread",     value: unreadContacts,   Icon: MessageSquare, iconBg: "bg-blue-400/15",     iconColor: "text-blue-300",       border: "border-blue-400/25"       },
          ] as const).map(({ label, value, Icon, iconBg, iconColor, border }) => (
            <div
              key={label}
              className={`bg-[#082C6C] border ${border} rounded-sm px-4 py-4 flex items-center gap-3 shadow-sm hover:bg-[#0a3580] transition-colors cursor-default`}
            >
              <div className={`h-9 w-9 rounded-md ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div className="min-w-0 flex flex-col gap-1.5">
                <span className="block font-serif text-[24px] font-black leading-none text-white">{value}</span>
                <span className="block font-mono text-[9px] text-white/40 uppercase tracking-[0.09em] truncate">{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1">
          {(["applications", "contacts"] as const).map((tab) => {
            const count = tab === "applications" ? applications.length : contacts.length;
            const label = tab === "applications" ? `Applications` : `Messages`;
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  if (tab === "applications") { setActiveTab("applications"); setSelectedContact(null); }
                  else { setActiveTab("contacts"); setSelectedApp(null); }
                }}
                className={`flex items-center gap-2 px-5 py-2 font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer rounded-sm font-bold ${
                  active
                    ? "bg-[#082C6C] text-white shadow-md"
                    : "text-brand-secondary hover:text-[#082C6C] hover:bg-white border border-transparent hover:border-brand-secondary/20"
                }`}
              >
                {label}
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black leading-none ${
                  active ? "bg-[#D4A62A] text-white" : "bg-brand-secondary/15 text-brand-secondary"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── DB Error ── */}
        {dbError && (
          <div className="bg-red-50 border border-red-200 p-3.5 text-red-800 text-xs rounded-sm flex items-center justify-between gap-4">
            <span>{dbError}</span>
            <button
              onClick={() => {
                setDbError(null);
                setDbLoading(true);
                fetchAppPage(appPage, appPageCursors);
                fetchContactPage(contactPage, contactPageCursors);
              }}
              className="shrink-0 font-mono text-[10px] font-bold uppercase bg-red-100 hover:bg-red-200 border border-red-300 px-3 py-1.5 rounded-sm flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          </div>
        )}

        {/* ════════════════ MAIN TWO-PANEL GRID ════════════════ */}
        <div>

          {/* ── LEFT PANEL: list ── */}
          <div className="space-y-3">

            {/* APPLICATIONS tab */}
            {activeTab === "applications" && (
              <>
                {/* Search + filter bar */}
                <div className="bg-white border border-brand-secondary/10 rounded-sm px-4 py-3 shadow-sm flex flex-wrap items-center gap-3">
                  {/* Search input */}
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-neutral/50" />
                    <input
                      type="text"
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      placeholder="Search name, email, university…"
                      className="w-full bg-[#F6F5F2] text-brand-text pl-9 pr-3 py-2 border border-brand-secondary/15 focus:outline-none focus:border-[#082C6C] focus:bg-white text-xs rounded-sm transition-all"
                    />
                  </div>

                  <div className="h-5 w-px bg-brand-secondary/15 hidden md:block" />

                  {/* Archetype select */}
                  <div className="relative min-w-[155px]">
                    <CustomSelect
                      value={sectorFilter}
                      onChange={setSectorFilter}
                      placeholder="Archetype · All"
                      font="mono"
                      className="bg-white text-brand-text pl-3 pr-3 py-2 border border-brand-secondary/20 focus:outline-none focus:border-[#082C6C] text-xs h-[34px] rounded-sm tracking-wide hover:border-brand-secondary/40 transition-colors"
                      chevronClassName="h-3.5 w-3.5 text-brand-secondary/40"
                      options={[
                        { value: "all", label: "Archetype · All" },
                        { value: "Student", label: "Student" },
                        { value: "Recent Graduate (0–2 years of experience)", label: "Recent Grad" },
                        { value: "Working Professional", label: "Working Pro" },
                        { value: "Founder", label: "Founder" },
                        { value: "Freelancer", label: "Freelancer" },
                        { value: "Other", label: "Other" },
                      ]}
                    />
                  </div>

                  {/* Status select */}
                  <div className="relative min-w-[135px]">
                    <CustomSelect
                      value={statusFilter}
                      onChange={setStatusFilter}
                      placeholder="Status · All"
                      font="mono"
                      className="bg-white text-brand-text pl-3 pr-3 py-2 border border-brand-secondary/20 focus:outline-none focus:border-[#082C6C] text-xs h-[34px] rounded-sm tracking-wide hover:border-brand-secondary/40 transition-colors"
                      chevronClassName="h-3.5 w-3.5 text-brand-secondary/40"
                      options={[
                        { value: "all", label: "Status · All" },
                        { value: "pending", label: "Pending" },
                        { value: "under_review", label: "Auditing" },
                        { value: "interview_invited", label: "Interview" },
                        { value: "accepted", label: "Accepted" },
                        { value: "declined", label: "Declined" },
                        { value: "cancelled", label: "Cancelled" },
                      ]}
                    />
                  </div>
                </div>

                {/* Loading */}
                {dbLoading && (
                  <div className="py-16 text-center text-brand-neutral text-xs font-mono tracking-widest uppercase bg-white border border-brand-secondary/10 rounded-sm">
                    Syncing applications…
                  </div>
                )}

                {/* Empty */}
                {!dbLoading && filteredApps.length === 0 && (
                  <div className="bg-white border border-brand-secondary/10 p-12 text-center rounded-sm shadow-sm">
                    <p className="font-serif text-base font-bold text-brand-text">No Candidates Found</p>
                    <p className="font-sans text-xs text-brand-neutral mt-1">Adjust your search or filter criteria.</p>
                  </div>
                )}

                {/* Application table */}
                {!dbLoading && filteredApps.length > 0 && (
                <div className="bg-white border border-brand-secondary/15 rounded-sm overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] border-collapse">
                      <thead>
                        <tr style={{ background: "linear-gradient(90deg, #061a42 0%, #082C6C 60%, #0D3B8E 100%)" }}>
                          {["Name / ID", "Email", "City", "Current Role", "Company", "Status"].map((col) => (
                            <th key={col} className="px-4 py-3 text-left font-mono text-[9px] font-bold text-white/60 uppercase tracking-[0.09em] whitespace-nowrap select-none">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApps.map((app, idx) => {
                          const sc = APP_STATUS_CFG[app.status] ?? APP_STATUS_CFG.pending;
                          const payBadge =
                            app.status === "accepted" && app.paymentStatus === "paid"        ? { label: "Paid",       cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" }
                            : app.status === "accepted" && app.paymentStatus === "link_sent"  ? { label: "Awaiting",   cls: "bg-amber-50 text-amber-700 border border-amber-200" }
                            : app.status === "accepted" && app.paymentStatus === "expired"    ? { label: "Expired",    cls: "bg-orange-50 text-orange-700 border border-orange-200" }
                            : app.status === "accepted" && app.paymentStatus === "processing" ? { label: "Processing", cls: "bg-blue-50 text-blue-700 border border-blue-200" }
                            : app.status === "accepted" && (app.paymentStatus === "error" || app.paymentStatus === "failed") ? { label: "Failed", cls: "bg-red-50 text-red-700 border border-red-200" }
                            : app.status === "cancelled" && app.paymentStatus === "refund_pending" ? { label: "Refunding", cls: "bg-blue-50 text-blue-700 border border-blue-200" }
                            : app.status === "cancelled" && app.paymentStatus === "refunded"       ? { label: "Refunded",  cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" }
                            : app.status === "cancelled" && app.paymentStatus === "refund_failed"  ? { label: "Refund Failed", cls: "bg-red-50 text-red-700 border border-red-200" }
                            : null;
                          return (
                            <tr
                              key={app.id}
                              onClick={() => setSelectedApp(app)}
                              className={`cursor-pointer border-b border-[#E8E6E0] transition-colors group ${
                                idx % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]"
                              } hover:bg-[#082C6C]/[0.05]`}
                            >
                              {/* Name + avatar */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-1 ${sc.avatarRing} ${sc.avatarBg}`}>
                                    <span className={`font-mono text-[10px] font-black ${sc.avatarText}`}>
                                      {getInitials(app.fullName)}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-sans text-sm font-semibold text-brand-text group-hover:text-[#082C6C] transition-colors">
                                      {app.fullName}
                                    </span>
                                    <span className="font-mono text-[9px] text-brand-neutral/50 tracking-wide">{app.id}</span>
                                  </div>
                                </div>
                              </td>
                              {/* Email */}
                              <td className="px-4 py-3">
                                <span className="font-mono text-[10px] text-brand-neutral">{app.email}</span>
                              </td>
                              {/* City */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="font-sans text-xs text-brand-neutral">{app.city || <span className="text-brand-neutral/30 italic">—</span>}</span>
                              </td>
                              {/* Current Role */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="font-sans text-xs text-brand-neutral">{app.currentRole || <span className="text-brand-neutral/30 italic">—</span>}</span>
                              </td>
                              {/* Company */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="font-sans text-xs text-brand-neutral">{app.companyName || app.startupName || <span className="text-brand-neutral/30 italic">—</span>}</span>
                              </td>
                              {/* Status */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`font-mono text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider rounded-full ${sc.badge}`}>
                                    {sc.label}
                                  </span>
                                  {payBadge && (
                                    <span className={`font-mono text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider rounded-full flex items-center gap-1 ${payBadge.cls}`}>
                                      <CreditCard className="h-2.5 w-2.5" /> {payBadge.label}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                )}

                {/* Pagination */}
                {appTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 flex-wrap pt-1">
                    <button onClick={() => goToAppPage(appPage - 1)} disabled={appPage === 1 || appPageLoading}
                      className="px-3 py-1.5 border border-brand-secondary/20 text-brand-neutral font-mono text-[10px] uppercase tracking-wider hover:bg-white transition-all rounded-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                      Prev
                    </button>
                    {Array.from({ length: appTotalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => goToAppPage(p)} disabled={appPageLoading}
                        className={`w-8 h-8 font-mono text-[10px] font-bold rounded-sm border transition-all cursor-pointer ${
                          p === appPage ? "bg-brand-secondary text-white border-brand-secondary" : "bg-white border-brand-secondary/20 text-brand-neutral hover:bg-brand-secondary/5"
                        }`}>
                        {appPageLoading && p === appPage ? <RefreshCw className="h-3 w-3 animate-spin mx-auto" /> : p}
                      </button>
                    ))}
                    <button onClick={() => goToAppPage(appPage + 1)} disabled={!appHasMore || appPageLoading}
                      className="px-3 py-1.5 border border-brand-secondary/20 text-brand-neutral font-mono text-[10px] uppercase tracking-wider hover:bg-white transition-all rounded-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                      Next
                    </button>
                    <span className="font-mono text-[9px] text-brand-neutral ml-1">Page {appPage} of {appTotalPages}{appHasMore ? "+" : ""}</span>
                  </div>
                )}
              </>
            )}

            {/* CONTACTS tab */}
            {activeTab === "contacts" && (
              <>
                <div className="bg-white border border-brand-secondary/10 rounded-sm px-4 py-3 shadow-sm flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-neutral/50" />
                    <input type="text" value={contactSearch} onChange={(e) => setContactSearch(e.target.value)}
                      placeholder="Search sender, subject, message…"
                      className="w-full bg-[#F6F5F2] text-brand-text pl-9 pr-3 py-2 border border-brand-secondary/15 focus:outline-none focus:border-[#082C6C] focus:bg-white text-xs rounded-sm transition-all" />
                  </div>
                  <div className="h-5 w-px bg-brand-secondary/15 hidden md:block" />
                  <div className="relative min-w-[135px]">
                    <CustomSelect
                      value={contactStatusFilter}
                      onChange={setContactStatusFilter}
                      placeholder="Status · All"
                      font="mono"
                      className="bg-white text-brand-text pl-3 pr-3 py-2 border border-brand-secondary/20 focus:outline-none focus:border-[#082C6C] text-xs h-[34px] rounded-sm tracking-wide hover:border-brand-secondary/40 transition-colors"
                      chevronClassName="h-3.5 w-3.5 text-brand-secondary/40"
                      options={[
                        { value: "all", label: "Status · All" },
                        { value: "unread", label: "Unread" },
                        { value: "read", label: "Read" },
                        { value: "archived", label: "Archived" },
                      ]}
                    />
                  </div>
                </div>

                {filteredContacts.length === 0 && (
                  <div className="bg-white border border-brand-secondary/10 p-12 text-center rounded-sm shadow-sm">
                    <p className="font-serif text-base font-bold text-brand-text">No Messages Found</p>
                    <p className="font-sans text-xs text-brand-neutral mt-1">Adjust your search or filter criteria.</p>
                  </div>
                )}

                <div className="bg-white border border-brand-secondary/10 rounded-sm overflow-hidden shadow-sm divide-y divide-brand-secondary/8">
                  {filteredContacts.map((c) => {
                    const isSelected = selectedContact?.id === c.id;
                    const sc = CONTACT_STATUS_CFG[c.status] ?? CONTACT_STATUS_CFG.read;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedContact(c)}
                        className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#082C6C]/[0.06] border-l-[3px] border-l-[#D4A62A]"
                            : "border-l-[3px] border-l-transparent hover:bg-[#082C6C]/[0.03]"
                        }`}
                      >
                        {/* Initials avatar */}
                        <div className="w-9 h-9 rounded-full bg-brand-secondary/10 flex items-center justify-center shrink-0 ring-2 ring-brand-secondary/15">
                          <span className="font-mono text-[11px] font-black text-brand-secondary">
                            {getInitials(c.name)}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-sans text-sm text-brand-text truncate max-w-[160px] ${c.status === "unread" ? "font-bold" : "font-medium"}`}>
                              {c.name}
                            </span>
                            <span className={`font-mono text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider rounded-full ${sc.badge}`}>
                              {sc.label}
                            </span>
                          </div>
                          <p className="font-sans text-xs text-brand-neutral truncate mt-0.5">
                            <span className="font-medium text-brand-secondary">{c.subject}</span>
                            <span className="mx-1 opacity-40">·</span>
                            <span className="opacity-70">{c.message}</span>
                          </p>
                        </div>

                        <div className="shrink-0 text-right hidden sm:block">
                          <span className="font-mono text-[9px] text-brand-neutral block">{renderShortDate(c.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {contactTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 flex-wrap pt-1">
                    <button onClick={() => goToContactPage(contactPage - 1)} disabled={contactPage === 1 || contactPageLoading}
                      className="px-3 py-1.5 border border-brand-secondary/20 text-brand-neutral font-mono text-[10px] uppercase tracking-wider hover:bg-white transition-all rounded-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                      Prev
                    </button>
                    {Array.from({ length: contactTotalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => goToContactPage(p)} disabled={contactPageLoading}
                        className={`w-8 h-8 font-mono text-[10px] font-bold rounded-sm border transition-all cursor-pointer ${
                          p === contactPage ? "bg-brand-secondary text-white border-brand-secondary" : "bg-white border-brand-secondary/20 text-brand-neutral hover:bg-brand-secondary/5"
                        }`}>
                        {contactPageLoading && p === contactPage ? <RefreshCw className="h-3 w-3 animate-spin mx-auto" /> : p}
                      </button>
                    ))}
                    <button onClick={() => goToContactPage(contactPage + 1)} disabled={!contactHasMore || contactPageLoading}
                      className="px-3 py-1.5 border border-brand-secondary/20 text-brand-neutral font-mono text-[10px] uppercase tracking-wider hover:bg-white transition-all rounded-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── DETAIL DRAWER ── */}
          {((activeTab === "applications" && selectedApp !== null) || (activeTab === "contacts" && selectedContact !== null)) && (
          <div className="fixed inset-0 z-50 flex" style={{ animation: "fadeInBackdrop 0.2s ease-out" }}>
            {/* Blurred left half — click to dismiss */}
            <div
              className="w-[42%] h-full cursor-pointer"
              style={{ backdropFilter: "blur(4px) brightness(0.68)", backgroundColor: "rgba(6, 26, 66, 0.30)" }}
              onClick={() => { setSelectedApp(null); setSelectedContact(null); }}
            />
            {/* Drawer panel — right half */}
            <div className="w-[58%] h-full flex flex-col bg-white shadow-2xl border-l border-[#082C6C]/20 overflow-hidden" style={{ animation: "slideInRight 0.28s cubic-bezier(0.25,0.46,0.45,0.94)" }}>

              {/* ── APPLICATION DETAIL ── */}
              {activeTab === "applications" && (
                <>
                  {selectedApp ? (
                      <>
                        {/* ─ Detail header — navy gradient ─ */}
                        <div className="shrink-0 border-b border-white/10" style={{ background: "linear-gradient(135deg, #061a42 0%, #0D3B8E 100%)" }}>
                          {/* Top bar */}
                          <div className="flex items-center justify-between px-5 pt-4">
                            <span className="font-mono text-[8px] text-white/25 uppercase tracking-[0.14em]">Applicant Profile</span>
                            <button
                              onClick={() => setSelectedApp(null)}
                              className="h-7 w-7 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                              title="Close"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          {/* Identity */}
                          <div className="flex items-start gap-4 px-5 pt-3 pb-5">
                            <div className="w-14 h-14 rounded-full bg-white/15 border-2 border-[#D4A62A]/70 flex items-center justify-center shrink-0 shadow-lg">
                              <span className="font-serif text-lg font-black text-white">
                                {getInitials(selectedApp.fullName)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <h3 className="font-serif text-xl font-bold text-white leading-tight">
                                  {selectedApp.fullName}
                                </h3>
                                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                                  <span className={`font-mono text-[9px] px-2.5 py-1 font-bold uppercase tracking-wider rounded-full ${appSC.darkBadge}`}>
                                    {appSC.label}
                                  </span>
                                  {appPayBadge && (
                                    <span className="font-mono text-[9px] px-2.5 py-1 font-bold uppercase tracking-wider rounded-full flex items-center gap-1 bg-[#D4A62A]/25 text-[#D4A62A] border border-[#D4A62A]/40">
                                      <CreditCard className="h-2.5 w-2.5" /> {appPayBadge.label}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <a
                                href={`mailto:${selectedApp.email}`}
                                className="font-mono text-[10px] text-white/55 hover:text-[#D4A62A] transition-colors flex items-center gap-1.5 mb-1"
                              >
                                <Mail className="h-3 w-3" /> {selectedApp.email}
                              </a>
                              <div className="flex items-center gap-3 font-mono text-[9px] text-white/35 flex-wrap">
                                <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" />{selectedApp.currentStatus}</span>
                                {selectedApp.city && <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{selectedApp.city}</span>}
                                <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{renderShortDate(selectedApp.createdAt)}</span>
                              </div>
                              <div className="mt-1.5 flex items-center gap-1.5">
                                <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider">ID:</span>
                                <span
                                  className="font-mono text-[9px] text-white/50 cursor-pointer hover:text-[#D4A62A] transition-colors"
                                  title="Click to copy"
                                  onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(selectedApp.id); showToast("Applicant ID copied!", "success"); }}
                                >
                                  {selectedApp.id}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ─ Scrollable content ─ */}
                        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-6 bg-[#F8F7F5]">

                          {/* Contact info */}
                          <div>
                            <SectionLabel>Contact</SectionLabel>
                            <div className="grid grid-cols-2 gap-3">
                              <InfoRow label="Mobile" value={selectedApp.mobileNumber} mono />
                              <InfoRow label="City" value={selectedApp.city} />
                            </div>
                            {selectedApp.linkedinUrl && (
                              <a
                                href={selectedApp.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2.5 flex items-center gap-1.5 font-mono text-[10px] text-brand-accent hover:underline truncate"
                              >
                                <ExternalLink className="h-3 w-3 shrink-0" />
                                <span className="truncate">{selectedApp.linkedinUrl}</span>
                              </a>
                            )}
                          </div>

                          {/* Background / alignment */}
                          <div className="bg-white border border-brand-secondary/15 rounded-sm p-4 space-y-3 shadow-sm">
                            <div className="flex items-center gap-2 pb-2 border-b border-brand-secondary/10">
                              <div className="w-[3px] h-3.5 bg-[#D4A62A] rounded-full shrink-0" />
                              <span className="font-mono text-[9px] text-[#082C6C] uppercase tracking-[0.1em] font-bold">Background · {selectedApp.currentStatus}</span>
                            </div>

                            {selectedApp.currentStatus === "Student" && (
                              <div className="grid grid-cols-2 gap-2.5">
                                <InfoRow label="College" value={selectedApp.collegeName} />
                                <InfoRow label="Degree" value={selectedApp.degree} />
                                <InfoRow label="Graduation" value={selectedApp.graduationYear} />
                              </div>
                            )}
                            {selectedApp.currentStatus === "Recent Graduate (0–2 years of experience)" && (
                              <div className="grid grid-cols-2 gap-2.5">
                                <InfoRow label="Current Role" value={selectedApp.currentRole} />
                                <InfoRow label="Company" value={selectedApp.companyName} />
                                <InfoRow label="Graduation" value={selectedApp.graduationYear} />
                                <InfoRow label="Background" value={selectedApp.degreeEducationalBackground} />
                              </div>
                            )}
                            {selectedApp.currentStatus === "Working Professional" && (
                              <div className="grid grid-cols-2 gap-2.5">
                                <InfoRow label="Current Role" value={selectedApp.currentRole} />
                                <InfoRow label="Company" value={selectedApp.companyName} />
                                <InfoRow label="Experience" value={selectedApp.yearsOfExperience} />
                              </div>
                            )}
                            {selectedApp.currentStatus === "Founder" && (
                              <div className="grid grid-cols-2 gap-2.5">
                                <InfoRow label="Startup" value={selectedApp.startupName} />
                                <InfoRow label="Sector" value={selectedApp.industrySector} />
                                {selectedApp.startupLinkedinProfile && (
                                  <div className="col-span-2">
                                    <a href={selectedApp.startupLinkedinProfile} target="_blank" rel="noopener noreferrer"
                                      className="font-mono text-[10px] text-brand-accent hover:underline flex items-center gap-1">
                                      <ExternalLink className="h-3 w-3" /> Startup LinkedIn
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                            {selectedApp.currentStatus === "Freelancer" && (
                              <div className="grid grid-cols-2 gap-2.5">
                                <InfoRow label="Area of Work" value={selectedApp.areaOfWork} />
                                <InfoRow label="Experience" value={selectedApp.yearsOfExperience} />
                                {selectedApp.freelancerLinkedinProfile && (
                                  <div className="col-span-2">
                                    <a href={selectedApp.freelancerLinkedinProfile} target="_blank" rel="noopener noreferrer"
                                      className="font-mono text-[10px] text-brand-accent hover:underline flex items-center gap-1">
                                      <ExternalLink className="h-3 w-3" /> LinkedIn Portfolio
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                            {selectedApp.currentStatus === "Other" && (
                              <InfoRow label="Specified Role" value={selectedApp.otherStatusSpecify} />
                            )}
                          </div>

                          {/* Motivation */}
                          <div>
                            <SectionLabel>Why DealSchool?</SectionLabel>
                            <p className="font-sans text-xs text-brand-text leading-relaxed">
                              {selectedApp.primaryReason === "Other" ? selectedApp.primaryReasonOther : selectedApp.primaryReason}
                            </p>
                          </div>

                          {/* Thesis assessments */}
                          <div className="space-y-3">
                            <SectionLabel>Thesis Assessment</SectionLabel>

                            <div className="border border-brand-secondary/15 rounded-sm p-3 space-y-1.5">
                              <span className="block font-mono text-[9px] font-bold text-brand-secondary uppercase tracking-wider">
                                Q1: Cash-burning marketing growth
                              </span>
                              <p className="font-serif italic text-xs text-brand-neutral leading-relaxed whitespace-pre-wrap max-h-24 overflow-y-auto">
                                "{selectedApp.assessmentQ1}"
                              </p>
                            </div>

                            <div className="border border-brand-secondary/15 rounded-sm p-3 space-y-1.5">
                              <span className="block font-mono text-[9px] font-bold text-brand-secondary uppercase tracking-wider">
                                Q2: ₹10 lakhs sector choice
                              </span>
                              <p className="font-serif italic text-xs text-brand-neutral leading-relaxed whitespace-pre-wrap max-h-24 overflow-y-auto">
                                "{selectedApp.assessmentQ2}"
                              </p>
                            </div>

                            <div className="bg-[#082C6C]/[0.05] border border-brand-secondary/20 rounded-sm p-3 flex items-center justify-between gap-3">
                              <span className="font-mono text-[9px] font-bold text-brand-secondary uppercase tracking-wider">
                                Q3: Most vital in early-stage
                              </span>
                              <span className="font-mono text-[10px] font-black bg-[#082C6C] text-[#D4A62A] px-3 py-1 rounded-full uppercase tracking-wider border border-[#D4A62A]/30 shrink-0">
                                {selectedApp.assessmentQ3}
                              </span>
                            </div>
                          </div>

                          {/* Discovery + submission */}
                          <div className="grid grid-cols-2 gap-3">
                            <InfoRow
                              label="Discovery"
                              value={selectedApp.discoverySource === "Other" ? selectedApp.discoverySourceOther : selectedApp.discoverySource}
                            />
                            <InfoRow label="Submitted" value={renderShortDate(selectedApp.createdAt)} mono />
                          </div>

                          {/* Resume */}
                          <div>
                            <SectionLabel>Resume</SectionLabel>
                            {(selectedApp.resumeLink || selectedApp.resumeUrl) ? (
                              <div className="flex gap-2">
                                <a
                                  href={selectedApp.resumeLink || selectedApp.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 py-2 bg-[#FAFAF8] border border-brand-accent/25 text-brand-accent font-mono text-[9px] font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 hover:bg-brand-accent/5 transition-colors cursor-pointer"
                                >
                                  <FileText className="h-3.5 w-3.5" /> Open Resume
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedApp.resumeLink || selectedApp.resumeUrl || "");
                                    showToast("Resume link copied!", "success");
                                  }}
                                  className="px-3 py-2 bg-[#FAFAF8] border border-brand-secondary/15 text-brand-neutral font-mono text-[9px] uppercase tracking-wider rounded-sm hover:bg-brand-secondary/5 transition-colors cursor-pointer"
                                >
                                  Copy
                                </button>
                              </div>
                            ) : (
                              <p className="font-sans text-xs text-brand-neutral italic">None provided</p>
                            )}
                          </div>

                          {/* Payment section — only for accepted */}
                          {selectedApp.status === "accepted" && (
                            <div className="border border-brand-secondary/15 rounded-sm overflow-hidden">
                              <div className="px-3.5 py-2.5 bg-[#FAFAF8] border-b border-brand-secondary/10 flex items-center gap-2">
                                <CreditCard className="h-3.5 w-3.5 text-brand-accent" />
                                <span className="font-mono text-[9px] uppercase tracking-wider text-brand-accent font-bold">
                                  Payment Status
                                </span>
                              </div>
                              <div className="p-3.5 space-y-3">
                                {/* Status badge */}
                                <div>
                                  {selectedApp.paymentStatus === "paid" && (
                                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full font-bold uppercase">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Paid in Full
                                    </span>
                                  )}
                                  {selectedApp.paymentStatus === "link_sent" && (
                                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full font-bold uppercase">
                                      Payment Link Sent — Awaiting
                                    </span>
                                  )}
                                  {selectedApp.paymentStatus === "expired" && (
                                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-full font-bold uppercase">
                                      Link Expired
                                    </span>
                                  )}
                                  {selectedApp.paymentStatus === "processing" && (
                                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full font-bold uppercase">
                                      Creating Link…
                                    </span>
                                  )}
                                  {(selectedApp.paymentStatus === "error" || selectedApp.paymentStatus === "failed") && (
                                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-bold uppercase">
                                      Creation Failed
                                    </span>
                                  )}
                                  {selectedApp.paymentStatus === "refund_pending" && (
                                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full font-bold uppercase">
                                      Refund Processing
                                    </span>
                                  )}
                                  {selectedApp.paymentStatus === "refunded" && (
                                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full font-bold uppercase">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Refunded
                                    </span>
                                  )}
                                  {selectedApp.paymentStatus === "refund_failed" && (
                                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-bold uppercase">
                                      Refund Failed — Needs Manual Review
                                    </span>
                                  )}
                                  {!selectedApp.paymentStatus && (
                                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] bg-gray-50 text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full uppercase">
                                      Not Initiated
                                    </span>
                                  )}
                                </div>

                                {selectedApp.rzpPaymentId && (
                                  <div>
                                    <span className="block font-mono text-[9px] uppercase tracking-wider text-brand-neutral mb-1">Payment ID</span>
                                    <div className="flex items-center gap-2">
                                      <code className="font-mono text-[10px] text-brand-secondary bg-[#FAFAF8] border border-brand-secondary/10 px-2 py-1 rounded-sm flex-1 truncate">
                                        {selectedApp.rzpPaymentId}
                                      </code>
                                      <button
                                        type="button"
                                        onClick={() => { navigator.clipboard.writeText(selectedApp.rzpPaymentId || ""); showToast("Payment ID copied!", "success"); }}
                                        className="font-mono text-[9px] text-brand-accent hover:underline cursor-pointer shrink-0"
                                      >
                                        Copy
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {selectedApp.paidAt && (
                                  <InfoRow label="Paid At" value={renderTimestamp(selectedApp.paidAt)} mono />
                                )}

                                {["expired", "error", "failed"].includes(selectedApp.paymentStatus || "") && (
                                  <button
                                    onClick={() => handleResendPaymentLink(selectedApp.id)}
                                    disabled={resendingPaymentLink}
                                    className="w-full py-2.5 bg-brand-secondary hover:bg-brand-dark-blue text-white font-mono text-[9px] font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <RefreshCw className={`h-3 w-3 ${resendingPaymentLink ? "animate-spin" : ""}`} />
                                    {resendingPaymentLink ? "Sending…" : "Resend Payment Link"}
                                  </button>
                                )}
                                {!selectedApp.paymentStatus && (
                                  <button
                                    onClick={() => handleCreatePaymentLink(selectedApp.id)}
                                    disabled={resendingPaymentLink}
                                    className="w-full py-2.5 bg-brand-secondary hover:bg-brand-dark-blue text-white font-mono text-[9px] font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <CreditCard className={`h-3 w-3 ${resendingPaymentLink ? "animate-pulse" : ""}`} />
                                    {resendingPaymentLink ? "Creating…" : "Create Payment Link"}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Cancellation / refund details — only for cancelled applications */}
                          {selectedApp.status === "cancelled" && (
                            <div className="border border-brand-secondary/15 rounded-sm overflow-hidden">
                              <div className="px-3.5 py-2.5 bg-[#FAFAF8] border-b border-brand-secondary/10 flex items-center gap-2">
                                <Ban className="h-3.5 w-3.5 text-orange-500" />
                                <span className="font-mono text-[9px] uppercase tracking-wider text-orange-600 font-bold">
                                  Cancellation Details
                                </span>
                              </div>
                              <div className="p-3.5 space-y-2.5">
                                <div className="grid grid-cols-2 gap-2.5">
                                  <InfoRow label="Cancelled At" value={renderTimestamp(selectedApp.cancelledAt)} mono />
                                  <InfoRow
                                    label="Refund"
                                    value={selectedApp.refundPercent != null ? `${selectedApp.refundPercent}%` : undefined}
                                    mono
                                  />
                                </div>
                                {selectedApp.cancellationReason && (
                                  <InfoRow label="Reason" value={selectedApp.cancellationReason} />
                                )}
                              </div>
                            </div>
                          )}

                        </div>

                        {/* ─ Pinned action footer ─ */}
                        <div className="shrink-0 border-t border-[#082C6C]/10 bg-white">
                          {/* Footer header */}
                          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#082C6C]/8">
                            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#082C6C] font-bold">
                              Admission Decision
                            </span>
                            <span className={`font-mono text-[8px] px-2.5 py-1 rounded-full font-bold uppercase border ${appSC.badge}`}>
                              {appSC.label}
                            </span>
                          </div>

                          <div className="px-5 py-4 space-y-2.5">
                            {/* Stage buttons */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleUpdateAppStatus(selectedApp.id, "under_review")}
                                disabled={isActioning}
                                className={`py-2.5 text-[10px] font-mono font-bold uppercase tracking-wide rounded-sm border cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                                  selectedApp.status === "under_review"
                                    ? "bg-[#082C6C] text-white border-[#082C6C] shadow-sm"
                                    : "bg-white border-[#082C6C]/20 text-[#082C6C] hover:bg-[#082C6C]/5"
                                }`}
                              >
                                <Eye className="h-3 w-3" /> Auditing
                              </button>
                              <button
                                onClick={() => handleUpdateAppStatus(selectedApp.id, "interview_invited")}
                                disabled={isActioning}
                                className={`py-2.5 text-[10px] font-mono font-bold uppercase tracking-wide rounded-sm border cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                                  selectedApp.status === "interview_invited"
                                    ? "bg-purple-700 text-white border-purple-700 shadow-sm"
                                    : "bg-white border-purple-200 text-purple-700 hover:bg-purple-50"
                                }`}
                              >
                                <MessageSquare className="h-3 w-3" /> Interview
                              </button>
                            </div>

                            {/* Accept — primary CTA */}
                            <button
                              onClick={() => handleUpdateAppStatus(selectedApp.id, "accepted")}
                              disabled={isActioning}
                              className={`w-full py-3 font-mono text-[11px] font-bold uppercase tracking-wider rounded-sm border cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                                selectedApp.status === "accepted"
                                  ? "bg-emerald-700 text-white border-emerald-700"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-md"
                              }`}
                            >
                              <CheckCircle2 className="h-4 w-4" /> Accept as Fellow
                            </button>

                            {/* Decline */}
                            <button
                              onClick={() => handleUpdateAppStatus(selectedApp.id, "declined")}
                              disabled={isActioning}
                              className={`w-full py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider rounded-sm border cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                                selectedApp.status === "declined"
                                  ? "bg-red-600 text-white border-red-600"
                                  : "bg-white text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
                              }`}
                            >
                              <X className="h-3.5 w-3.5" /> Decline Application
                            </button>

                            {/* Cancel & Refund — only meaningful once accepted */}
                            {selectedApp.status === "accepted" && (
                              <button
                                onClick={() => setCancelModal({
                                  appId: selectedApp.id,
                                  applicantName: selectedApp.fullName,
                                  hasPaid: selectedApp.paymentStatus === "paid",
                                })}
                                disabled={isActioning}
                                className="w-full py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider rounded-sm border cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 bg-white text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                              >
                                <Ban className="h-3.5 w-3.5" /> Cancel &amp; Refund
                              </button>
                            )}

                            {/* Danger zone */}
                            <div className="pt-2 border-t border-dashed border-[#082C6C]/10">
                              <p className="font-mono text-[8px] text-brand-neutral/40 uppercase tracking-widest mb-2">Danger Zone</p>
                              <button
                                onClick={() => handleDeleteApplication(selectedApp.id)}
                                disabled={isActioning}
                                className="w-full py-2 bg-transparent hover:bg-red-50 text-red-400 hover:text-red-600 font-mono text-[9px] font-bold uppercase tracking-wider border border-dashed border-red-200 hover:border-red-300 transition-all cursor-pointer flex items-center justify-center gap-1.5 rounded-sm disabled:opacity-50"
                              >
                                <Trash2 className="h-3 w-3" /> Purge Candidate Record
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-2">
                      <div className="h-10 w-10 rounded-full bg-brand-secondary/5 flex items-center justify-center">
                        <User className="h-5 w-5 text-brand-neutral/30" />
                      </div>
                      <p className="font-serif italic text-sm text-brand-neutral">
                        Select an applicant to review
                      </p>
                      <p className="font-mono text-[9px] text-brand-neutral/50 uppercase tracking-wider">
                        {filteredApps.length} applicant{filteredApps.length !== 1 ? "s" : ""} in view
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ── CONTACT DETAIL ── */}
              {activeTab === "contacts" && (
                <>
                  {selectedContact ? (
                      <>
                        {/* Header */}
                        <div className="shrink-0 border-b border-white/10" style={{ background: "linear-gradient(135deg, #061a42 0%, #0D3B8E 100%)" }}>
                          {/* Top bar */}
                          <div className="flex items-center justify-between px-5 pt-4">
                            <span className="font-mono text-[8px] text-white/25 uppercase tracking-[0.14em]">Message Detail</span>
                            <button
                              onClick={() => setSelectedContact(null)}
                              className="h-7 w-7 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                              title="Close"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          {/* Identity */}
                          <div className="flex items-start gap-4 px-5 pt-3 pb-5">
                            <div className="w-13 h-13 rounded-full bg-white/15 border-2 border-[#D4A62A]/70 flex items-center justify-center shrink-0 shadow-lg" style={{ width: "3.25rem", height: "3.25rem" }}>
                              <span className="font-serif text-base font-black text-white">
                                {getInitials(selectedContact.name)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <h3 className="font-serif text-xl font-bold text-white leading-tight">
                                  {selectedContact.name}
                                </h3>
                                <span className={`font-mono text-[9px] px-2.5 py-1 font-bold uppercase tracking-wider rounded-full shrink-0 ${contactSC.darkBadge}`}>
                                  {contactSC.label}
                                </span>
                              </div>
                              <a
                                href={`mailto:${selectedContact.email}`}
                                className="font-mono text-[10px] text-white/55 hover:text-[#D4A62A] transition-colors flex items-center gap-1.5 mb-1"
                              >
                                <Mail className="h-3 w-3" /> {selectedContact.email}
                              </a>
                              <div className="font-mono text-[9px] text-white/35 flex items-center gap-1.5">
                                <Clock className="h-2.5 w-2.5" />
                                <span>{renderTimestamp(selectedContact.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-5 bg-[#F8F7F5]">
                          <div className="bg-white rounded-sm border border-brand-secondary/10 p-4 shadow-sm space-y-1">
                            <SectionLabel>Subject</SectionLabel>
                            <p className="font-serif text-sm font-bold text-brand-text leading-snug">
                              {selectedContact.subject}
                            </p>
                          </div>
                          <div className="bg-white rounded-sm border border-brand-secondary/10 p-4 shadow-sm space-y-1 overflow-hidden">
                            <SectionLabel>Message</SectionLabel>
                            <p className="font-sans text-xs text-brand-neutral leading-relaxed whitespace-pre-wrap break-words">
                              {selectedContact.message}
                            </p>
                          </div>
                        </div>

                        {/* Pinned footer */}
                        <div className="shrink-0 border-t border-[#082C6C]/10 bg-white">
                          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#082C6C]/8">
                            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#082C6C] font-bold">
                              Manage Message
                            </span>
                            <span className={`font-mono text-[8px] px-2.5 py-1 rounded-full font-bold uppercase border ${contactSC.badge}`}>
                              {contactSC.label}
                            </span>
                          </div>
                          <div className="px-5 py-4 space-y-2.5">
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleUpdateContactStatus(selectedContact.id, "read")}
                                disabled={isActioning}
                                className={`py-2.5 text-[10px] font-mono font-bold uppercase tracking-wide rounded-sm border cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                                  selectedContact.status === "read"
                                    ? "bg-[#082C6C] text-white border-[#082C6C] shadow-sm"
                                    : "bg-white border-[#082C6C]/20 text-[#082C6C] hover:bg-[#082C6C]/5"
                                }`}
                              >
                                <CheckCircle2 className="h-3 w-3" /> Mark Read
                              </button>
                              <button
                                onClick={() => handleUpdateContactStatus(selectedContact.id, "archived")}
                                disabled={isActioning}
                                className={`py-2.5 text-[10px] font-mono font-bold uppercase tracking-wide rounded-sm border cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                                  selectedContact.status === "archived"
                                    ? "bg-[#082C6C] text-white border-[#082C6C] shadow-sm"
                                    : "bg-white border-[#082C6C]/20 text-[#082C6C] hover:bg-[#082C6C]/5"
                                }`}
                              >
                                <FileText className="h-3 w-3" /> Archive
                              </button>
                            </div>
                            <div className="pt-2 border-t border-dashed border-[#082C6C]/10">
                              <p className="font-mono text-[8px] text-brand-neutral/40 uppercase tracking-widest mb-2">Danger Zone</p>
                              <button
                                onClick={() => handleDeleteContact(selectedContact.id)}
                                disabled={isActioning}
                                className="w-full py-2 bg-transparent hover:bg-red-50 text-red-400 hover:text-red-600 font-mono text-[9px] font-bold uppercase tracking-wider border border-dashed border-red-200 hover:border-red-300 transition-all cursor-pointer flex items-center justify-center gap-1.5 rounded-sm disabled:opacity-50"
                              >
                                <Trash2 className="h-3 w-3" /> Delete Message
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-2">
                      <div className="h-10 w-10 rounded-full bg-brand-secondary/5 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-brand-neutral/30" />
                      </div>
                      <p className="font-serif italic text-sm text-brand-neutral">
                        Select a message to read
                      </p>
                      <p className="font-mono text-[9px] text-brand-neutral/50 uppercase tracking-wider">
                        {filteredContacts.length} message{filteredContacts.length !== 1 ? "s" : ""} in view
                      </p>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
          )}
        </div>
      </div>
    </div>

    {/* ════════ CHANGE PASSWORD MODAL ════════ */}
    {showChangePassword && (
      <AdminChangePassword onClose={() => setShowChangePassword(false)} />
    )}

    {/* ════════ COHORT SETTINGS MODAL ════════ */}
    {showCohortSettings && (
      <CohortSettingsPanel
        showToast={showToast}
        onClose={() => setShowCohortSettings(false)}
      />
    )}

    {/* ════════ CANCEL & REFUND MODAL ════════ */}
    {cancelModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(10, 14, 22, 0.72)", backdropFilter: "blur(4px)" }}>
        <div className="bg-white border border-orange-500/30 rounded-sm shadow-2xl w-full max-w-md p-7 space-y-5">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-10 w-10 rounded-full bg-orange-100/60 flex items-center justify-center">
              <Ban className="h-5 w-5 text-orange-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-brand-text">
                Cancel {cancelModal.applicantName}&apos;s Enrolment{cancelModal.hasPaid ? " & Refund" : ""}
              </h3>
              <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                {cancelModal.hasPaid
                  ? "The refund tier (100% / 50% / 0%) is computed automatically from today's date vs. the cohort start date, and processed via Cashfree."
                  : "This applicant has not completed payment — cancelling will not create a refund. Any pending payment link will be invalidated."}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block font-mono text-[9px] text-brand-secondary font-bold uppercase tracking-wider">
              Reason (optional)
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Personal emergency"
              className="w-full bg-[#FCFAF6] text-brand-text px-3 py-2.5 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent text-xs resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setCancelModal(null); setCancelReason(""); }}
              disabled={isCancelling}
              className="flex-1 py-2.5 bg-white border border-brand-secondary/25 text-brand-secondary font-mono text-xs font-bold uppercase tracking-wider hover:bg-brand-secondary/5 transition-all rounded-sm cursor-pointer disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleCancelAndRefund}
              disabled={isCancelling}
              className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all rounded-sm cursor-pointer disabled:opacity-50"
            >
              {isCancelling ? "Processing…" : "Confirm Cancellation"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ════════ CONFIRM MODAL ════════ */}
    {confirmModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(10, 14, 22, 0.72)", backdropFilter: "blur(4px)" }}>
        <div className="bg-white border border-brand-secondary/20 rounded-sm shadow-2xl w-full max-w-md p-7 space-y-5">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-10 w-10 rounded-full bg-red-100/60 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-brand-text">Confirm Action</h3>
              <p className="font-sans text-xs text-brand-neutral leading-relaxed">{confirmModal.message}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setConfirmModal(null)}
              className="flex-1 py-2.5 bg-white border border-brand-secondary/25 text-brand-secondary font-mono text-xs font-bold uppercase tracking-wider hover:bg-brand-secondary/5 transition-all rounded-sm cursor-pointer">
              Cancel
            </button>
            <button
              onClick={async () => {
                const fn = confirmModal.onConfirm;
                setConfirmModal(null);
                await fn();
              }}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all rounded-sm cursor-pointer">
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ════════ PAYMENT WARNING MODAL ════════ */}
    {paymentWarningModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(10, 14, 22, 0.72)", backdropFilter: "blur(4px)" }}>
        <div className="bg-white border border-red-500/30 rounded-sm shadow-2xl w-full max-w-md p-7 space-y-5">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-10 w-10 rounded-full bg-amber-400/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-brand-text">Payment Already Received</h3>
              <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                This applicant has paid. Deleting this record will not trigger an automatic refund.
              </p>
            </div>
          </div>
          <div className="bg-brand-secondary/5 border border-brand-secondary/10 rounded-sm p-4 space-y-2.5 text-xs">
            {[
              { label: "Applicant", value: paymentWarningModal.applicantName },
              { label: "Email",     value: paymentWarningModal.applicantEmail },
              { label: "Amount",    value: paymentWarningModal.feeDisplay },
              ...(paymentWarningModal.rzpPaymentId ? [{ label: "Payment ID", value: paymentWarningModal.rzpPaymentId }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <span className="font-mono text-[10px] text-brand-neutral uppercase tracking-wider">{label}</span>
                <span className="font-sans text-brand-text font-medium truncate">{value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="font-sans text-xs text-amber-700 leading-relaxed">
              Issue the refund <strong>manually</strong> via the Cashfree dashboard.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setPaymentWarningModal(null)} disabled={isActioning}
              className="flex-1 py-2.5 bg-white border border-brand-secondary/25 text-brand-secondary font-mono text-xs font-bold uppercase tracking-wider hover:bg-brand-secondary/5 transition-all rounded-sm cursor-pointer disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleForceDeleteApplication} disabled={isActioning}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all rounded-sm cursor-pointer disabled:opacity-50">
              {isActioning ? "Deleting…" : "Delete Anyway"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ════════ STATUS CHANGE WARNING MODAL ════════ */}
    {statusChangeWarningModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(10, 14, 22, 0.72)", backdropFilter: "blur(4px)" }}>
        <div className="bg-white border border-amber-500/30 rounded-sm shadow-2xl w-full max-w-md p-7 space-y-5">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-10 w-10 rounded-full bg-amber-400/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-brand-text">Applicant Has Already Paid</h3>
              <p className="font-sans text-xs text-brand-neutral leading-relaxed">
                Changing to{" "}
                <span className="font-mono font-bold text-brand-text uppercase tracking-wide">
                  {statusChangeWarningModal.newStatus.replace(/_/g, " ")}
                </span>{" "}
                does not trigger a refund automatically.
              </p>
            </div>
          </div>
          <div className="bg-brand-secondary/5 border border-brand-secondary/10 rounded-sm p-4 space-y-2.5 text-xs">
            {[
              { label: "Applicant", value: statusChangeWarningModal.applicantName },
              { label: "Email",     value: statusChangeWarningModal.applicantEmail },
              { label: "Amount",    value: statusChangeWarningModal.feeDisplay },
              ...(statusChangeWarningModal.rzpPaymentId ? [{ label: "Payment ID", value: statusChangeWarningModal.rzpPaymentId }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <span className="font-mono text-[10px] text-brand-neutral uppercase tracking-wider">{label}</span>
                <span className="font-sans text-brand-text font-medium truncate">{value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-sm">
            <CreditCard className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="font-sans text-xs text-amber-700 leading-relaxed">
              If declining, issue a <strong>manual</strong> refund via the Cashfree dashboard.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStatusChangeWarningModal(null)} disabled={isActioning}
              className="flex-1 py-2.5 bg-white border border-brand-secondary/25 text-brand-secondary font-mono text-xs font-bold uppercase tracking-wider hover:bg-brand-secondary/5 transition-all rounded-sm cursor-pointer disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleConfirmedStatusChange} disabled={isActioning}
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all rounded-sm cursor-pointer disabled:opacity-50">
              {isActioning ? "Updating…" : "Change Status"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ════════ TOAST ════════ */}
    {toast && (
      <div className={`fixed top-5 right-5 z-[200] flex items-center gap-3 px-4 py-3 rounded-sm shadow-2xl border animate-fade-in max-w-xs ${
        toast.type === "success"
          ? "bg-white border-brand-accent/30 text-brand-text"
          : "bg-white border-red-400/30 text-brand-text"
      }`}>
        <div className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${
          toast.type === "success" ? "bg-brand-accent/15" : "bg-red-100/60"
        }`}>
          {toast.type === "success"
            ? <CheckCircle2 className="h-4 w-4 text-brand-accent" />
            : <AlertTriangle className="h-4 w-4 text-red-600" />
          }
        </div>
        <p className="font-sans text-xs text-brand-text flex-1 leading-relaxed">{toast.message}</p>
        <button onClick={() => setToast(null)} className="shrink-0 text-brand-neutral hover:text-brand-text transition-colors cursor-pointer">
          <X className="h-4 w-4" />
        </button>
      </div>
    )}
    </>
  );
};
