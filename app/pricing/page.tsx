"use client";

import { motion } from "framer-motion";
import { Check, Zap, Building, User, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import axios from "axios";

const plans = [
  {
    name: "Candidate",
    icon: User,
    price: "0",
    description: "Build your professional video identity and get discovered.",
    features: [
      "AI-Enhanced Video Transcription",
      "Dynamic Resume Hosting",
      "Public Portfolio Link",
      "Basic Analytics",
      "Apply to Unlimited Jobs"
    ],
    priceId: "free",
    color: "#ACBAC4",
    buttonText: "Join for Free"
  },
  {
    name: "Employer Scale",
    icon: Building,
    price: "49.99",
    description: "High-fidelity sourcing for growing teams.",
    features: [
      "Unlimited Job Postings",
      "Neural Match AI Prioritization",
      "Collaborative Team Screening",
      "Bulk Video Export",
      "Priority Support & Dedicated Account Manager"
    ],
    priceId: "price_employer_scale_test", // Placeholder
    color: "#F7B980",
    buttonText: "Start Sourcing",
    featured: true
  }
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    if (priceId === "free") {
      window.location.href = "/auth/signup";
      return;
    }
    try {
      setLoading(priceId);
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/auth/login?redirect=/pricing";
        return;
      }

      const { data } = await axios.post("/api/payments/checkout", { priceId }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout failed", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F4F4] selection:bg-[#F7B980]/30 selection:text-[#57595B]">
      <Navbar />
      
      <main className="relative z-10 pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20 space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-[10px] font-black uppercase tracking-widest text-[#57595B] cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#F7B980]" />
              Elevate Your Journey
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[#57595B]">
              Kinetic <span className="text-[#F7B980]">Pricing</span>
            </h1>
            <p className="text-[#8A8C8E] font-medium text-lg max-w-2xl mx-auto">
              Choose the plan that fuels your professional evolution. Simple, transparent, and built for modern recruitment.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative group p-8 md:p-12 rounded-[48px] bg-white border-2 ${plan.featured ? 'border-[#F7B980]/20 shadow-2xl shadow-[#F7B980]/10' : 'border-[#F2F4F4]'} transition-all hover:-translate-y-2`}
              >
                {plan.featured && (
                  <div className="absolute top-8 right-8 px-4 py-1 rounded-full bg-[#F7B980] text-white text-[10px] font-black uppercase tracking-widest">
                    Most Popular
                  </div>
                )}

                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 cursor-pointer" style={{ backgroundColor: `${plan.color}20` }}>
                  <plan.icon className="w-8 h-8" style={{ color: plan.color }} />
                </div>

                <h3 className="text-3xl font-black text-[#57595B] mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-[#57595B]">${plan.price}</span>
                  <span className="text-[#ACBAC4] font-bold">/mo</span>
                </div>
                <p className="text-[#8A8C8E] font-medium mb-10 leading-relaxed">
                  {plan.description}
                </p>

                <div className="space-y-4 mb-12">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className="mt-1 p-0.5 rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-semibold text-[#57595B] opacity-80">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleCheckout(plan.priceId)}
                  disabled={loading === plan.priceId}
                  className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all cursor-pointer ${
                    plan.featured 
                    ? 'bg-[#F7B980] text-white shadow-xl shadow-[#F7B980]/25 hover:shadow-2xl' 
                    : 'bg-[#57595B] text-white hover:bg-[#F7B980]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.priceId ? 'Processing...' : (
                    <>
                      {plan.buttonText} <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Enterprise CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20 p-10 rounded-[40px] bg-[#57595B] text-center space-y-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                 style={{ backgroundImage: "radial-gradient(circle, white 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }} />
            <h2 className="text-3xl font-black text-white relative z-10">Need a custom solution?</h2>
            <p className="text-white/70 font-medium max-w-xl mx-auto relative z-10">
              For large enterprises or recruitment agencies requiring high-volume processing and custom integrations.
            </p>
            <button className="px-10 py-4 rounded-2xl bg-white text-[#57595B] font-black relative z-10 hover:bg-[#F7B980] hover:text-white transition-all cursor-pointer">
              Contact Enterprise Sales
            </button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
