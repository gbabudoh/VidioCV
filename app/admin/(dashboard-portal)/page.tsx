"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Building2, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  Activity,
  Clock,
  ExternalLink,
  ShieldAlert
} from "lucide-react";

interface ActivityItem {
  id: number;
  type: "registration" | "job_post" | "inquiry" | "payment";
  user: string;
  role: string;
  time: string;
  amount?: string;
}

interface AdminStats {
  users: { candidates: number; employers: number; total: number };
  jobs: { active: number };
  engagement: { inquiries: number };
  revenue: { total: number; transactions: number };
  recentActivity: ActivityItem[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) setStats(data.stats);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Active Candidates", value: stats?.users.candidates || 0, icon: Users, color: "text-[#F7B980]", bg: "bg-[#F7B980]/10", trend: "+12%" },
    { label: "Partner Employers", value: stats?.users.employers || 0, icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+5%" },
    { label: "Live Job Listings", value: stats?.jobs.active || 0, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+8%" },
    { label: "Total Revenue", value: `$${stats?.revenue.total.toLocaleString()}` || "$0", icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10", trend: "+15%" },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Executive Overview</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time platform intelligence signals.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Telemetry</span>
           </div>
           <button className="px-5 py-3 bg-[#57595B] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 cursor-pointer flex items-center gap-2">
             <ExternalLink className="w-4 h-4" />
             Public Site
           </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 ${card.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3" />
                {card.trend}
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{card.label}</p>
            <h3 className="text-3xl font-black text-slate-800">{isLoading ? "..." : card.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Live Activity</h3>
              <Activity className="w-4 h-4 text-[#F7B980]" />
            </div>
            <div className="p-2">
              {(stats?.recentActivity || []).map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                    {item.type === "registration" && <Users className="w-5 h-5 text-blue-400" />}
                    {item.type === "job_post" && <Briefcase className="w-5 h-5 text-emerald-400" />}
                    {item.type === "inquiry" && <Activity className="w-5 h-5 text-amber-400" />}
                    {item.type === "payment" && <DollarSign className="w-5 h-5 text-[#F7B980]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 truncate">
                      {item.user} <span className="text-slate-400 font-medium">({item.role})</span>
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      {item.type === "registration" && "Joined the network"}
                      {item.type === "job_post" && "Posted a new listing"}
                      {item.type === "inquiry" && "Sent a direct inquiry"}
                      {item.type === "payment" && `Processed subscription (${item.amount})`}
                    </p>
                  </div>
                  <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/30">
               <button className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                 View Global Audit Trail
               </button>
            </div>
          </div>
        </div>

        {/* Analytics Placeholder (Charts would go here) */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[40px] border border-slate-200 p-8 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden group shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#F7B980]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <TrendingUp className="w-16 h-16 text-slate-100 mb-6 group-hover:scale-110 group-hover:text-[#F7B980]/20 transition-all duration-700" />
              <h3 className="text-xl font-black text-slate-800 mb-2">Platform Growth Analytics</h3>
              <p className="text-slate-500 font-medium text-center max-w-sm mb-8">
                Neural match data and subscription growth trends will be visualized here once more telemetry is collected.
              </p>
              <div className="flex gap-4">
                 <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className="w-1/2 h-full bg-[#F7B980] animate-pulse" />
                 </div>
                 <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className="w-3/4 h-full bg-emerald-400 animate-pulse delay-75" />
                 </div>
                 <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className="w-1/3 h-full bg-blue-400 animate-pulse delay-150" />
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#57595B] rounded-[32px] p-8 text-white relative overflow-hidden group shadow-xl">
                 <div className="absolute top-0 right-0 p-8">
                    <ShieldAlert className="w-8 h-8 text-white/10 group-hover:text-[#F7B980]/30 group-hover:scale-110 transition-all" />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Compliance Alert</h4>
                 <h3 className="text-xl font-black mb-4">Pending Identity <br /> Verifications</h3>
                 <p className="text-white/60 text-xs font-medium mb-8 leading-relaxed">
                   32 candidates are awaiting manual identity review to maintain network integrity.
                 </p>
                 <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                    Review Queue
                 </button>
              </div>

              <div className="bg-white rounded-[32px] p-8 border border-slate-200 relative group shadow-sm">
                 <div className="absolute top-0 right-0 p-8">
                    <TrendingUp className="w-8 h-8 text-slate-100 group-hover:text-emerald-500/20 group-hover:scale-110 transition-all" />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Enterprise Scale</h4>
                 <h3 className="text-xl font-black text-slate-800 mb-4">Talent Sourcing <br /> Efficiency</h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-400 uppercase">Avg Match Score</span>
                       <span className="text-xs font-black text-slate-800">82.4%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full">
                       <div className="w-[82%] h-full bg-emerald-500" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
