"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Mic, Activity, Settings, Briefcase, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import clsx from "clsx";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Screening Bench", href: "/screening", icon: Briefcase },
  { name: "Call Automation", href: "/call-automation", icon: Mic },
  { name: "Tracker", href: "/tracker", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile Menu Button - visible only on small screens when closed */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={clsx(
        "flex flex-col border-r bg-white h-screen sticky top-0 transition-all duration-300 z-50",
        isOpen ? "w-64 fixed md:relative" : "w-0 md:w-20 fixed md:relative -translate-x-full md:translate-x-0"
      )}>
        <div className={clsx("h-16 flex items-center border-b relative", isOpen ? "px-6" : "justify-center")}>
          {isOpen ? (
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
              <Activity className="h-6 w-6 shrink-0" />
              <span className="whitespace-nowrap">ScreeningBench AI</span>
            </div>
          ) : (
            <Activity className="h-6 w-6 shrink-0 text-indigo-600" />
          )}

          {/* Toggle Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-full p-1 shadow-sm hidden md:block"
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden absolute right-4 text-slate-400 hover:text-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2 overflow-hidden">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={!isOpen ? item.name : undefined}
                className={clsx(
                  "flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isOpen ? "px-3" : "justify-center",
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={clsx("h-5 w-5 shrink-0", isActive ? "text-indigo-600" : "text-slate-400")} />
                {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </div>
        
        {isOpen && (
          <div className="p-4 border-t text-xs text-slate-400 whitespace-nowrap">
            HR Automation MVP v1.0
          </div>
        )}
      </div>
    </>
  );
}
