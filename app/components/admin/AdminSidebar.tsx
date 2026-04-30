"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  LayoutTemplate, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  LogOut,
  Sparkles,
  ShieldAlert
} from "lucide-react";

import { TokenPayload } from "@/app/lib/auth";

export default function AdminSidebar({ adminUser }: { adminUser?: TokenPayload | null }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Candidates", href: "/admin/users/candidates", icon: Users },
    { name: "Employers", href: "/admin/users/employers", icon: Building2 },
    { name: "Hero CMS", href: "/admin/cms", icon: LayoutTemplate },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Audit Logs", href: "/admin/compliance", icon: ShieldCheck },
    ...(adminUser?.role === "super_admin" ? [
      { name: "Management", href: "/admin/management", icon: ShieldAlert }
    ] : []),
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full py-8 text-white/70">
      {/* Brand Header */}
      <div className="px-8 mb-12">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#F7B980] rounded-xl flex items-center justify-center shadow-lg shadow-[#F7B980]/20 transition-transform group-hover:scale-105">
            <Sparkles className="w-6 h-6 text-slate-800" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tighter uppercase">VidioCV</h1>
            <p className="text-[10px] font-black tracking-widest text-[#F7B980] uppercase">Command Center</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                isActive 
                ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20" 
                : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-[#F7B980]" : "text-white/40 group-hover:text-[#F7B980]/60"}`} />
                <span className="text-sm font-bold tracking-wide">{item.name}</span>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#F7B980] shadow-[0_0_8px_rgba(247,185,128,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="px-4 mt-auto">
        <div className="p-4 rounded-[24px] bg-white/5 border border-white/10 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#F7B980]/20 flex items-center justify-center border border-[#F7B980]/30">
              <span className="text-sm font-black text-[#F7B980]">
                {adminUser?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div>
              <p className="text-xs font-black text-white line-clamp-1">{adminUser?.name || "System Admin"}</p>
              <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                {adminUser?.role === "super_admin" ? "Super Admin" : "Enterprise"}
              </p>
            </div>
          </div>
          <button 
            onClick={async () => {
               try {
                 await fetch("/api/auth/logout", { method: "POST" });
                 window.location.href = "/admin/login";
               } catch (error) {
                 console.error("Logout failed:", error);
                 // Fallback: try to clear cookie and redirect anyway
                 document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                 window.location.href = "/admin/login";
               }
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors group cursor-pointer"
          >
            <span className="text-[11px] font-black uppercase tracking-widest">Sign Out</span>
            <LogOut className="w-4 h-4 text-white/20 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
        <p className="text-[9px] text-center font-bold text-white/20 uppercase tracking-[0.2em]">
          VidioCV Enterprise v1.0
        </p>
      </div>
    </div>
  );
}
