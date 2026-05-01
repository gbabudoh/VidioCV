"use client";

import { useState, useEffect, type ElementType } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  Database,
  Puzzle,
  Lock,
  MessageSquare,
  Network,
  Settings2,
  ExternalLink
} from "lucide-react";

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  connected: boolean;
  icon: ElementType;
  color: string;
  bg: string;
}

export default function IntegrationsContent() {
  const [activeTab, setActiveTab] = useState("ATS");
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationItem | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [triggerStageId, setTriggerStageId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dbIntegrations, setDbIntegrations] = useState<{type: string, status: string}[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("/api/integrations/status", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setDbIntegrations(data.integrations);
        }
      } catch (err) {
        console.error("Failed to fetch integrations:", err);
      }
    };
    fetchStatus();
  }, []);

  const integrations: IntegrationItem[] = [
    {
      id: "lever",
      name: "Lever",
      description: "Sync VidioCV match scores and video links directly to candidate notes.",
      type: "ATS",
      status: dbIntegrations.find(i => i.type === "LEVER")?.status === "active" ? "Connected" : "Ready",
      connected: dbIntegrations.some(i => i.type === "LEVER" && i.status === "active"),
      icon: Network,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      id: "greenhouse",
      name: "Greenhouse",
      description: "Automate video requests when candidates reach specific stages.",
      type: "ATS",
      status: "Early Access",
      connected: false,
      icon: Database,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      id: "slack",
      name: "Slack",
      description: "Receive real-time notifications for new video submissions and high-match alerts.",
      type: "Productivity",
      status: "Configurable",
      connected: false,
      icon: MessageSquare,
      color: "text-[#F7B980]",
      bg: "bg-[#F7B980]/10"
    },
    {
      id: "workday",
      name: "Workday",
      description: "Deep enterprise integration for high-volume recruitment compliance.",
      type: "ATS",
      status: "Planned",
      connected: false,
      icon: Puzzle,
      color: "text-slate-400",
      bg: "bg-slate-50"
    }
  ];

  const handleConnect = async () => {
    if (selectedIntegration?.id !== "lever") {
      alert(`${selectedIntegration?.name} integration is currently in ${selectedIntegration?.status} phase.`);
      setIsConnecting(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/integrations/lever/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          apiKey, 
          config: { triggerStageId } 
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setIsConnecting(false);
          setSuccess(false);
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ecosystem Integrations</h1>
          <p className="text-slate-500 font-medium mt-1">Connect VidioCV to your enterprise recruitment stack.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {["All", "ATS", "Productivity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === tab 
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" 
                : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Hero */}
      <div className="bg-[#57595B] rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-[0.05]"
             style={{ 
               backgroundImage: "radial-gradient(circle, white 0.5px, transparent 0.5px)", 
               backgroundSize: "32px 32px"
             }} />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10">
              <Zap className="w-4 h-4 text-[#F7B980]" />
              <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Feature</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight leading-tight">
              Bi-directional <br />
              <span className="text-[#F7B980]">Recruitment Sync</span>
            </h2>
            <p className="text-white/60 font-medium text-lg max-w-md">
              Reduce time-to-hire by 40% by bringing kinetic candidate data directly into your primary ATS dashboard.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all active:scale-95 flex items-center gap-3 cursor-pointer">
                Request API Keys <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-4 bg-white/10 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-3 cursor-pointer">
                Documentation <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center justify-center relative">
             <div className="w-24 h-24 bg-white/10 rounded-[32px] border border-white/20 flex items-center justify-center relative z-10 backdrop-blur-xl">
                <Sparkles className="w-10 h-10 text-[#F7B980]" />
             </div>
             <div className="absolute w-[300px] h-[300px] border border-white/5 rounded-full animate-[spin:10s_linear_infinite]" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {integrations.filter(i => activeTab === "All" || i.type === activeTab).map((item) => (
          <motion.div
            key={item.name}
            className={`bg-white rounded-[40px] border border-slate-200 p-10 flex flex-col shadow-sm hover:shadow-xl transition-all group`}
          >
            <div className="flex justify-between items-start mb-8">
               <div className={`w-16 h-16 ${item.bg} rounded-[24px] flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-8 h-8 ${item.color}`} />
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-400 rounded-full">
                  <span className="text-[10px] font-black uppercase">{item.status}</span>
               </div>
            </div>

            <h3 className="text-xl font-black text-slate-800 mb-3">{item.name}</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10 flex-1">
              {item.description}
            </p>

            <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={() => {
                  setSelectedIntegration(item);
                  setIsConnecting(true);
                }}
                className="text-[11px] font-black uppercase tracking-widest text-slate-900 hover:text-[#F7B980] transition-colors flex items-center gap-2 group/btn cursor-pointer"
              >
                {item.id === 'lever' ? 'Initialize Connection' : 'Early Access Request'}
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
              <Settings2 className="w-4 h-4 text-slate-200" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Connection Slide-over Modal */}
      {isConnecting && selectedIntegration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsConnecting(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            className="relative w-full max-w-xl h-full bg-white shadow-2xl p-12 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-12">
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${selectedIntegration.bg} rounded-2xl flex items-center justify-center`}>
                    <selectedIntegration.icon className={`w-6 h-6 ${selectedIntegration.color}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">Connect to {selectedIntegration.name}</h3>
                    <p className="text-sm font-medium text-slate-400">Establish bi-directional data flow.</p>
                  </div>
               </div>
               <button onClick={() => setIsConnecting(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer">
                 ✕
               </button>
            </div>

            <div className="space-y-8">
              <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Step 1: Authorization</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Lever API Key</label>
                    <input 
                      type="password"
                      placeholder="••••••••••••••••••••••••"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Step 2: Workflow Automation</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Trigger Stage ID</label>
                    <input 
                      type="text"
                      placeholder="e.g. vidio-cv-screening-001"
                      value={triggerStageId}
                      onChange={(e) => setTriggerStageId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all"
                    />
                    <p className="text-[9px] text-slate-400 font-medium leading-relaxed px-1">
                      Enter the ID of the stage in Lever that should trigger a VidioCV invitation.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleConnect}
                disabled={isLoading || success}
                className={`w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl cursor-pointer ${
                  success ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isLoading ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Connection Secured
                  </>
                ) : (
                  <>
                    Authenticate & Sync
                    <Zap className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-12 p-6 border border-dashed border-slate-200 rounded-[32px] flex gap-4">
               <Lock className="w-5 h-5 text-slate-300 shrink-0 mt-1" />
               <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                 API keys are stored using industry-standard AES-256 encryption. VidioCV never shares your integration credentials with third parties.
               </p>
            </div>
          </motion.div>
        </div>
      )}
      {/* Security Banner */}
      <div className="bg-slate-50 rounded-[32px] p-8 border border-dashed border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8 mt-12">
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Lock className="w-6 h-6 text-slate-400" />
           </div>
           <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Encrypted API Tunnel</h4>
              <p className="text-xs font-medium text-slate-500">All third-party data is synchronized through isolated, encrypted AES-256 tunnels.</p>
           </div>
        </div>
        <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all cursor-pointer">
           Security Whitepaper
        </button>
      </div>
    </div>
  );
}
