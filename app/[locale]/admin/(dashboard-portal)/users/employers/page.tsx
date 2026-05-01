"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Building2, 
  Briefcase, 
  CreditCard,
  Mail,
  Calendar,
  AlertTriangle,
  ArrowUpRight
} from "lucide-react";
import Modal from "@/app/components/common/Modal";

interface Employer {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  jobs: { id: string }[];
  subscriptions: { id: string; status: string }[];
}

export default function EmployerManagement() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchEmployers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/employers");
      const data = await res.json();
      if (data.success) setEmployers(data.employers);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  const handleTerminate = async () => {
    if (!selectedEmployer) return;
    try {
      const res = await fetch("/api/admin/employers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedEmployer.id })
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        fetchEmployers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = employers.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Employer Partners</h1>
          <p className="text-slate-500 font-medium mt-1">Oversee hiring organizations and corporate subscriptions.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by company or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F7B980]/20 font-medium"
          />
        </div>
      </div>

      {/* Employers Table */}
      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Organization</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Plan Status</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Active Jobs</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Member Since</th>
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
              filtered.map((employer) => (
                <tr key={employer.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-[#F7B980]/10 flex items-center justify-center text-[#F7B980] border border-[#F7B980]/20">
                         <Building2 className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-800">{employer.name}</p>
                         <div className="flex items-center gap-2 text-[11px] text-slate-500">
                           <Mail className="w-3 h-3" />
                           {employer.email}
                         </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {employer.subscriptions.length > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-widest">
                        <CreditCard className="w-3 h-3" /> Enterprise
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-black uppercase tracking-widest">
                        Free Tier
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                      {employer.jobs.length} Listings
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(employer.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
                         <ArrowUpRight className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => {
                          setSelectedEmployer(employer);
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
                    <Building2 className="w-12 h-12 text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold">No employers found matching your search.</p>
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
        title="Confirm Employer Termination"
        type="error"
        primaryAction={{
          label: "Terminate Corporate Access",
          onClick: handleTerminate
        }}
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-slate-600 font-medium">
            Terminate corporate access for <span className="font-black text-slate-800">{selectedEmployer?.name}</span>?
          </p>
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-left">
            <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest mb-1">Impact Analysis</p>
            <p className="text-xs text-red-600/80 leading-relaxed">
              Terminating this account will immediately remove all live job listings, cancel active enterprise subscriptions, and revoke dashboard access for all team members.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
