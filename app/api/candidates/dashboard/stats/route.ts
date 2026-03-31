import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    // Fetch CV Profile for viewsCount
    const cvProfile = await prisma.cvProfile.findFirst({
      where: { userId }
    });

    // Fetch Active Applications (ContactRequests)
    const applicationsCount = await prisma.contactRequest.count({
      where: {
        cvProfile: {
          userId
        }
      }
    });

    // Fetch Interviews
    const interviewsCount = await prisma.interview.count({
      where: {
        candidateId: userId
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        profileViews: cvProfile?.viewsCount || 0,
        activeApplications: applicationsCount,
        interviewInvites: interviewsCount
      }
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
