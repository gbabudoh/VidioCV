import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    // 1. Core Counts
    const candidatesCount = await prisma.user.count({ where: { role: 'candidate' } });
    const employersCount = await prisma.user.count({ where: { role: 'employer' } });
    const jobsCount = await prisma.job.count();
    
    // 2. Verified Candidates (Identity Trust)
    const verifiedCandidates = await prisma.user.count({ 
      where: { 
        role: 'candidate',
        identityStatus: 'VERIFIED'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    });

    // 3. Subscription Revenue (Mock for now until Stripe is fully synced, but could count active subscriptions)
    const activeSubscriptions = await prisma.user.count({
      where: {
        role: 'employer',
        trialStartedAt: {
          gt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // Within 14 day trial
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    });

    // 4. Growth Trends (Last 7 days vs Previous 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const recentRegistrations = await prisma.user.count({
      where: { createdAt: { gt: sevenDaysAgo } }
    });

    const previousRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gt: fourteenDaysAgo,
          lt: sevenDaysAgo
        }
      }
    });

    const registrationGrowth = previousRegistrations === 0 
      ? 100 
      : ((recentRegistrations - previousRegistrations) / previousRegistrations) * 100;

    return NextResponse.json({
      success: true,
      stats: {
        candidates: {
          total: candidatesCount,
          verified: verifiedCandidates,
          growth: Number(registrationGrowth.toFixed(1))
        },
        employers: {
          total: employersCount,
          active: activeSubscriptions
        },
        jobs: {
          total: jobsCount
        },
        telemetry: {
          matchRate: 88.5, // AI Match rate placeholder for now
          churn: 0.8
        }
      }
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
