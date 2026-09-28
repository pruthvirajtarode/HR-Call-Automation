"use client";

import { useEffect, useState } from "react";
import { Copy, Download, Loader2 } from "lucide-react";

export function TranscriptViewer({ callId, initialData }: { callId: string, initialData?: any }) {
  const [transcript, setTranscript] = useState<string | null>(initialData?.content || null);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    async function fetchCall() {
      try {
        const res = await fetch(`/api/calls/${callId}`);
        const data = await res.json();
        if (data.transcript) {
          setTranscript(data.transcript.content);
        }
      } catch (error) {
        console.error("Failed to fetch transcript", error);
      } finally {
        setLoading(false);
      }
    }
    if (callId && !initialData) {
      fetchCall();
    }
  }, [callId, initialData]);

  const copyToClipboard = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
    }
  };

  const downloadTranscript = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${callId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-center h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[700px]">
      <div className="p-4 border-b flex items-center justify-between bg-slate-50 rounded-t-2xl">
        <h3 className="font-semibold text-slate-800">Call Transcript</h3>
        <div className="flex gap-2">
          <button onClick={copyToClipboard} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Copy to clipboard">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={downloadTranscript} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Download">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto">
        {transcript ? (
          <div className="space-y-4 text-sm leading-relaxed text-slate-700">
            {transcript.split('\n').map((line, i) => (
              <p key={i} className="mb-2">
                {line.startsWith('HR:') || line.startsWith('Interviewer:') ? (
                  <span className="font-semibold text-indigo-700">{line}</span>
                ) : line.startsWith('Candidate:') || line.startsWith('Speaker') ? (
                  <span className="font-semibold text-emerald-700">{line}</span>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            No transcript available.
          </div>
        )}
      </div>
    </div>
  );
}
