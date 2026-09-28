"use client";

import Link from "next/link";
import { Mic, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, processed: 0, synced: 0 });

  useEffect(() => {
    // For MVP we just fetch from candidates API and do basic math
    async function fetchStats() {
      try {
        const res = await fetch('/api/candidates');
        const data = await res.json();
        
        let processed = 0;
        let synced = 0;
        
        data.forEach((c: any) => {
          if (c.calls && c.calls.length > 0) processed++;
          if (c.trackerSyncs && c.trackerSyncs.some((s: any) => s.status === 'SUCCESS')) synced++;
        });

        setStats({
          total: data.length,
          processed,
          synced
        });
      } catch (err) {
        console.error(err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">Overview of your HR Call Automation system.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Total Candidates</h3>
            <div className="bg-blue-50 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">{stats.total}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Calls Processed</h3>
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Mic className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">{stats.processed}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Synced to Sheets</h3>
            <div className="bg-green-50 p-2 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">{stats.synced}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center space-y-4 h-64">
          <div className="bg-indigo-50 p-4 rounded-full">
            <Mic className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-900">Process New Call</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Upload a new recording to extract candidate information.</p>
          </div>
          <Link href="/call-automation" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Start Processing
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center space-y-4 h-64">
          <div className="bg-blue-50 p-4 rounded-full">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-900">View Tracker</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Review approved candidates and their Google Sheet sync status.</p>
          </div>
          <Link href="/tracker" className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors">
            Open Tracker
          </Link>
        </div>
      </div>
    </div>
  );
}
