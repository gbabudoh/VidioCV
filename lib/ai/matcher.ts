import { semanticEngine } from "./semantic";
import { neuralAggregator } from "./neural";

/**
 * AI Matching Engine for VidioCV
 * 
 * Provides ML-driven scoring using TensorFlow.js for semantic similarity
 * and Brain.js for neural aggregation.
 */

export interface MatchCandidate {
  id: string;
  title?: string;
  skills: string[];
  summary?: string;
  yearsOfExperience?: number;
  remotePreference?: string;
  location?: string;
  isVerified?: boolean;
}

export interface MatchJob {
  id: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  salaryMin?: number;
  salaryMax?: number;
}

export interface MatchResult {
  score: number; // 0-100
  breakdown: {
    skills: number;
    title: number;
    metadata: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
}

export class MatchEngine {
  /**
   * Calculates the match score between a candidate and a job using ML.
   */
  static async calculateMatch(candidate: MatchCandidate, job: MatchJob): Promise<MatchResult> {
    const skillScore = this.scoreSkills(candidate.skills, job.skills);
    
    // 🧠 ML: Use TensorFlow.js for Semantic Title Similarity
    const semanticTitleScore = await semanticEngine.calculateSimilarity(
      candidate.title || "", 
      job.title
    ) * 100;
    
    // Process Metadata Scores
    const locationScore = this.scoreLocation(candidate.location, job.location) ? 100 : 0;
    const remoteScore = this.scoreRemote(candidate.remotePreference, job.location) ? 100 : 0;
    const experienceScore = this.scoreExperience(candidate.yearsOfExperience || 0, job.title) ? 100 : 50;

    // 🧠 ML: Use Brain.js Neural Network for Final Aggregation
    let finalScore = await neuralAggregator.predict({
      skillScore: skillScore.score,
      titleScore: semanticTitleScore,
      locationScore: locationScore,
      remoteScore: remoteScore,
      experienceScore: experienceScore
    });

    // 🚀 Intelligence Bonus: Add a fixed boost for AI-Verified candidates
    if (candidate.isVerified) {
      finalScore = Math.min(finalScore + 10, 100);
    }

    return {
      score: finalScore,
      breakdown: {
        skills: skillScore.score,
        title: Math.round(semanticTitleScore),
        metadata: Math.round((locationScore * 0.4) + (remoteScore * 0.4) + (experienceScore * 0.2)),
      },
      matchedSkills: skillScore.matched,
      missingSkills: skillScore.missing,
    };
  }

  /**
   * Scores based on skill overlap.
   */
  private static scoreSkills(cSkills: string[], jSkills: string[]) {
    if (!jSkills || jSkills.length === 0) return { score: 100, matched: [], missing: [] };
    
    const candidateSkillsLower = cSkills.map(s => s.toLowerCase());
    const matched = jSkills.filter(s => candidateSkillsLower.includes(s.toLowerCase()));
    const missing = jSkills.filter(s => !candidateSkillsLower.includes(s.toLowerCase()));

    const score = (matched.length / jSkills.length) * 100;
    return { score: Math.round(score), matched, missing };
  }

  private static scoreLocation(cLoc?: string, jLoc?: string): boolean {
    if (!cLoc || !jLoc) return false;
    return jLoc.toLowerCase().includes(cLoc.toLowerCase());
  }

  private static scoreRemote(cPref?: string, jLoc?: string): boolean {
    if (cPref === "remote" && jLoc?.toLowerCase().includes("remote")) return true;
    return false;
  }

  private static scoreExperience(years: number, jTitle: string): boolean {
    if (years >= 5 && jTitle.toLowerCase().includes("senior")) return true;
    if (years >= 8 && jTitle.toLowerCase().includes("lead")) return true;
    if (years >= 10 && jTitle.toLowerCase().includes("principal")) return true;
    return years >= 2;
  }
}
