import React, { useState, useEffect } from "react";
import { X, Calendar, IndianRupee, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { auth } from "@shared/firebase";
import { CohortSettings } from "@shared/types";
import { API_URL } from "@shared/config";

interface Props {
  onClose: () => void;
  showToast: (message: string, type?: "success" | "error") => void;
}

export const CohortSettingsPanel: React.FC<Props> = ({ onClose, showToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [feeInRupees, setFeeInRupees] = useState("");
  const [current, setCurrent] = useState<CohortSettings | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("Not authenticated");
        const res = await fetch(`${API_URL}/settings/cohort`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
        const data: CohortSettings = await res.json();
        setCurrent(data);
        setStartDate(data.startDate ? data.startDate.slice(0, 10) : "");
        setFeeInRupees(data.feeInRupees != null ? String(data.feeInRupees) : "");
      } catch (err: any) {
        setError(err.message || "Failed to load cohort settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      setCurrent({ startDate: data.startDate, feePaise: data.feePaise, feeInRupees: data.feeInRupees, feeDisplay: data.feeDisplay });
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
      <div className="w-full max-w-md bg-brand-bg border border-brand-secondary/15 rounded-sm shadow-2xl space-y-6 p-8 relative">
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
      </div>
    </div>
  );
};
