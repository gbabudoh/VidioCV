import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/lib/auth";

interface ExtendedPrisma {
  siteConfig: {
    findUnique: (args: { where: { key: string } }) => Promise<{ value: unknown } | null>;
    upsert: (args: { 
      where: { key: string }; 
      update: { value: unknown }; 
      create: { key: string; value: unknown } 
    }) => Promise<{ value: unknown }>;
  };
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

    const heroConfig = await (prisma as unknown as ExtendedPrisma).siteConfig.findUnique({
      where: { key: "homepage_hero" }
    });

    return NextResponse.json({ success: true, config: heroConfig?.value });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { key, value } = await request.json();

    // Log the CMS change
    await (prisma as unknown as ExtendedPrisma).auditLog.create({
      data: {
        adminId: admin.userId,
        action: "UPDATE_CMS",
        entityType: "SITE_CONFIG",
        entityId: key,
        details: { old: "Check previous version", new: value }
      }
    });

    const updated = await (prisma as unknown as ExtendedPrisma).siteConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });

    return NextResponse.json({ success: true, config: updated.value });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update configuration" }, { status: 500 });
  }
}
