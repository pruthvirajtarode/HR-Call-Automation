"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { CandidateExtractionSchema } from "@/types/candidate";

type FlattenedData = Record<string, any>;

export function ExtractionReview({ callId, onSyncSuccess, initialData }: { callId: string, onSyncSuccess: () => void, initialData?: any }) {
  const [data, setData] = useState<FlattenedData | null>(initialData ? JSON.parse(initialData.extractedData) : null);
  const [loading, setLoading] = useState(!initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCall() {
      try {
        const res = await fetch(`/api/calls/${callId}`);
        const result = await res.json();
        if (result.extraction) {
          const parsed = JSON.parse(result.extraction.extractedData);
          setData(parsed);
        }
      } catch (err) {
        console.error("Failed to fetch extraction", err);
      } finally {
        setLoading(false);
      }
    }
    if (callId && !initialData) {
      fetchCall();
    }
  }, [callId, initialData]);

  const handleChange = (key: string, newValue: string) => {
    if (!data) return;
    setData({
      ...data,
      [key]: {
        ...data[key],
        value: newValue,
        status: "manually_corrected"
      }
    });
  };

  const handleApprove = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/candidates/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId, candidateData: data })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to sync");
      onSyncSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-center h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-center h-[500px] text-slate-500">
        No extracted data available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[700px]">
      <div className="p-4 border-b bg-slate-50 rounded-t-2xl flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">AI Extracted Information</h3>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">Review Required</span>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto space-y-5">
        {Object.entries(data).map(([key, field]) => {
          const typedField = field as { value: string | null; confidence: number; source_text: string | null; status: string };
          
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 capitalize">
                  {key.replace(/_/g, " ")}
                </label>
                {typedField.status === "missing" && (
                  <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Missing
                  </span>
                )}
                {typedField.status === "uncertain" && (
                  <span className="text-xs text-amber-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Uncertain
                  </span>
                )}
                {typedField.status === "manually_corrected" && (
                  <span className="text-xs text-indigo-500 font-medium">Edited</span>
                )}
              </div>
              <input
                type="text"
                value={typedField.value || ""}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder="Not mentioned"
                className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  typedField.status === 'missing' 
                    ? 'border-red-200 bg-red-50/30' 
                    : typedField.status === 'uncertain'
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
              {typedField.source_text && (
                <div className="flex items-start gap-1.5 mt-1 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                  <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span className="italic">"{typedField.source_text}"</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t bg-slate-50 rounded-b-2xl">
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button 
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handleApprove}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Approve & Sync to Google Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
