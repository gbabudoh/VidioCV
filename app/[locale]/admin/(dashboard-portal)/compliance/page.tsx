"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  Search, 
  Clock, 
  User, 
  Activity,
  ChevronRight,
  Database
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  details: Record<string, unknown> | null;
  admin: { name: string; email?: string };
}

export default function CompliancePortal() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/audit");
      const data = await res.json();
      if (data.success) setLogs(data.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF() as jsPDF & { autoTable: (options: unknown) => void };
    doc.text("VidioCV Platform Audit Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    
    const tableData = logs.map(l => [
      new Date(l.createdAt).toLocaleString(),
      l.admin.name,
      l.action,
      l.entityType,
      l.entityId || "N/A"
    ]);

    doc.autoTable({
      startY: 30,
      head: [["Timestamp", "Admin", "Action", "Entity", "ID"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [87, 89, 91] }
    });

    doc.save(`vidiocv-audit-${Date.now()}.pdf`);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(logs.map(l => ({
      Timestamp: new Date(l.createdAt).toLocaleString(),
      Admin: l.admin.name,
      Action: l.action,
      EntityType: l.entityType,
      EntityID: l.entityId,
      Details: JSON.stringify(l.details)
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");
    XLSX.writeFile(wb, `vidiocv-audit-${Date.now()}.xlsx`);
  };

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.admin.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Compliance & Audit</h1>
          <p className="text-slate-500 font-medium mt-1">Verifiable record of all administrative operations.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={exportExcel}
             className="px-5 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
           >
             <Database className="w-4 h-4" />
             Export Excel
           </button>
           <button 
             onClick={exportPDF}
             className="px-5 py-3 bg-[#57595B] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-slate-200"
           >
             <FileText className="w-4 h-4" />
             Export PDF
           </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Operations", value: logs.length, icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Security Events", value: logs.filter(l => l.action.includes("TERMINATE")).length, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Last 24 Hours", value: logs.filter(l => new Date(l.createdAt) > new Date(Date.now() - 86400000)).length, icon: Clock, color: "text-[#F7B980]", bg: "bg-[#F7B980]/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6">
             <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      {/* Search & Logs */}
      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Filter logs by action or admin..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F7B980]/10 font-medium"
             />
           </div>
           <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">
             <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
             Immutability Active
           </div>
        </div>

        <div className="divide-y divide-slate-50">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50/10 animate-pulse" />)
          ) : filtered.length > 0 ? (
            filtered.map((log) => (
              <div key={log.id} className="p-6 hover:bg-slate-50/30 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="text-center min-w-[60px]">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                       {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                     </p>
                     <p className="text-[10px] font-bold text-slate-300">
                       {new Date(log.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}
                     </p>
                  </div>
                  <div className="w-px h-10 bg-slate-100" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                       <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                         log.action.includes("TERMINATE") ? "bg-red-50 text-red-500 border border-red-100" :
                         log.action.includes("UPDATE") ? "bg-blue-50 text-blue-500 border border-blue-100" :
                         "bg-slate-100 text-slate-500"
                       }`}>
                         {log.action.replace("_", " ")}
                       </span>
                       <span className="text-xs font-bold text-slate-400">on {log.entityType}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                       <div className="flex items-center gap-1.5 font-bold text-slate-700">
                         <User className="w-3.5 h-3.5 text-[#F7B980]" />
                         {log.admin.name}
                       </div>
                       <ChevronRight className="w-3 h-3 text-slate-300" />
                       <span className="text-xs font-medium text-slate-400 font-mono tracking-tight truncate max-w-[200px]">
                         ID: {log.entityId || "N/A"}
                       </span>
                    </div>
                  </div>
                </div>
                
                <button className="p-3 rounded-xl hover:bg-white hover:shadow-sm text-slate-300 hover:text-slate-500 transition-all opacity-0 group-hover:opacity-100">
                   <Download className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-400 font-bold">
              No audit logs found matching your criteria.
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400">Displaying last 100 system events</p>
           <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#F7B980] transition-colors">
             Load Historical Archive
           </button>
        </div>
      </div>
    </div>
  );
}
