"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  User,
  ExternalLink,
  Zap
} from "lucide-react";
import Image from "next/image";

interface PendingUser {
  id: string;
  email: string;
  identityStatus: string;
  identityDocumentKey: string;
  identityMatchScore: number;
  createdAt: string;
}

export default function CompliancePage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchPending = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/compliance");
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleReview = async (userId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      setIsReviewing(true);
      const res = await fetch("/api/admin/compliance/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== userId));
        setSelectedUser(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Trust & Safety</p>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Compliance Queue</h1>
          <p className="text-slate-500 font-medium mt-1">Review pending candidate identity verifications.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
           <div className="px-4 py-2 bg-blue-50 rounded-xl">
              <p className="text-[10px] font-black text-blue-600 uppercase">Pending Review</p>
              <p className="text-xl font-black text-blue-700">{users.length}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List of Pending Users */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            [1,2,3].map(i => (
              <div key={i} className="h-24 bg-white rounded-3xl border border-slate-100 animate-pulse" />
            ))
          ) : users.length === 0 ? (
            <div className="p-20 text-center bg-white rounded-[40px] border border-slate-200 shadow-sm">
               <ShieldCheck className="w-16 h-16 text-emerald-100 mx-auto mb-4" />
               <h3 className="text-lg font-black text-slate-800">Queue is Clear</h3>
               <p className="text-slate-400 font-medium">No pending identity verifications at this time.</p>
            </div>
          ) : (
            users.map((user) => (
              <motion.div
                key={user.id}
                layoutId={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-6 rounded-[32px] border transition-all cursor-pointer group ${
                  selectedUser?.id === user.id 
                  ? "bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/5" 
                  : "bg-white border-slate-100 hover:border-blue-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{user.email}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                          <Clock className="w-3 h-3" /> {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Zap className="w-3 h-3" /> {user.identityMatchScore}% AI Match
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 group-hover:text-blue-500 transition-all">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Review Panel */}
        <div className="lg:col-span-1">
           <AnimatePresence mode="wait">
             {selectedUser ? (
               <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-xl sticky top-8"
               >
                 <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-3xl bg-blue-50 mx-auto flex items-center justify-center mb-4 border border-blue-100 shadow-inner">
                       <ShieldCheck className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800">Verification Review</h3>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">{selectedUser.email}</p>
                 </div>

                 <div className="space-y-6">
                    <div className="aspect-[4/3] bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden relative group">
                       <Image 
                         src={selectedUser.identityDocumentKey || "https://images.unsplash.com/photo-1557683316-973673baf926?w=800"} 
                         alt="ID Document"
                         fill
                         className="object-cover"
                       />
                       <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button className="px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                             <ExternalLink className="w-3 h-3" /> View Fullscreen
                          </button>
                       </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase">AI confidence</span>
                          <span className="text-sm font-black text-slate-800">{selectedUser.identityMatchScore}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedUser.identityMatchScore}%` }}
                            className="h-full bg-blue-500"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         disabled={isReviewing}
                         onClick={() => handleReview(selectedUser.id, 'REJECTED')}
                         className="flex items-center justify-center gap-2 py-4 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                       >
                          <XCircle className="w-4 h-4" /> Reject
                       </button>
                       <button 
                         disabled={isReviewing}
                         onClick={() => handleReview(selectedUser.id, 'VERIFIED')}
                         className="flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                       >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                       </button>
                    </div>
                 </div>
               </motion.div>
             ) : (
               <div className="p-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px]">
                  <ShieldAlert className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select a candidate to begin verification</p>
               </div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
