import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verify(token, JWT_SECRET) as { userId: string; email: string; role: string };

    if (decoded.role !== "employer") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // GDPR: Bulk deletion of job postings and applicants for this employer
    // This assumes cascading deletes are set up for applications when a job is deleted
    await prisma.job.deleteMany({
      where: { employerId: decoded.userId }
    });

    return NextResponse.json({ 
      success: true, 
      message: "All job-related data has been purged." 
    });
  } catch (error) {
    console.error("Wipe Data Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to purge workspace data." 
    }, { status: 500 });
  }
}
