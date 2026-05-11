import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetCandidateId = searchParams.get("candidateId");

  try {
    // If an employer is requesting another candidate's results
    if (targetCandidateId && targetCandidateId !== userId) {
      const requester = await prisma.user.findUnique({ where: { id: userId } });
      if (requester?.role !== "EMPLOYER") {
        return NextResponse.json({ error: "Forbidden: Only employers can view other assessments" }, { status: 403 });
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const assessments = await (prisma as any).assessment.findMany({
        where: { candidateId: targetCandidateId },
        orderBy: { createdAt: "desc" }
      });
      return NextResponse.json(assessments);
    }

    // Default: return current user's assessments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assessments = await (prisma as any).assessment.findMany({
      where: { candidateId: userId },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type } = await request.json();

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assessment = await (prisma as any).assessment.create({
      data: {
        candidateId: userId,
        type: type || "LOGIC",
        status: "pending"
      }
    });
    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
