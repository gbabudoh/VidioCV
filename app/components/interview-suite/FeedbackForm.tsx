"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";

interface FeedbackFormProps {
  interviewId: string;
  candidateName: string;
  onSubmit?: (feedback: FeedbackData) => void;
}

interface FeedbackData {
  rating: number;
  technicalSkills: number;
  communicationSkills: number;
  cultureFit: number;
  comments: string;
  recommendation: "strong-yes" | "yes" | "maybe" | "no";
}

export default function FeedbackForm({
  interviewId,
  candidateName,
  onSubmit,
}: FeedbackFormProps) {
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    technicalSkills: 0,
    communicationSkills: 0,
    cultureFit: 0,
    comments: "",
    recommendation: "maybe",
  });

  const handleStarClick = (
    field: keyof Omit<FeedbackData, "comments" | "recommendation">,
    value: number,
  ) => {
    setFeedback((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(feedback);
    }
  };

  const StarRating = ({
    label,
    field,
    value,
  }: {
    label: string;
    field: keyof Omit<FeedbackData, "comments" | "recommendation">;
    value: number;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(field, star)}
            className="transition hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-slate-600"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-lg p-8"
    >
      <h2 className="text-2xl font-bold text-white mb-2">Interview Feedback</h2>
      <p className="text-slate-400 mb-6">Candidate: {candidateName}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <StarRating
          label="Overall Rating"
          field="rating"
          value={feedback.rating}
        />
        <StarRating
          label="Technical Skills"
          field="technicalSkills"
          value={feedback.technicalSkills}
        />
        <StarRating
          label="Communication Skills"
          field="communicationSkills"
          value={feedback.communicationSkills}
        />
        <StarRating
          label="Culture Fit"
          field="cultureFit"
          value={feedback.cultureFit}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Recommendation
          </label>
          <select
            value={feedback.recommendation}
            onChange={(e) =>
              setFeedback((prev) => ({
                ...prev,
                recommendation: e.target
                  .value as FeedbackData["recommendation"],
              }))
            }
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="strong-yes">Strong Yes</option>
            <option value="yes">Yes</option>
            <option value="maybe">Maybe</option>
            <option value="no">No</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            Comments
          </label>
          <textarea
            value={feedback.comments}
            onChange={(e) =>
              setFeedback((prev) => ({ ...prev, comments: e.target.value }))
            }
            placeholder="Add any additional comments about the candidate..."
            rows={4}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button type="submit" className="w-full">
          Submit Feedback
        </Button>
      </form>
    </motion.div>
  );
}
