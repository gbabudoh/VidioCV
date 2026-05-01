"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, 
  Zap, 
  Activity,
  Shield,
  Clock,
  Building2,
  ExternalLink,
  Search,
  RefreshCw,
  MoreVertical,
  Network
} from "lucide-react";

interface GlobalIntegration {
  id: string;
  type: string;
  status: string;
  updatedAt: string;
  employer: {
    name: string;
    email: string;
    type: string;
  };
}

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<GlobalIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  const fetchGlobalIntegrations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/integrations/status", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.integrations);
      }
    } catch (err) {
      console.error("Failed to fetch global integrations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalIntegrations();
  }, []);

  const filteredIntegrations = integrations.filter(i => {
    const matchesSearch = i.employer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          i.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "All" || i.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: integrations.length,
    active: integrations.filter(i => i.status === "active").length,
    lever: integrations.filter(i => i.type === "LEVER").length,
    error: integrations.filter(i => i.status === "error").length
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#F7B980] animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Infrastructure</p>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Global Integration Health</h1>
          <p className="text-white/40 font-medium mt-1">Real-time monitoring of all third-party enterprise connections.</p>
        </div>
        <button 
          onClick={fetchGlobalIntegrations}
          className="flex items-center gap-2.5 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh Signals
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Channels", value: stats.active, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Total Nodes", value: stats.total, icon: Network, color: "text-[#F7B980]", bg: "bg-[#F7B980]/10" },
          { label: "Lever Syncs", value: stats.lever, icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Signal Failures", value: stats.error, icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-500/10" }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 ${stat.bg} rounded-xl`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Live</span>
            </div>
            <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-[32px] border border-white/10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by employer or protocol..."
            className="w-full pl-12 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#F7B980]/10 focus:border-[#F7B980]/50 transition-all placeholder:text-white/20"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {["All", "LEVER", "GREENHOUSE", "SLACK"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filterType === type 
                ? "bg-[#F7B980] text-slate-900 shadow-lg shadow-[#F7B980]/20" 
                : "bg-white/5 text-white/40 hover:text-white border border-white/5"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Employer Node</th>
                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Protocol</th>
                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Signal Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Last Sync</th>
                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  [1,2,3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-8"><div className="h-6 bg-white/5 rounded-lg w-full" /></td>
                    </tr>
                  ))
                ) : filteredIntegrations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <Shield className="w-12 h-12 text-white/10 mx-auto mb-4" />
                      <p className="text-white/40 font-bold">No active integration signals found in this sector.</p>
                    </td>
                  </tr>
                ) : (
                  filteredIntegrations.map((item) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#F7B980]/10 flex items-center justify-center border border-[#F7B980]/20">
                            <Building2 className="w-5 h-5 text-[#F7B980]" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-white tracking-tight">{item.employer.name}</p>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{item.employer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                          <Zap className="w-3.5 h-3.5 text-[#F7B980]" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.type}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          item.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                          {item.status}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-white/40">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{new Date(item.updatedAt).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 text-white/40 hover:text-white transition-all cursor-pointer">
                            <Activity className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 text-white/40 hover:text-white transition-all cursor-pointer">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 text-white/40 hover:text-white transition-all cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Banner */}
      <div className="p-8 rounded-[40px] bg-gradient-to-br from-[#F7B980]/20 to-transparent border border-[#F7B980]/10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#F7B980] flex items-center justify-center shadow-lg shadow-[#F7B980]/20">
            <Shield className="w-7 h-7 text-slate-900" />
          </div>
          <div>
            <h4 className="text-lg font-black text-white tracking-tight uppercase">Governance Protocol Active</h4>
            <p className="text-sm font-medium text-white/40">All integration signals are routed through AES-256 encrypted tunnels with real-time audit logging.</p>
          </div>
        </div>
        <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all cursor-pointer">
          Download Compliance Log
        </button>
      </div>
    </div>
  );
}
