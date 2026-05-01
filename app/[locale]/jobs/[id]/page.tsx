"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, MapPin, DollarSign, Users, Calendar } from "lucide-react";
import Button from "@/app/components/common/Button";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [hasApplied, setHasApplied] = useState(false);

  const job = {
    id: params.id,
    title: "Senior React Developer",
    company: "Tech Corp",
    location: "San Francisco, CA",
    salary: { min: 120000, max: 160000 },
    skills: ["React", "TypeScript", "Node.js", "AWS", "PostgreSQL"],
    postedDate: "2024-12-10",
    applicants: 24,
    description: `We are looking for an experienced Senior React Developer to join our growing engineering team. You will be responsible for building and maintaining our customer-facing web applications using modern technologies and best practices.

Key Responsibilities:
- Design and implement scalable React components and applications
- Collaborate with product and design teams to deliver high-quality user experiences
- Mentor junior developers and contribute to code quality standards
- Participate in code reviews and architectural discussions
- Optimize application performance and user experience

Requirements:
- 5+ years of professional software development experience
- 3+ years of experience with React and modern JavaScript/TypeScript
- Strong understanding of web performance optimization
- Experience with Node.js and backend integration
- Familiarity with AWS or similar cloud platforms
- Excellent communication and teamwork skills`,
    benefits: [
      "Competitive salary and equity",
      "Comprehensive health insurance",
      "Remote work flexibility",
      "401(k) matching",
      "Professional development budget",
      "Unlimited PTO",
    ],
  };

  const handleApply = () => {
    setHasApplied(true);
    setTimeout(() => {
      window.location.href = "/auth/signup?role=candidate";
    }, 1500);
  };

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
          <Link
            href="/jobs"
            className="text-slate-300 hover:text-white transition"
          >
            Back to Jobs
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/jobs"
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Job Header */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {job.title}
                </h1>
                <p className="text-xl text-slate-400">{job.company}</p>
              </div>
              <Button onClick={handleApply} disabled={hasApplied} size="lg">
                {hasApplied ? "Applied!" : "Apply Now"}
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4 pt-6 border-t border-slate-700">
              <div>
                <p className="text-slate-400 text-sm mb-1">Location</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Salary</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />$
                  {job.salary.min.toLocaleString()} - $
                  {job.salary.max.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Applicants</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {job.applicants}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Posted</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(job.postedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              About the Role
            </h2>
            <div className="text-slate-300 space-y-4 whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Required Skills */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Required Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Benefits</h2>
            <ul className="grid grid-cols-2 gap-4">
              {job.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-3 text-slate-300"
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              Ready to Apply?
            </h3>
            <p className="text-blue-100 mb-6">
              Create your video CV and apply in minutes
            </p>
            <Button
              onClick={handleApply}
              disabled={hasApplied}
              className="bg-white text-blue-600 hover:bg-slate-100"
            >
              {hasApplied ? "Application Submitted" : "Apply Now"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
