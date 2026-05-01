"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  MousePointer2,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange] = useState("Last 30 Days");

  const metrics = [
    { label: "Active Candidates", value: "2,842", change: "+14.2%", positive: true, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Employer Engagement", value: "86%", change: "+5.1%", positive: true, icon: Target, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Neural Match Rate", value: "92.4%", change: "+2.8%", positive: true, icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Platform Churn", value: "1.2%", change: "-0.4%", positive: true, icon: Activity, color: "text-rose-500", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Platform Analytics</h1>
          <p className="text-slate-500 font-medium mt-1">Advanced telemetry and growth performance metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
          <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <div className="h-8 w-[1px] bg-slate-200 mx-2" />
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10">
            <Calendar className="w-3.5 h-3.5 text-[#F7B980]" />
            {timeRange}
          </button>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${metric.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div className={`flex items-center gap-0.5 text-[10px] font-black ${metric.positive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2 py-1 rounded-lg`}>
                {metric.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {metric.change}
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{metric.label}</p>
            <h3 className="text-2xl font-black text-slate-800">{metric.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart (Simulated) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-lg font-black text-slate-800">Growth Projection</h3>
                <p className="text-xs font-medium text-slate-400">Candidate acquisition vs. Employer posting</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Candidates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F7B980]" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Employers</span>
                </div>
              </div>
            </div>

            {/* Chart Visualization */}
            <div className="h-[300px] w-full flex items-end justify-between gap-2 px-2 relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full h-[1px] bg-slate-50" />
                ))}
              </div>

              {/* Bars */}
              {[60, 45, 75, 55, 90, 65, 80, 50, 95, 70, 85, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar relative z-10">
                  <div className="w-full flex gap-1 items-end h-[240px]">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.5 + (i * 0.05), duration: 1 }}
                      className="flex-1 bg-blue-500/20 group-hover/bar:bg-blue-500 rounded-t-lg transition-all relative"
                    >
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-1.5 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                         {h * 12}
                       </div>
                    </motion.div>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h * 0.7}%` }}
                      transition={{ delay: 0.7 + (i * 0.05), duration: 1 }}
                      className="flex-1 bg-[#F7B980]/20 group-hover/bar:bg-[#F7B980] rounded-t-lg transition-all"
                    />
                  </div>
                  <span className="text-[9px] font-black text-slate-300 mt-2">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pie Chart Card */}
            <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Industry Distribution</h3>
                <PieChartIcon className="w-4 h-4 text-slate-300" />
              </div>
              <div className="flex items-center gap-8">
                <div className="relative w-32 h-32">
                   <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                     <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="4" />
                     <circle cx="18" cy="18" r="16" fill="none" className="stroke-blue-500" strokeWidth="4" strokeDasharray="65, 100" />
                     <circle cx="18" cy="18" r="16" fill="none" className="stroke-[#F7B980]" strokeWidth="4" strokeDasharray="25, 100" strokeDashoffset="-65" />
                   </svg>
                </div>
                <div className="space-y-3 flex-1">
                  {[
                    { label: "Technology", value: "65%", color: "bg-blue-500" },
                    { label: "Finance", value: "25%", color: "bg-[#F7B980]" },
                    { label: "Healthcare", value: "10%", color: "bg-emerald-400" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${item.color}`} />
                         <span className="text-[10px] font-bold text-slate-500">{item.label}</span>
                       </div>
                       <span className="text-[10px] font-black text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Efficiency Card */}
            <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Sourcing Efficiency</h3>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Response Time</span>
                       <span className="text-[10px] font-black text-slate-800">4.2 Hours</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-emerald-400" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Interview Ratio</span>
                       <span className="text-[10px] font-black text-slate-800">1:8 Matches</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} className="h-full bg-blue-400" />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-8">
          {/* Real-time Heatmap Placeholder */}
          <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group shadow-xl">
             <div className="absolute top-0 right-0 p-8">
                <BarChart3 className="w-8 h-8 text-white/5 group-hover:text-[#F7B980]/20 transition-all" />
             </div>
             <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Global Heatmap</h4>
             <h3 className="text-xl font-black mb-6">User Activity Hubs</h3>
             
             <div className="space-y-4">
                {[
                  { city: "Sydney, AU", active: "1.2k", load: 85 },
                  { city: "Lagos, NG", active: "850", load: 60 },
                  { city: "London, UK", active: "1.5k", load: 92 },
                  { city: "New York, US", active: "2.1k", load: 78 },
                ].map(item => (
                  <div key={item.city} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                       <span className="text-white/60">{item.city}</span>
                       <span>{item.active} active</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-[#F7B980]" style={{ width: `${item.load}%` }} />
                    </div>
                  </div>
                ))}
             </div>

             <button className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                View Network Topology
             </button>
          </div>

          {/* Acquisition Channels */}
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Acquisition Channels</h3>
             <div className="space-y-6">
                {[
                  { channel: "Organic Search", value: "45%", icon: MousePointer2, color: "text-blue-500" },
                  { channel: "LinkedIn Sync", value: "32%", icon: TrendingUp, color: "text-emerald-500" },
                  { channel: "Direct Referral", value: "15%", icon: Users, color: "text-[#F7B980]" },
                  { channel: "Other Sources", value: "8%", icon: Activity, color: "text-slate-400" },
                ].map(item => (
                  <div key={item.channel} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                       <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-800">{item.channel}</span>
                          <span className="text-[11px] font-black text-slate-900">{item.value}</span>
                       </div>
                       <div className="w-full h-1 bg-slate-50 rounded-full">
                          <div className={`h-full ${item.color.replace('text', 'bg')}`} style={{ width: item.value }} />
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
