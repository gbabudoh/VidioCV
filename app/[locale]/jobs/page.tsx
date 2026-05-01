"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, MapPin, DollarSign, Briefcase } from "lucide-react";
import Button from "@/app/components/common/Button";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
  };
  skills: string[];
  postedDate: string;
  applicants: number;
}

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const mockJobs: Job[] = [
    {
      id: "1",
      title: "Senior React Developer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      salary: { min: 120000, max: 160000 },
      skills: ["React", "TypeScript", "Node.js"],
      postedDate: "2024-12-10",
      applicants: 24,
    },
    {
      id: "2",
      title: "Full Stack Engineer",
      company: "StartUp Inc",
      location: "Remote",
      salary: { min: 100000, max: 140000 },
      skills: ["Python", "Django", "PostgreSQL"],
      postedDate: "2024-12-08",
      applicants: 18,
    },
    {
      id: "3",
      title: "DevOps Engineer",
      company: "Cloud Systems",
      location: "New York, NY",
      salary: { min: 130000, max: 170000 },
      skills: ["Kubernetes", "AWS", "Docker"],
      postedDate: "2024-12-05",
      applicants: 12,
    },
    {
      id: "4",
      title: "Product Manager",
      company: "Tech Corp",
      location: "San Francisco, CA",
      salary: { min: 140000, max: 180000 },
      skills: ["Product Strategy", "Analytics", "Leadership"],
      postedDate: "2024-12-03",
      applicants: 31,
    },
  ];

  const allSkills = Array.from(new Set(mockJobs.flatMap((job) => job.skills)));

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.some((skill) => job.skills.includes(skill));
    return matchesSearch && matchesSkills;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
          >
            VidioCV
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-slate-300 hover:text-white transition"
            >
              Login
            </Link>
            <Link
              href="/auth/signup?role=candidate"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-8">
            Find Your Next Opportunity
          </h1>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by job title or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-300">
                Filter by Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() =>
                      setSelectedSkills((prev) =>
                        prev.includes(skill)
                          ? prev.filter((s) => s !== skill)
                          : [...prev, skill],
                      )
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedSkills.includes(skill)
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Jobs List */}
        <div className="space-y-4">
          <p className="text-slate-400 mb-6">
            Showing {filteredJobs.length} job
            {filteredJobs.length !== 1 ? "s" : ""}
          </p>

          {filteredJobs.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">
                No jobs found matching your criteria
              </p>
            </div>
          ) : (
            filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {job.title}
                    </h3>
                    <p className="text-slate-400">{job.company}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-sm text-blue-300">
                    {job.applicants} applicants
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />$
                    {job.salary.min.toLocaleString()} - $
                    {job.salary.max.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </p>
                  <Link href={`/jobs/${job.id}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
