"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NextImage from "next/image";
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  IdCard,
  Lock,
  ArrowRight,
  Trash2,
  Brain
} from "lucide-react";

interface IdentityVerificationProps {
  currentStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  onUpload: (file: File) => Promise<void>;
}

const IdentityVerification: React.FC<IdentityVerificationProps> = ({ currentStatus, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      await onUpload(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
      <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
            <ShieldCheck className={`w-6 h-6 ${currentStatus === 'VERIFIED' ? 'text-emerald-500' : 'text-[#F7B980]'}`} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Identity Protocol</h3>
            <p className="text-sm text-slate-500 font-medium">Verify your government documentation to earn the Trusted Talent badge.</p>
          </div>
        </div>
        
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          currentStatus === 'VERIFIED' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-600' :
          currentStatus === 'PENDING' ? 'bg-amber-50/50 border-amber-100 text-amber-600' :
          'bg-slate-100 border-slate-200 text-slate-500'
        }`}>
          {currentStatus}
        </div>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {currentStatus === "UNVERIFIED" && (
            <motion.div 
              key="unverified"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <IdCard className="w-5 h-5 text-slate-400" />
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Accepted Docs</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Passport, National ID Card, or Driving Licence (front & back if applicable).</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Privacy First</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Documents are used for one-time verification and then purged from our active storage.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <Brain className="w-5 h-5 text-slate-400" />
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Augmented</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Local neural matching compares your ID photo with your Video Resume for accuracy.</p>
                </div>
              </div>

              {!file ? (
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative h-64 border-2 border-dashed rounded-[32px] transition-all flex flex-col items-center justify-center space-y-4 ${
                    dragActive ? "border-[#F7B980] bg-[#F7B980]/5" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                  />
                  <div className="p-4 bg-slate-50 rounded-full">
                    <Upload className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-800">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG or PDF (MAX. 5MB)</p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-[32px] overflow-hidden border-2 border-slate-100 bg-slate-50 aspect-video group">
                  {preview ? (
                    <NextImage src={preview} alt="ID Preview" fill className="object-contain" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={() => { setFile(null); setPreview(null); }}
                      className="p-3 bg-white rounded-full text-rose-500 hover:scale-110 transition-transform shadow-xl cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleSubmit}
                      disabled={isUploading}
                      className="px-6 py-3 bg-[#F7B980] text-white rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl flex items-center gap-2 cursor-pointer"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit for Review"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {currentStatus === "PENDING" && (
            <motion.div 
              key="pending"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-100">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              </div>
              <div className="max-w-xs mx-auto space-y-3">
                <h3 className="text-xl font-black text-slate-800">Verification in Progress</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Our neural engine is analyzing your document against your Video Resume. An administrator will perform a final review shortly.
                </p>
              </div>
              <div className="pt-4">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Expected Response: 12-24 Hours
                 </div>
              </div>
            </motion.div>
          )}

          {currentStatus === "VERIFIED" && (
            <motion.div 
              key="verified"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-8"
            >
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                <div className="relative w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
              </div>
              <div className="max-w-sm mx-auto space-y-4">
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">Identity Verified</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Congratulations! Your professional identity has been verified. You now have the **Trusted Talent** badge on all your applications.
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 inline-block text-left max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Privacy Confirmation</span>
                </div>
                <p className="text-[11px] text-slate-500">Your documentation has been successfully purged from our active storage following successful verification.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Disclaimer */}
      <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center gap-4">
        <AlertCircle className="w-5 h-5 text-slate-300 shrink-0" />
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
          Identity verification is optional but highly recommended. It increases your trust score with potential employers and is a requirement for certain high-security roles.
        </p>
      </div>
    </div>
  );
};

export default IdentityVerification;
