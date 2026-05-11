import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// --- Behavioral Analysis Logic ---
interface TelemetryData {
  challengeId: string;
  startTime: number;
  endTime: number;
  interactions: number;
  retries: number;
}

function analyzeBehavior(telemetry: TelemetryData[]) {
  let totalTime = 0;
  let totalInteractions = 0;
  let totalRetries = 0;
  
  telemetry.forEach(t => {
    totalTime += (t.endTime - t.startTime) / 1000;
    totalInteractions += t.interactions;
    totalRetries += t.retries;
  });
  
  const avgTime = totalTime / (telemetry.length || 1);
  const avgInteractions = totalInteractions / (telemetry.length || 1);
  
  let archetype = "Balanced Problem Solver";
  let insight = "Candidate shows a standard balance between speed and precision.";
  
  if (avgTime < 15 && avgInteractions < 8) {
    archetype = "High-Velocity Fixer";
    insight = "Candidate identifies core patterns rapidly and executes with minimal friction. Ideal for high-pressure, fast-paced environments.";
  } else if (avgInteractions > 15) {
    archetype = "Meticulous Architect";
    insight = "Candidate explores multiple logical paths and verifies integrity before proceeding. Shows strong depth of technical awareness.";
  } else if (totalRetries > 2) {
    archetype = "Iterative Optimizer";
    insight = "Candidate isn't afraid to refactor and optimize their approach mid-process. Demonstrates a growth mindset in technical logic.";
  }
  
  return { archetype, insight };
}

async function getUserIdFromRequest(request: Request) {
  const cookie = request.headers.get("cookie");
  const token = cookie?.split("; ").find(row => row.startsWith("auth_token="))?.split("=")[1];
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { results, telemetry } = await request.json();
  const { id } = params;

  try {
    // 1. Calculate Score
    let correctCount = 0;
    Object.values(results as Record<string, { correct: boolean }>).forEach((res) => {
      if (res.correct) correctCount++;
    });
    const score = Math.round((correctCount / Object.keys(results).length) * 100);

    // 2. Analyze Behavior via Neural Insights logic
    const { archetype, insight } = analyzeBehavior(telemetry);

    // 3. Update Assessment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedAssessment = await (prisma as any).assessment.update({
      where: { id, candidateId: userId },
      data: {
        status: "completed",
        score,
        maxScore: 100,
        results,
        telemetry,
        archetype,
        aiInsights: insight,
        completedAt: new Date()
      }
    });

    return NextResponse.json(updatedAssessment);
  } catch (error) {
    console.error("Error submitting assessment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
