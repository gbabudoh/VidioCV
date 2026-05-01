"use client";

import React, { useState } from "react";
import { 
  Save, 
  Shield, 
  Globe, 
  Lock,
  RefreshCcw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface GlobalConfig {
  maintenanceMode: boolean;
  maintenanceNotice: string;
  allowNewRegistrations: boolean;
  requireEmailVerification: boolean;
  platformFeePercentage: number;
}

export default function AdminSettings() {
  const [config, setConfig] = useState<GlobalConfig>({
    maintenanceMode: false,
    maintenanceNotice: "System upgrade in progress. We'll be back shortly.",
    allowNewRegistrations: true,
    requireEmailVerification: true,
    platformFeePercentage: 15,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // In a real app, this would call the CMS API with a 'global_settings' key
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "global_settings", value: config })
      });
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Global Settings</h1>
          <p className="text-slate-500 font-medium mt-1">Configure platform-wide parameters and security protocols.</p>
        </div>
        <button 
          form="settings-form"
          disabled={isSaving}
          className="px-6 py-3 bg-[#57595B] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-slate-200"
        >
          {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving..." : "Save Configuration"}
        </button>
      </div>

      {showSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5" />
          Settings successfully persisted to the platform infrastructure.
        </div>
      )}

      <form id="settings-form" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Platform Status */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Status & Recovery</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-800">Maintenance Mode</p>
                  <p className="text-[10px] font-medium text-slate-400">Lock the platform for system updates.</p>
               </div>
               <button 
                 type="button"
                 onClick={() => setConfig({...config, maintenanceMode: !config.maintenanceMode})}
                 className={`w-12 h-6 rounded-full transition-all relative ${config.maintenanceMode ? "bg-red-500" : "bg-slate-200"}`}
               >
                 <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.maintenanceMode ? "left-7" : "left-1"}`} />
               </button>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Maintenance Notice</label>
               <textarea 
                 rows={3}
                 value={config.maintenanceNotice}
                 onChange={(e) => setConfig({...config, maintenanceNotice: e.target.value})}
                 className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-600"
               />
            </div>
          </div>
        </div>

        {/* Access Control */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
            <div className="w-10 h-10 rounded-xl bg-[#F7B980]/10 flex items-center justify-center text-[#F7B980]">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Access Control</h3>
          </div>

          <div className="space-y-6">
             {([
               { key: "allowNewRegistrations", label: "New Registrations", desc: "Enable candidate & employer signups." },
               { key: "requireEmailVerification", label: "Email Hardening", desc: "Require verification before login." }
             ] as const).map((item) => (
               <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                     <p className="text-[11px] font-black uppercase tracking-widest text-slate-800">{item.label}</p>
                     <p className="text-[10px] font-medium text-slate-400">{item.desc}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setConfig({...config, [item.key]: !config[item.key as keyof GlobalConfig]})}
                    className={`w-12 h-6 rounded-full transition-all relative ${config[item.key as keyof GlobalConfig] ? "bg-emerald-500" : "bg-slate-200"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config[item.key as keyof GlobalConfig] ? "left-7" : "left-1"}`} />
                  </button>
               </div>
             ))}
          </div>
        </div>

        {/* Financial / Global */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6 col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Network Parameters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Enterprise Platform Fee (%)</label>
                <div className="flex items-center gap-4">
                   <input 
                     type="range"
                     min="0"
                     max="50"
                     value={config.platformFeePercentage}
                     onChange={(e) => setConfig({...config, platformFeePercentage: parseInt(e.target.value)})}
                     className="flex-1 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#F7B980]"
                   />
                   <span className="text-sm font-black text-slate-800 min-w-[30px]">{config.platformFeePercentage}%</span>
                </div>
             </div>
             
             <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-amber-700 leading-relaxed">
                  Modifying platform fees will only affect future transactions and subscriptions. Existing contracts will maintain their current rate.
                </p>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
}
