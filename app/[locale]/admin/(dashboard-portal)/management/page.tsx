"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  UserPlus, 
  Trash2, 
  Mail, 
  User, 
  Lock,
  RefreshCcw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Modal from "@/app/components/common/Modal";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/management");
      const data = await res.json();
      if (data.success) setAdmins(data.admins);
    } catch {
      console.error("Failed to fetch admins");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Admin account created successfully");
        setIsModalOpen(false);
        setNewAdmin({ name: "", email: "", password: "" });
        fetchAdmins();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to create admin");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this admin account?")) return;
    try {
      const res = await fetch("/api/admin/management", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: id })
      });
      if (res.ok) {
        setSuccess("Admin account removed");
        fetchAdmins();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      console.error("Failed to delete admin");
    }
  };

  if (isLoading) return <div className="p-8 animate-pulse bg-white rounded-[32px] h-96 border border-slate-100" />;

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            Admin Hierarchy
          </h1>
          <p className="text-slate-500 font-medium mt-1">Super Admin Console: Manage secondary administrative accounts and privileges.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[#57595B] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-slate-200"
        >
          <UserPlus className="w-4 h-4" />
          Provision New Admin
        </button>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold text-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admins Table */}
      <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Created On</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-sm">
                      {admin.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-700">{admin.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6 font-medium text-slate-500">{admin.email}</td>
                <td className="px-8 py-6 font-medium text-slate-400 text-sm">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => handleDelete(admin.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                    title="Terminate Access"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <User className="w-12 h-12 text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold">No secondary admins provisioned.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Provisioning Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
             <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
               <UserPlus className="w-6 h-6" />
             </div>
             <div>
               <h3 className="text-xl font-black text-slate-800 tracking-tight">Provision Secondary Admin</h3>
               <p className="text-slate-400 text-sm font-medium">Create a new account with standard administrative privileges.</p>
             </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="text"
                  placeholder="e.g. John Staff"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="email"
                  placeholder="admin@vidiocv.com"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Initial Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="password"
                  placeholder="••••••••"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={isSubmitting}
                className="flex-[2] px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {isSubmitting ? "Provisioning..." : "Provision Admin"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
