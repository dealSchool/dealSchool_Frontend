import React, { useState, useEffect } from "react";
import { X, Calendar, IndianRupee, CheckCircle2, AlertTriangle, Loader2, Plus, Users } from "lucide-react";
import { auth } from "@shared/firebase";
import { CohortSettings, CohortInfo, CohortsResponse, PaymentMode } from "@shared/types";
import { API_URL } from "@shared/config";

interface Props {
  onClose: () => void;
  showToast: (message: string, type?: "success" | "error") => void;
  paymentMode?: PaymentMode | null;
  paymentModeSaving?: boolean;
  onTogglePaymentMode?: () => void;
  /** Called after a cohort is created or the active cohort is switched, so the dashboard's cohort filter list refreshes. */
  onCohortsChanged?: () => void;
}

export const CohortSettingsPanel: React.FC<Props> = ({
  onClose,
  showToast,
  paymentMode,
  paymentModeSaving,
  onTogglePaymentMode,
  onCohortsChanged,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [feeInRupees, setFeeInRupees] = useState("");
  const [current, setCurrent] = useState<CohortSettings | null>(null);

  // Multi-cohort: every cohort that exists + which one new applications are attached to.
  const [cohorts, setCohorts] = useState<CohortInfo[]>([]);
  const [switchTo, setSwitchTo] = useState("");
  const [switching, setSwitching] = useState(false);

  // "Start new cohort" form — creates the next cohort and makes it active.
  const [showNewCohort, setShowNewCohort] = useState(false);
  const [confirmingNew, setConfirmingNew] = useState(false);
  const [startingNew, setStartingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newFee, setNewFee] = useState("");
  const [newSeats, setNewSeats] = useState("");

  const authedFetch = async (path: string, init?: RequestInit) => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Not authenticated");
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...(init?.headers || {}), Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  };

  // Loads the ACTIVE cohort's settings (GET /settings/cohort) and the cohort list (GET /cohorts).
  const loadAll = async () => {
    const [data, list]: [CohortSettings, CohortsResponse] = await Promise.all([
      authedFetch("/settings/cohort"),
      authedFetch("/cohorts"),
    ]);
    setCurrent(data);
    setStartDate(data.startDate ? data.startDate.slice(0, 10) : "");
    setFeeInRupees(data.feeInRupees != null ? String(data.feeInRupees) : "");
    setCohorts(list.cohorts);
    setSwitchTo(String(list.activeCohort));
  };

  useEffect(() => {
    (async () => {
      try {
        await loadAll();
      } catch (err: any) {
        setError(err.message || "Failed to load cohort settings.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCohortNumber = cohorts.find((c) => c.isActive)?.cohort ?? current?.cohort ?? null;
  const nextCohortNumber = cohorts.reduce((max, c) => Math.max(max, c.cohort), 0) + 1;

  const handleSwitchActive = async () => {
    const target = Number(switchTo);
    if (!Number.isInteger(target) || target === activeCohortNumber) return;
    setError(null);
    setSwitching(true);
    try {
      await authedFetch("/settings/cohort", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeCohort: target }),
      });
      await loadAll();
      onCohortsChanged?.();
      showToast(`Cohort ${target} is now the active cohort — new applications are attached to it.`, "success");
    } catch (err: any) {
      setError(err.message || "Failed to switch the active cohort.");
    } finally {
      setSwitching(false);
    }
  };

  const handleStartNewCohort = async () => {
    setError(null);
    const fee = Number(newFee);
    if (!newStartDate) { setError("Pick a start date for the new cohort."); setConfirmingNew(false); return; }
    if (!Number.isFinite(fee) || fee <= 0) { setError("Fee must be a positive number."); setConfirmingNew(false); return; }
    const seats = newSeats.trim() === "" ? undefined : Number(newSeats);
    if (seats !== undefined && !(Number.isInteger(seats) && seats > 0)) {
      setError("Seats must be a positive whole number.");
      setConfirmingNew(false);
      return;
    }

    setStartingNew(true);
    try {
      const created = await authedFetch("/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: newStartDate,
          feeInRupees: fee,
          ...(newName.trim() && { name: newName.trim() }),
          ...(seats !== undefined && { seats }),
        }),
      });
      await loadAll();
      onCohortsChanged?.();
      setShowNewCohort(false);
      setConfirmingNew(false);
      setNewName(""); setNewStartDate(""); setNewFee(""); setNewSeats("");
      showToast(`${created.name} started — it is now the active cohort.`, "success");
    } catch (err: any) {
      setError(err.message || "Failed to start the new cohort.");
      setConfirmingNew(false);
    } finally {
      setStartingNew(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const body: { startDate?: string; feeInRupees?: number } = {};
    if (startDate) body.startDate = startDate;
    if (feeInRupees.trim() !== "") {
      const fee = Number(feeInRupees);
      if (!Number.isFinite(fee) || fee <= 0) {
        setError("Fee must be a positive number.");
        return;
      }
      body.feeInRupees = fee;
    }
    if (!body.startDate && body.feeInRupees === undefined) {
      setError("Change the start date or fee before saving.");
      return;
    }

    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${API_URL}/settings/cohort`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setCurrent((prev) => ({ ...(prev ?? {}), ...data, startDate: data.startDate, feePaise: data.feePaise, feeInRupees: data.feeInRupees, feeDisplay: data.feeDisplay }));
      setStartDate(data.startDate.slice(0, 10));
      setFeeInRupees(String(data.feeInRupees));
      showToast("Cohort settings updated.", "success");
    } catch (err: any) {
      setError(err.message || "Failed to update cohort settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-brand-bg border border-brand-secondary/15 rounded-sm shadow-2xl space-y-6 p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-neutral hover:text-brand-text cursor-pointer transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 bg-brand-accent/10 border border-[#D4A62A]/25 rounded-md flex items-center justify-center text-brand-accent">
            <Calendar className="h-6 w-6" />
          </div>
          <span className="font-mono text-[9px] text-[#D4A62A] tracking-[0.12em] font-bold block uppercase">
            Program Configuration
          </span>
          <h3 className="font-serif text-xl font-bold text-brand-text">Cohort Settings</h3>
        </div>

        {paymentMode && (
          <div className="bg-[#FCFAF6] border border-brand-accent/20 p-3 rounded-sm flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="block font-mono text-[10px] text-brand-neutral uppercase font-bold">Live Payments</span>
              <span
                className={`inline-block font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  paymentMode === "live"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {paymentModeSaving ? "Updating…" : paymentMode === "live" ? "Live Mode" : "Sandbox Mode"}
              </span>
            </div>
            <button
              role="switch"
              aria-checked={paymentMode === "live"}
              aria-label="Live Payments"
              disabled={paymentModeSaving}
              onClick={onTogglePaymentMode}
              className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                paymentMode === "live" ? "bg-red-500" : "bg-brand-secondary/25"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  paymentMode === "live" ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-500/20 p-3 text-red-700 text-xs flex gap-2 items-start">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-8 flex items-center justify-center gap-2 font-mono text-xs text-brand-neutral uppercase tracking-widest">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {current && (
              <div className="bg-[#FCFAF6] border border-brand-accent/20 p-3 rounded-sm text-xs font-sans text-brand-neutral space-y-1">
                {current.name && (
                  <div>
                    Editing: <span className="font-bold text-brand-text">{current.name}</span>
                    {current.isActive && (
                      <span className="ml-2 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    )}
                  </div>
                )}
                <div>
                  Current start date:{" "}
                  <span className="font-bold text-brand-text">
                    {new Date(current.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div>
                  Current fee: <span className="font-bold text-brand-text">{current.feeDisplay}</span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-mono text-[10px] text-brand-neutral uppercase font-bold">
                Cohort Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#FCFAF6] text-brand-text pl-9 pr-3 py-3 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent text-sm"
                />
              </div>
              <p className="text-[10px] text-brand-neutral/50 font-sans">
                Only affects refund tiers computed after saving — does not alter already-issued refunds.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-[10px] text-brand-neutral uppercase font-bold">
                Fellowship Fee (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-neutral pointer-events-none" />
                <input
                  type="number"
                  min={1}
                  value={feeInRupees}
                  onChange={(e) => setFeeInRupees(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-[#FCFAF6] text-brand-text pl-9 pr-3 py-3 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent text-sm"
                />
              </div>
              <p className="text-[10px] text-brand-neutral/50 font-sans">
                Only affects new payment links created after saving — already-quoted applicants keep their price.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-60 text-[#FAFAF8] font-mono text-xs font-bold uppercase transition-all cursor-pointer rounded-sm flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Save Settings
                </>
              )}
            </button>
          </form>
        )}

        {!loading && cohorts.length > 0 && (
          <div className="border-t border-brand-secondary/15 pt-5 space-y-5">
            {/* Which cohort new applications are attached to */}
            <div className="space-y-1">
              <label className="block font-mono text-[10px] text-brand-neutral uppercase font-bold">
                Active Cohort — new applications attach to this
              </label>
              <div className="flex gap-2">
                <select
                  value={switchTo}
                  onChange={(e) => setSwitchTo(e.target.value)}
                  className="flex-1 bg-[#FCFAF6] text-brand-text px-3 py-3 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent text-sm"
                >
                  {cohorts.map((c) => (
                    <option key={c.cohort} value={c.cohort}>
                      {c.name}{c.isActive ? " (Active)" : ""}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSwitchActive}
                  disabled={switching || Number(switchTo) === activeCohortNumber}
                  className="px-4 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-40 disabled:cursor-not-allowed text-[#FAFAF8] font-mono text-[10px] font-bold uppercase transition-all cursor-pointer rounded-sm flex items-center justify-center gap-1.5"
                >
                  {switching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Users className="h-3.5 w-3.5" />} Set Active
                </button>
              </div>
            </div>

            {/* Start the next cohort */}
            {!showNewCohort ? (
              <button
                type="button"
                onClick={() => setShowNewCohort(true)}
                className="w-full py-3 border border-brand-secondary/25 hover:bg-brand-secondary/5 text-brand-secondary font-mono text-xs font-bold uppercase transition-all cursor-pointer rounded-sm flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" /> Start New Cohort (Cohort {nextCohortNumber})
              </button>
            ) : (
              <div className="space-y-3 bg-[#FCFAF6] border border-brand-accent/20 p-4 rounded-sm">
                <span className="font-mono text-[10px] text-[#D4A62A] tracking-[0.12em] font-bold uppercase block">
                  New Cohort {nextCohortNumber}
                </span>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={`Name (optional) — default "Cohort ${nextCohortNumber}"`}
                  className="w-full bg-white text-brand-text px-3 py-2.5 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-mono text-[9px] text-brand-neutral uppercase font-bold">Start Date</label>
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full bg-white text-brand-text px-3 py-2.5 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-mono text-[9px] text-brand-neutral uppercase font-bold">Fee (₹)</label>
                    <input
                      type="number"
                      min={1}
                      value={newFee}
                      onChange={(e) => setNewFee(e.target.value)}
                      placeholder="1000"
                      className="w-full bg-white text-brand-text px-3 py-2.5 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent text-sm"
                    />
                  </div>
                </div>
                <input
                  type="number"
                  min={1}
                  value={newSeats}
                  onChange={(e) => setNewSeats(e.target.value)}
                  placeholder="Seats (optional)"
                  className="w-full bg-white text-brand-text px-3 py-2.5 border border-brand-secondary/15 rounded-sm focus:outline-none focus:border-brand-accent text-sm"
                />

                {confirmingNew ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-red-700 font-sans leading-relaxed">
                      Cohort {nextCohortNumber} becomes the active cohort immediately — every new application, incomplete
                      application, message and brochure request will be attached to it. Existing records keep their cohort.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingNew(false)}
                        disabled={startingNew}
                        className="flex-1 py-2.5 border border-brand-secondary/25 text-brand-secondary font-mono text-[10px] font-bold uppercase cursor-pointer rounded-sm disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleStartNewCohort}
                        disabled={startingNew}
                        className="flex-1 py-2.5 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-60 text-[#FAFAF8] font-mono text-[10px] font-bold uppercase cursor-pointer rounded-sm flex items-center justify-center gap-1.5"
                      >
                        {startingNew ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Yes, Start Cohort {nextCohortNumber}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowNewCohort(false); setConfirmingNew(false); }}
                      className="flex-1 py-2.5 border border-brand-secondary/25 text-brand-secondary font-mono text-[10px] font-bold uppercase cursor-pointer rounded-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingNew(true)}
                      disabled={!newStartDate || newFee.trim() === ""}
                      className="flex-1 py-2.5 bg-brand-secondary hover:bg-brand-dark-blue disabled:opacity-40 disabled:cursor-not-allowed text-[#FAFAF8] font-mono text-[10px] font-bold uppercase cursor-pointer rounded-sm"
                    >
                      Review & Start
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
