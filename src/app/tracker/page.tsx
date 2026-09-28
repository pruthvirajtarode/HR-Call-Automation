"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";

type Candidate = {
  id: string;
  candidateName: string | null;
  email: string | null;
  contactNumber: string | null;
  currentOrganization: string | null;
  totalExperience: string | null;
  currentLocation: string | null;
  createdAt: string;
  calls: any[];
  trackerSyncs: any[];
};

export default function TrackerPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const res = await fetch('/api/candidates');
        const data = await res.json();
        setCandidates(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidates();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Candidate Tracker</h1>
          <p className="text-slate-500 mt-2">View processed candidates and their Google Sheets sync status.</p>
        </div>
        <Link 
          href="/call-automation"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Process New Call
        </Link>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Experience & Location</th>
                <th className="px-6 py-4">Call Processing</th>
                <th className="px-6 py-4">Sheet Sync Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No candidates found. Start by processing a call.
                  </td>
                </tr>
              ) : (
                candidates.map((cand) => {
                  const latestCall = cand.calls?.[0];
                  const latestSync = cand.trackerSyncs?.[0];

                  return (
                    <tr key={cand.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{cand.candidateName || "Unknown"}</div>
                        <div className="text-slate-500">{cand.currentOrganization || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700">{cand.email || "-"}</div>
                        <div className="text-slate-500">{cand.contactNumber || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700">{cand.totalExperience || "-"}</div>
                        <div className="text-slate-500">{cand.currentLocation || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        {latestCall ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            latestCall.status === 'APPROVED' || latestCall.status === 'SYNCED' ? 'bg-green-100 text-green-700' :
                            latestCall.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {latestCall.status}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {latestSync ? (
                          <div className="flex items-center gap-2">
                            {latestSync.status === 'SUCCESS' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : latestSync.status === 'FAILED' ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500" />
                            )}
                            <span className={`text-xs font-medium ${
                              latestSync.status === 'SUCCESS' ? 'text-green-700' :
                              latestSync.status === 'FAILED' ? 'text-red-700' :
                              'text-amber-700'
                            }`}>
                              {latestSync.status}
                              {latestSync.sheetRowNumber && ` (Row ${latestSync.sheetRowNumber})`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Not Synced</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
