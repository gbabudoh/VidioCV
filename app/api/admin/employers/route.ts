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

    const employers = await prisma.user.findMany({
      where: { role: "employer" },
      include: {
        profile: true,
        jobs: {
          select: { id: true }
        },
        subscriptions: {
          where: { status: "active" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, employers });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { userId } = await request.json();

    await (prisma as unknown as ExtendedPrisma).auditLog.create({
      data: {
        adminId: admin.userId,
        action: "TERMINATE_EMPLOYER",
        entityType: "USER",
        entityId: userId,
        details: { reason: "Admin termination" }
      }
    });

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true, message: "Employer account terminated" });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to terminate employer" }, { status: 500 });
  }
}
