import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/lib/auth";

// Manually define interface to bypass Prisma generation issues in the editor
interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
}

interface ExtendedPrisma {
  auditLog: {
    findMany: (args: { 
      where?: Record<string, unknown>; 
      orderBy?: Record<string, string>; 
      take?: number 
    }) => Promise<AuditLog[]>;
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

    const logs = await (prisma as unknown as ExtendedPrisma).auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100
    });

    // Fetch admin names for better display
    const adminIds = [...new Set(logs.map((l: AuditLog) => l.adminId))];
    const admins = await prisma.user.findMany({
      where: { id: { in: adminIds } },
      select: { id: true, name: true, email: true }
    });

    const formattedLogs = logs.map((log: AuditLog) => ({
      ...log,
      admin: admins.find(a => a.id === log.adminId) || { name: "Unknown Admin" }
    }));

    return NextResponse.json({ success: true, logs: formattedLogs });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
