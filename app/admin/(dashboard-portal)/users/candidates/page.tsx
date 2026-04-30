"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Video, 
  ExternalLink,
  Mail,
  Calendar,
  AlertTriangle,
  Users
} from "lucide-react";
import Modal from "@/app/components/common/Modal";

interface Candidate {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  profile?: { fullName: string; location?: string };
  cvProfile?: { isPublished: boolean; aiMatchScore: number };
}

export default function CandidateManagement() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/candidates");
      const data = await res.json();
      if (data.success) setCandidates(data.candidates);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleTerminate = async () => {
    if (!selectedCandidate) return;
    try {
      const res = await fetch("/api/admin/candidates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedCandidate.id })
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        fetchCandidates();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Candidate Directory</h1>
          <p className="text-slate-500 font-medium mt-1">Manage professional identities and verified portfolios.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F7B980]/20 font-medium"
          />
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Match Score</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-8 h-16 bg-slate-50/10" />
                </tr>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                         {candidate.name.charAt(0)}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-800">{candidate.name}</p>
                         <div className="flex items-center gap-2 text-[11px] text-slate-500">
                           <Mail className="w-3 h-3" />
                           {candidate.email}
                         </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {candidate.cvProfile?.isPublished ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                        <Video className="w-3 h-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-black uppercase tracking-widest">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#F7B980]" 
                          style={{ width: `${candidate.cvProfile?.aiMatchScore || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{candidate.cvProfile?.aiMatchScore || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
                         <ExternalLink className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 rounded-xl hover:bg-red-50 text-red-400 transition-all cursor-pointer"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <Users className="w-12 h-12 text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold">No candidates found matching your search.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Account Termination Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Termination"
        type="error"
        primaryAction={{
          label: "Terminate Account",
          onClick: handleTerminate
        }}
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-slate-600 font-medium">
            Are you sure you want to terminate the account for <span className="font-black text-slate-800">{selectedCandidate?.name}</span>?
          </p>
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-left">
            <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest mb-1">Warning</p>
            <p className="text-xs text-red-600/80 leading-relaxed">
              This action is permanent. All professional narratives, video portfolios, and matching history will be immediately and irrevocably deleted from the VidioCV network.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
