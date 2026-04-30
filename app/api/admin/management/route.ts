import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/lib/auth";
import bcrypt from "bcryptjs";

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

async function verifySuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const payload = token ? verifyToken(token) : null;
  return payload?.role === "super_admin" ? payload : null;
}

export async function GET() {
  try {
    const superAdmin = await verifySuperAdmin();
    if (!superAdmin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true
      }
    });

    return NextResponse.json({ success: true, admins });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const superAdmin = await verifySuperAdmin();
    if (!superAdmin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "admin",
        emailVerified: true
      }
    });

    // Log the creation
    await (prisma as unknown as ExtendedPrisma).auditLog.create({
      data: {
        adminId: superAdmin.userId,
        action: "CREATE_ADMIN",
        entityType: "USER",
        entityId: newAdmin.id,
        details: { email, name }
      }
    });

    return NextResponse.json({ success: true, admin: { id: newAdmin.id, email, name } });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ success: false, message: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const superAdmin = await verifySuperAdmin();
    if (!superAdmin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { adminId } = await request.json();

    // Log the deletion
    await (prisma as unknown as ExtendedPrisma).auditLog.create({
      data: {
        adminId: superAdmin.userId,
        action: "DELETE_ADMIN",
        entityType: "USER",
        entityId: adminId,
        details: { targetId: adminId }
      }
    });

    await prisma.user.delete({ where: { id: adminId } });

    return NextResponse.json({ success: true, message: "Admin account removed" });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
