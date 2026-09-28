"use client";

import { useState } from "react";
import { AudioUploader } from "@/components/call/AudioUploader";
import { TranscriptViewer } from "@/components/call/TranscriptViewer";
import { ExtractionReview } from "@/components/call/ExtractionReview";
import { CheckCircle2 } from "lucide-react";
import { CandidateProcessingStatus } from "@/types/candidate";

const steps = [
  { id: "upload", name: "Upload" },
  { id: "transcribe", name: "Transcribe" },
  { id: "extract", name: "Extract" },
  { id: "review", name: "Review" },
  { id: "sync", name: "Sync" },
];

export default function CallAutomationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [callId, setCallId] = useState<string | null>(null);
  const [status, setStatus] = useState<CandidateProcessingStatus>("UPLOAD_PENDING");

  const handleUploadSuccess = (newCallId: string) => {
    setCallId(newCallId);
    // Since our MVP API processes it all synchronously (upload -> transcribe -> extract),
    // we can jump to review if it was successful.
    setCurrentStep(3); 
    setStatus("REVIEW_REQUIRED");
  };

  const handleSyncSuccess = () => {
    setCurrentStep(4);
    setStatus("SYNCED");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Call Recording Automation</h1>
        <p className="text-slate-500 mt-2 text-lg">Upload candidate call recordings and automatically extract structured recruitment data.</p>
      </div>

      {/* Stepper */}
      <nav aria-label="Progress">
        <ol role="list" className="flex items-center">
          {steps.map((step, stepIdx) => (
            <li key={step.name} className={`relative pr-8 sm:pr-20 ${stepIdx === steps.length - 1 ? 'pr-0' : ''}`}>
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className={`h-1 w-full ${currentStep > stepIdx ? 'bg-indigo-600' : 'bg-gray-200'}`} />
              </div>
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                  currentStep > stepIdx
                    ? 'bg-indigo-600 hover:bg-indigo-900'
                    : currentStep === stepIdx
                    ? 'border-2 border-indigo-600 bg-white'
                    : 'border-2 border-gray-300 bg-white'
                }`}
              >
                {currentStep > stepIdx ? (
                  <CheckCircle2 className="h-5 w-5 text-white" aria-hidden="true" />
                ) : (
                  <span className={`text-sm font-medium ${currentStep === stepIdx ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {stepIdx + 1}
                  </span>
                )}
              </div>
              <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap ${
                currentStep >= stepIdx ? 'text-indigo-600' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-12 pt-8">
        {currentStep === 0 && (
          <AudioUploader onUploadSuccess={handleUploadSuccess} />
        )}
        
        {currentStep === 3 && callId && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TranscriptViewer callId={callId} />
            <ExtractionReview callId={callId} onSyncSuccess={handleSyncSuccess} />
          </div>
        )}

        {currentStep === 4 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-green-900">Successfully Synced!</h2>
            <p className="text-green-700">The candidate data has been extracted, reviewed, and synced to Google Sheets.</p>
            <button 
              onClick={() => {
                setCurrentStep(0);
                setCallId(null);
                setStatus("UPLOAD_PENDING");
              }}
              className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              Process Another Call
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
