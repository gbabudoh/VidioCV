"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  BarChart3, 
  Globe, 
  Save, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon,
  Tag,
  Facebook,
  Target,
  MessageSquare,
  Bot,
  Zap
} from "lucide-react";

interface MarketingConfig {
  gaId: string;
  gtmId: string;
  fbPixelId: string;
  tiktokPixelId: string;
  xPixelId: string;
  linkedinPixelId: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  enableSitemap: boolean;
  geoAIOptimization: boolean;
  geoStructuredData: boolean;
  geoContextFirst: boolean;
}

export default function MarketingSettings() {
  const [config, setConfig] = useState<MarketingConfig>({
    gaId: "G-XXXXXXXXXX",
    gtmId: "GTM-XXXXXXX",
    fbPixelId: "",
    tiktokPixelId: "",
    xPixelId: "",
    linkedinPixelId: "",
    seoTitle: "VidioCV | The World's Most Trusted Talent Marketplace",
    seoDescription: "Elevate your hiring with AI-powered video resumes and validated skill assessments.",
    seoKeywords: "video cv, talent marketplace, ai hiring, recruitment, skill labs",
    enableSitemap: true,
    geoAIOptimization: true,
    geoStructuredData: true,
    geoContextFirst: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Fetch current marketing config
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/admin/marketing");
        const data = await res.json();
        if (data.success && data.config) {
          setConfig(prev => ({ ...prev, ...data.config }));
        }
      } catch (err) {
        console.error("Failed to fetch marketing config:", err);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Growth & Marketing</h1>
          <p className="text-slate-500 font-medium mt-1">Command center for SEO, tracking pixels, and global visibility.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-4 bg-[#57595B] text-white rounded-[24px] font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 cursor-pointer shadow-xl shadow-slate-200"
        >
          {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Publishing Changes..." : "Save Marketing Protocol"}
        </button>
      </div>

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold text-sm shadow-sm"
        >
          <CheckCircle2 className="w-5 h-5" />
          Growth configuration successfully propagated to the global CDN.
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SEO Configuration */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8 h-full">
          <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">SEO Architecture</h3>
              <p className="text-xs text-slate-400 font-medium">Optimize organic search visibility and indexing.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Meta Title Template</label>
              <input 
                type="text"
                value={config.seoTitle || ""}
                onChange={(e) => setConfig({...config, seoTitle: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Global Meta Description</label>
              <textarea 
                rows={4}
                value={config.seoDescription || ""}
                onChange={(e) => setConfig({...config, seoDescription: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Keywords (CSV)</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="text"
                  value={config.seoKeywords || ""}
                  onChange={(e) => setConfig({...config, seoKeywords: e.target.value})}
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Analytics & Tracking */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
           <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#F7B980]/10 flex items-center justify-center text-[#F7B980]">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Tracking & Signals</h3>
              <p className="text-xs text-slate-400 font-medium">Monitor user journey and conversion telemetry.</p>
            </div>
          </div>

          <div className="space-y-6">
             <div className="p-6 bg-slate-900 rounded-[32px] text-white space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Google Analytics 4 (GA4)</label>
                  <input 
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={config.gaId || ""}
                    onChange={(e) => setConfig({...config, gaId: e.target.value})}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white placeholder:text-white/20 focus:bg-white/10 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Google Tag Manager (GTM)</label>
                  <input 
                    type="text"
                    placeholder="GTM-XXXXXXX"
                    value={config.gtmId || ""}
                    onChange={(e) => setConfig({...config, gtmId: e.target.value})}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white placeholder:text-white/20 focus:bg-white/10 transition-all outline-none"
                  />
                </div>
             </div>

             <div className="p-6 border border-slate-100 rounded-[32px] space-y-6">
                <div className="flex items-center gap-2 mb-2">
                   <Facebook className="w-4 h-4 text-blue-600" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Omni-Channel Ad Trackers</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Meta Pixel (FB/IG)</label>
                    <input 
                      type="text"
                      value={config.fbPixelId || ""}
                      onChange={(e) => setConfig({...config, fbPixelId: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">TikTok Pixel</label>
                    <input 
                      type="text"
                      value={config.tiktokPixelId || ""}
                      onChange={(e) => setConfig({...config, tiktokPixelId: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">X (Twitter) Pixel</label>
                    <input 
                      type="text"
                      value={config.xPixelId || ""}
                      onChange={(e) => setConfig({...config, xPixelId: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">LinkedIn Insight</label>
                    <input 
                      type="text"
                      value={config.linkedinPixelId || ""}
                      onChange={(e) => setConfig({...config, linkedinPixelId: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 outline-none"
                    />
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Generative Engine Optimization (GEO) */}
        <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl space-y-8 col-span-1 lg:col-span-2 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
              <Bot className="w-32 h-32 text-white" />
           </div>
           <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#F7B980] flex items-center justify-center text-slate-900 shadow-lg shadow-[#F7B980]/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Generative Engine Optimization (GEO)</h3>
              <p className="text-xs text-white/40 font-medium uppercase tracking-widest">Optimizing for LLMs & AI Search (Perplexity, ChatGPT, Gemini)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { key: "geoAIOptimization", label: "AI Signal Boosting", desc: "Inject context-rich semantic signals for AI scrapers.", icon: MessageSquare },
               { key: "geoStructuredData", label: "Neural Schema", desc: "Propagate deep-linked structured data to LLM nodes.", icon: Zap },
               { key: "geoContextFirst", label: "Context-First Indexing", desc: "Prioritize descriptive metadata over standard keywords.", icon: Target }
             ].map((item) => (
               <div key={item.key} className="p-6 bg-white/5 rounded-[32px] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="p-2.5 bg-white/10 rounded-xl">
                        <item.icon className="w-4 h-4 text-[#F7B980]" />
                     </div>
                     <button 
                       onClick={() => setConfig({...config, [item.key]: !config[item.key as keyof MarketingConfig]})}
                       className={`w-12 h-6 rounded-full transition-all relative ${config[item.key as keyof MarketingConfig] ? "bg-[#F7B980]" : "bg-white/20"}`}
                     >
                       <div className={`absolute top-1 w-4 h-4 rounded-full bg-slate-900 transition-all ${config[item.key as keyof MarketingConfig] ? "left-7" : "left-1"}`} />
                     </button>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{item.label}</p>
                    <p className="text-[10px] font-medium text-white/40 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Sitemap & Global Indexing */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8 col-span-1 lg:col-span-2">
           <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Global Indexing Protocol</h3>
              <p className="text-xs text-slate-400 font-medium">Manage how VidioCV scales across traditional search engines.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                         <LinkIcon className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-800">Dynamic Sitemap</p>
                         <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">/sitemap.xml</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setConfig({...config, enableSitemap: !config.enableSitemap})}
                     className={`w-14 h-7 rounded-full transition-all relative ${config.enableSitemap ? "bg-emerald-500" : "bg-slate-300"}`}
                   >
                     <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${config.enableSitemap ? "left-8" : "left-1"}`} />
                   </button>
                </div>
             </div>

             <div className="p-6 bg-amber-50 rounded-[24px] border border-amber-100 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                   VidioCV uses a high-performance, edge-cached sitemap engine. Disabling this will prevent search engines from discovering new talent profiles and job postings automatically.
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
