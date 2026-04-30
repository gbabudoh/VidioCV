import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/lib/auth";

export async function GET() {
  try {
    // 🛡️ Admin Verification
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 📊 Aggregate Platform Stats
    const [
      candidateCount,
      employerCount,
      activeJobs,
      totalInquiries,
      totalTransactions
    ] = await Promise.all([
      prisma.user.count({ where: { role: "candidate" } }),
      prisma.user.count({ where: { role: "employer" } }),
      prisma.job.count(),
      prisma.contactRequest.count(),
      prisma.transaction.count({ where: { status: "succeeded" } })
    ]);

    // Calculate revenue (Mocked Decimal aggregation as prisma query)
    const transactions = await prisma.transaction.findMany({
      where: { status: "succeeded" },
      select: { amount: true }
    });
    const totalRevenue = transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          candidates: candidateCount,
          employers: employerCount,
          total: candidateCount + employerCount
        },
        jobs: {
          active: activeJobs
        },
        engagement: {
          inquiries: totalInquiries
        },
        revenue: {
          total: totalRevenue,
          transactions: totalTransactions
        },
        recentActivity: [
           // Mocked recent activity for UI
           { id: 1, type: "registration", user: "John Doe", role: "candidate", time: "2m ago" },
           { id: 2, type: "job_post", user: "Tech Corp", role: "employer", time: "15m ago" },
           { id: 3, type: "inquiry", user: "Sarah Smith", role: "candidate", time: "1h ago" },
           { id: 4, type: "payment", user: "Acme Inc", role: "employer", amount: "$199", time: "2h ago" },
        ]
      }
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
