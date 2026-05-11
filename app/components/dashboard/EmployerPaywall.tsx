"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Lock, 
  Rocket, 
  CreditCard, 
  Zap, 
  Sparkles,
  Users,
  Video,
  ChevronRight
} from "lucide-react";

interface EmployerPaywallProps {
  onSubscribe: () => void;
}

const EmployerPaywall: React.FC<EmployerPaywallProps> = ({ onSubscribe }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop with extreme blur */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col lg:flex-row"
      >
        {/* Left: Branding & Benefits */}
        <div className="flex-1 p-10 lg:p-16 bg-slate-50 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #334155 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
           
           <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-[#F7B980]" />
                 </div>
                 <span className="text-xl font-black text-slate-800 tracking-tight">VidioCV <span className="text-[#F7B980]">Pro</span></span>
              </div>

              <div className="space-y-4">
                 <h2 className="text-4xl lg:text-5xl font-black text-slate-800 leading-tight">
                    Your trial has <br />
                    <span className="text-[#F7B980]">transitioned.</span>
                 </h2>
                 <p className="text-lg text-slate-500 font-medium leading-relaxed">
                    Access to your elite talent pipeline is currently locked. Upgrade to continue discovering high-fidelity candidates.
                 </p>
              </div>

              <div className="space-y-4 pt-4">
                 {[
                    { icon: Video, text: "Unlimited Video CV Submissions" },
                    { icon: Users, text: "Direct Messaging with Candidates" },
                    { icon: Sparkles, text: "AI-Driven Talent Archetypes" },
                    { icon: Zap, text: "Instant Skill Lab Results" }
                 ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                       <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                          <item.icon className="w-3.5 h-3.5 text-slate-400" />
                       </div>
                       <span className="text-sm font-bold text-slate-600">{item.text}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Checkout/Pricing */}
        <div className="w-full lg:w-[400px] p-10 lg:p-16 flex flex-col items-center justify-center text-center space-y-10">
           <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F7B980]">Unlimited Access Plan</p>
              <div className="flex items-baseline justify-center gap-1">
                 <span className="text-6xl font-black text-slate-800 tracking-tighter">$9.99</span>
                 <span className="text-slate-400 font-bold">/mo</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">Cancel anytime. No hidden fees.</p>
           </div>

           <div className="w-full space-y-4">
              <button 
                onClick={onSubscribe}
                className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-slate-800 hover:scale-[1.02] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 cursor-pointer"
              >
                 <CreditCard className="w-4 h-4 text-[#F7B980]" />
                 Start Subscription
                 <ChevronRight className="w-4 h-4" />
              </button>
              
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                 <Lock className="w-3 h-3" />
                 Secure 256-bit SSL Checkout
              </div>
           </div>

           <div className="pt-6 border-t border-slate-100 w-full">
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                 &quot;VidioCV is a game-changer for our hiring. The $9.99 price point is simply unbeatable for the quality of talent we find.&quot;
              </p>
              <p className="text-[10px] font-black text-slate-800 mt-2">— Sarah K., Startup Founder</p>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployerPaywall;
