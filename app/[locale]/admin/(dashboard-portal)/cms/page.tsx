"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Save, 
  Image as ImageIcon, 
  Type, 
  Sparkles,
  RefreshCcw,
  CheckCircle2,
  Monitor
} from "lucide-react";

interface HeroConfig {
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  featuredImage: string;
}

export default function CMSEditor() {
  const [config, setConfig] = useState<HeroConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/admin/cms");
        const data = await res.json();
        if (data.success) setConfig(data.config);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "homepage_hero", value: config })
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

  if (isLoading) return <div className="p-8 animate-pulse bg-white rounded-[32px] h-96 border border-slate-100" />;

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Content Management</h1>
          <p className="text-slate-500 font-medium mt-1">Control the visual narrative of the VidioCV frontend.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => window.location.reload()}
             className="p-3 text-slate-400 hover:text-slate-600 transition-colors"
           >
             <RefreshCcw className="w-5 h-5" />
           </button>
           <button 
             form="cms-form"
             disabled={isSaving}
             className="px-6 py-3 bg-[#57595B] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-slate-200"
           >
             {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             {isSaving ? "Publishing..." : "Publish Changes"}
           </button>
        </div>
      </div>

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold text-sm"
        >
          <CheckCircle2 className="w-5 h-5" />
          Frontend configuration updated successfully. Changes are now live.
        </motion.div>
      )}

      <form id="cms-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Text Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
               <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                 <Type className="w-5 h-5" />
               </div>
               <h3 className="text-lg font-black text-slate-800 tracking-tight">Hero Section Text</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Main Headline</label>
                <input 
                  type="text"
                  value={config?.title || ""}
                  onChange={(e) => setConfig(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F7B980]/20 font-bold text-slate-800 text-lg"
                  placeholder="Enter headline..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subtitle / Narrative</label>
                <textarea 
                  rows={4}
                  value={config?.subtitle || ""}
                  onChange={(e) => setConfig(prev => prev ? { ...prev, subtitle: e.target.value } : null)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F7B980]/20 font-medium text-slate-600 leading-relaxed"
                  placeholder="Enter sub-headline description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary CTA Label</label>
                  <input 
                    type="text"
                    value={config?.ctaPrimary || ""}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, ctaPrimary: e.target.value } : null)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F7B980]/20 font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secondary CTA Label</label>
                  <input 
                    type="text"
                    value={config?.ctaSecondary || ""}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, ctaSecondary: e.target.value } : null)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F7B980]/20 font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visuals & Preview */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
               <div className="w-10 h-10 rounded-xl bg-[#F7B980]/10 flex items-center justify-center text-[#F7B980]">
                 <ImageIcon className="w-5 h-5" />
               </div>
               <h3 className="text-lg font-black text-slate-800 tracking-tight">Hero Imagery</h3>
            </div>

            <div className="space-y-4">
               <div className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 group relative overflow-hidden">
                  <div className="text-center p-4">
                    <Monitor className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Product Asset</p>
                  </div>
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" className="px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-xl cursor-pointer">
                      Replace Image
                    </button>
                  </div>
               </div>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset URL (Remote Path)</label>
                  <input 
                    type="text"
                    value={config?.featuredImage || ""}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, featuredImage: e.target.value } : null)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-500"
                  />
               </div>
            </div>
          </div>

          <div className="bg-[#57595B] p-8 rounded-[40px] text-white space-y-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-125 duration-700">
               <Sparkles className="w-16 h-16" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Visual Preview</h3>
            <div className="space-y-4 relative z-10">
               <div className="space-y-1">
                  <h4 className="text-lg font-black leading-tight line-clamp-2">{config?.title || "Headline Preview"}</h4>
                  <p className="text-white/50 text-[11px] font-medium line-clamp-3 leading-relaxed">{config?.subtitle || "Narrative preview text will appear here."}</p>
               </div>
               <div className="flex gap-2">
                  <div className="px-4 py-2 bg-[#F7B980] text-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {config?.ctaPrimary || "Primary"}
                  </div>
                  <div className="px-4 py-2 bg-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {config?.ctaSecondary || "Secondary"}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
