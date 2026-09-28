"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Mic, Activity, Settings, Briefcase } from "lucide-react";
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

  return (
    <div className="flex flex-col w-64 border-r bg-white h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
          <Activity className="h-6 w-6" />
          <span>ScreeningBench AI</span>
        </div>
      </div>
      <div className="flex-1 py-6 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={clsx("h-5 w-5", isActive ? "text-indigo-600" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t text-xs text-slate-400">
        HR Call Automation MVP v1.0
      </div>
    </div>
  );
}
