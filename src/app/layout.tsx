import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScreeningBench AI | HR Call Automation",
  description: "Automate your recruitment call processing, transcription, and ATS syncing with advanced AI.",
  keywords: "HR, Recruitment, Call Automation, AI, Screening, Applicant Tracking",
  authors: [{ name: "ScreeningBench AI" }],
  openGraph: {
    title: "ScreeningBench AI",
    description: "AI-driven HR call automation and screening platform.",
    type: "website",
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} bg-slate-50 min-h-screen text-slate-900 flex`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
