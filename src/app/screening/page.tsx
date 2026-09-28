import Link from "next/link";
import { Briefcase, ArrowRight } from "lucide-react";

export default function ScreeningBenchPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Screening Bench</h1>
        <p className="text-slate-500 mt-2">Existing Screening Bench integration point.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center justify-center">
        <div className="bg-indigo-50 p-4 rounded-full mb-6">
          <Briefcase className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Requirement & CV Screening</h2>
        <p className="text-slate-500 max-w-lg mx-auto mb-8">
          This is a placeholder for the existing Screening Bench application. The workflow moves from Requirement → Checklist → CVs → Screen → Results.
        </p>
        
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 w-full max-w-md">
          <h3 className="font-medium text-slate-900 mb-4">Mock Shortlisted Candidate</h3>
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="font-semibold text-slate-800">Rahul Sharma</p>
              <p className="text-sm text-slate-500">Android Developer</p>
            </div>
            <Link 
              href="/call-automation" 
              className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
            >
              Start Call Automation <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
