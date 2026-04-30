import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/lib/auth";

interface ExtendedPrisma {
  auditLog: {
    create: (args: { 
      data: {
        adminId: string;
        action: string;
        entityType: string;
        entityId: string;
        details?: Record<string, unknown>;
      } 
    }) => Promise<unknown>;
  };
}

// 🛡️ Admin Security Middleware Helper
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const payload = token ? verifyToken(token) : null;
  return (payload?.role === "admin" || payload?.role === "super_admin") ? payload : null;
}

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    // Use a structured type assertion to bypass property visibility issues without using 'any'
    const candidates = await (prisma.user as unknown as { 
      findMany: (args: Record<string, unknown>) => Promise<unknown[]> 
    }).findMany({
      where: { role: "candidate" },
      include: {
        profile: true,
        cvProfile: {
          select: {
            id: true,
            videoUrl: true,
            isPublished: true,
            aiMatchScore: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, candidates });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { userId } = await request.json();

    // Log the action for compliance
    await (prisma as unknown as ExtendedPrisma).auditLog.create({
      data: {
        adminId: admin.userId,
        action: "TERMINATE_ACCOUNT",
        entityType: "USER",
        entityId: userId,
        details: { reason: "Admin termination" }
      }
    });

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true, message: "Account terminated successfully" });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to terminate account" }, { status: 500 });
  }
}
