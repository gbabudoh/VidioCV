"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Button from "@/app/components/common/Button";
import Input from "@/app/components/common/Input";

export default function PostJobPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    department: "",
    skills: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = "Job title is required";
    if (!formData.description)
      newErrors.description = "Job description is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.salaryMin) newErrors.salaryMin = "Minimum salary is required";
    if (!formData.salaryMax) newErrors.salaryMax = "Maximum salary is required";
    if (!formData.department) newErrors.department = "Department is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/job/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          salary: {
            min: parseInt(formData.salaryMin),
            max: parseInt(formData.salaryMax),
          },
          department: formData.department,
          skills: formData.skills.split(",").map((s) => s.trim()),
        }),
      });

      if (response.ok) {
        window.location.href = "/dashboard/employer";
      } else {
        setErrors({ submit: "Failed to post job" });
      }
    } catch (error) {
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/dashboard/employer"
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 border border-slate-700 rounded-lg p-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Post a New Job</h1>
          <p className="text-slate-400 mb-8">
            Create a job posting to attract top talent
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Job Title"
                name="title"
                placeholder="e.g., Senior React Developer"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
              />

              <Input
                label="Department"
                name="department"
                placeholder="e.g., Engineering"
                value={formData.department}
                onChange={handleChange}
                error={errors.department}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Location"
                name="location"
                placeholder="e.g., San Francisco, CA"
                value={formData.location}
                onChange={handleChange}
                error={errors.location}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Salary ($)"
                  name="salaryMin"
                  type="number"
                  placeholder="100000"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  error={errors.salaryMin}
                />
                <Input
                  label="Max Salary ($)"
                  name="salaryMax"
                  type="number"
                  placeholder="150000"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  error={errors.salaryMax}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Job Description
              </label>
              <textarea
                name="description"
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.description}
                </p>
              )}
            </div>

            <Input
              label="Required Skills (comma-separated)"
              name="skills"
              placeholder="React, TypeScript, Node.js"
              value={formData.skills}
              onChange={handleChange}
            />

            {errors.submit && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {errors.submit}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Posting..." : "Post Job"}
              </Button>
              <Link
                href="/dashboard/employer"
                className="flex-1 px-6 py-3 border border-slate-500 text-white font-semibold rounded-lg hover:border-slate-300 hover:bg-slate-800/50 transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
