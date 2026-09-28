"use client";

import Link from "next/link";
import { Users, Mic, CheckCircle, TrendingUp, ArrowRight, Activity, Clock, Zap } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const areaData = [
  { name: 'Mon', candidates: 4 },
  { name: 'Tue', candidates: 7 },
  { name: 'Wed', candidates: 5 },
  { name: 'Thu', candidates: 12 },
  { name: 'Fri', candidates: 8 },
  { name: 'Sat', candidates: 15 },
  { name: 'Sun', candidates: 21 },
];

const pieData = [
  { name: 'LinkedIn', value: 45 },
  { name: 'Naukri', value: 30 },
  { name: 'Referral', value: 15 },
  { name: 'Direct', value: 10 },
];

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

const barData = [
  { name: 'Engineering', count: 42 },
  { name: 'Product', count: 18 },
  { name: 'Design', count: 12 },
  { name: 'Sales', count: 28 },
];

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalCandidates: 0,
    hoursSaved: 0,
    avgSyncTime: "0s",
    aiAccuracy: "0%",
    chartData: null as any
  });

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      }
    }
    fetchMetrics();
  }, []);

  const { chartData } = metrics;
  const currentAreaData = chartData?.areaData || areaData;
  const currentPieData = chartData?.pieData || pieData;
  const currentBarData = chartData?.barData || barData;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            Analytics Overview
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Real-time insights into your AI recruitment pipeline.</p>
        </div>
        <Link 
          href="/call-automation" 
          className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-105 transition-all duration-300"
        >
          <Mic className="w-5 h-5" />
          <span>Process New Call</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Total Processed" 
          value={metrics.totalCandidates.toString()} 
          trend="+1" 
          icon={<Users className="w-6 h-6 text-blue-600" />} 
          color="bg-blue-50"
        />
        <KpiCard 
          title="Avg. Sync Time" 
          value={metrics.avgSyncTime} 
          trend="-0.5s" 
          icon={<Zap className="w-6 h-6 text-amber-600" />} 
          color="bg-amber-50"
        />
        <KpiCard 
          title="AI Accuracy" 
          value={metrics.aiAccuracy} 
          trend="+1.2%" 
          icon={<CheckCircle className="w-6 h-6 text-emerald-600" />} 
          color="bg-emerald-50"
        />
        <KpiCard 
          title="Hours Saved" 
          value={`${metrics.hoursSaved}h`} 
          trend="+0.5h" 
          icon={<Clock className="w-6 h-6 text-violet-600" />} 
          color="bg-violet-50"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Area Chart */}
        <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> Candidate Pipeline Volume
            </h3>
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Last 7 Days</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentAreaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="candidates" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorCandidates)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Sourcing Channels</h3>
          <p className="text-sm text-slate-500 mb-6">Where candidates are coming from</p>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {currentPieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="col-span-1 lg:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Roles Processed this Month</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgb(0 0 0 / 0.1)' }}/>
                <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, icon, color }: { title: string, value: string, trend: string, icon: React.ReactNode, color: string }) {
  const isPositive = trend.startsWith('+');
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${color}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${
          isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
          {trend}
        </div>
      </div>
      <div className="mt-6">
        <h4 className="text-slate-500 font-medium text-sm">{title}</h4>
        <p className="text-3xl font-extrabold text-slate-800 mt-1">{value}</p>
      </div>
    </div>
  );
}
