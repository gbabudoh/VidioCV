import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { verifyToken } from "@/app/lib/auth";

interface ExtendedPrisma {
  integration: {
    findMany: (args: { 
      include: { 
        user: { 
          select: { 
            name: boolean; 
            email: boolean; 
            companyType: boolean 
          } 
        } 
      } 
    }) => Promise<Array<{ 
      id: string; 
      type: string; 
      status: string; 
      updatedAt: Date;
      user: { name: string | null; email: string; companyType: string | null }
    }>>;
  };
}

const db = (prisma as unknown) as ExtendedPrisma;

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as { userId: string; role: string };

    if (!decoded || (decoded.role !== "admin" && decoded.role !== "super_admin")) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const allIntegrations = await db.integration.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            companyType: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      integrations: allIntegrations.map(i => ({
        id: i.id,
        type: i.type,
        status: i.status,
        updatedAt: i.updatedAt,
        employer: {
          name: i.user.name || "Unknown Entity",
          email: i.user.email,
          type: i.user.companyType || "Enterprise"
        }
      }))
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Admin Global Integration Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
