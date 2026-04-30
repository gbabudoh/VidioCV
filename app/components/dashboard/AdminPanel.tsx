/* eslint-disable */
// @ts-nocheck
"use client";

import React from "react";
import { BarChart3, Users, Briefcase, TrendingUp } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalCandidates: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  successRate: number;
}

interface AdminPanelProps {
  stats?: AdminStats;
}

export default function AdminPanel() {
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7B980]"></div>
    </div>
  );

  const displayStats = stats || {
    totalUsers: 0,
    totalCandidates: 0,
    totalEmployers: 0,
    totalJobs: 0,
    totalApplications: 0,
    successRate: 0,
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 text-sm font-medium">Total Users</h3>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {displayStats.totalUsers}
          </p>
          <p className="text-sm text-slate-400 mt-2">+12% from last month</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 text-sm font-medium">Active Jobs</h3>
            <Briefcase className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {displayStats.totalJobs}
          </p>
          <p className="text-sm text-slate-400 mt-2">+8% from last month</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 text-sm font-medium">Success Rate</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {displayStats.successRate}%
          </p>
          <p className="text-sm text-slate-400 mt-2">Placement success rate</p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Platform Overview
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Candidates</span>
            <div className="flex items-center gap-4">
              <div className="w-48 bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${(displayStats.totalCandidates / displayStats.totalUsers) * 100}%`,
                  }}
                />
              </div>
              <span className="text-white font-medium w-16 text-right">
                {displayStats.totalCandidates}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Employers</span>
            <div className="flex items-center gap-4">
              <div className="w-48 bg-slate-700 rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full"
                  style={{
                    width: `${(displayStats.totalEmployers / displayStats.totalUsers) * 100}%`,
                  }}
                />
              </div>
              <span className="text-white font-medium w-16 text-right">
                {displayStats.totalEmployers}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Applications</span>
            <div className="flex items-center gap-4">
              <div className="w-48 bg-slate-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-full" />
              </div>
              <span className="text-white font-medium w-16 text-right">
                {displayStats.totalApplications}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
