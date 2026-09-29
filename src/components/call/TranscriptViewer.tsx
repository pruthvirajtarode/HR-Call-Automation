"use client";

import { useEffect, useState, useRef } from "react";
import { Copy, Download, Loader2, Search } from "lucide-react";

export function TranscriptViewer({ callId, initialData, highlightText }: { callId: string, initialData?: any, highlightText?: string | null }) {
  const [transcript, setTranscript] = useState<string | null>(initialData?.content || null);
  const [loading, setLoading] = useState(!initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightText) {
      setSearchTerm(highlightText);
      // Let the render happen then scroll
      setTimeout(() => {
        if (contentRef?.current) {
          const mark = contentRef.current.querySelector('mark');
          if (mark) {
            mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
  }, [highlightText]);

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
      <div className="p-4 border-b flex flex-col gap-3 bg-slate-50 rounded-t-2xl">
        <div className="flex items-center justify-between">
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
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search transcript..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto" ref={contentRef}>
        {transcript ? (
          <div className="space-y-4 text-sm leading-relaxed text-slate-700">
            {transcript.split('\n').map((line, i) => {
              // Simple highlighter
              let content: React.ReactNode = line;
              if (searchTerm && line.toLowerCase().includes(searchTerm.toLowerCase())) {
                const parts = line.split(new RegExp(`(${searchTerm})`, 'gi'));
                content = parts.map((part, index) => 
                  part.toLowerCase() === searchTerm.toLowerCase() 
                    ? <mark key={index} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5">{part}</mark>
                    : part
                );
              }
              
              return (
              <p key={i} className="mb-2">
                {line.startsWith('HR:') || line.startsWith('Interviewer:') || line.startsWith('Recruiter:') ? (
                  <span className="font-semibold text-indigo-700">{content}</span>
                ) : line.startsWith('Candidate:') || line.startsWith('Speaker') ? (
                  <span className="font-semibold text-emerald-700">{content}</span>
                ) : (
                  content
                )}
              </p>
              );
            })}
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
