import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

interface ExtendedPrisma {
  integration: {
    upsert: (args: {
      where: { userId_type: { userId: string; type: string } };
      update: unknown;
      create: unknown;
    }) => Promise<{ id: string; status: string; updatedAt: Date }>;
    findFirst: (args: { where: { type: string; status: string } }) => Promise<unknown>;
  }
}

const db = (prisma as unknown) as ExtendedPrisma;
import { verifyToken } from "@/app/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload || (payload.role !== "admin" && payload.role !== "super_admin" && payload.role !== "employer")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { apiKey, config } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API Key is required" }, { status: 400 });
    }

    // Upsert the Lever integration for this user
    const integration = await db.integration.upsert({
      where: {
        userId_type: {
          userId: payload.userId,
          type: "LEVER"
        }
      },
      update: {
        apiKey: apiKey,
        config: config || {},
        status: "active",
        updatedAt: new Date()
      },
      create: {
        userId: payload.userId,
        type: "LEVER",
        apiKey: apiKey,
        config: config || {},
        status: "active"
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Lever connection established successfully",
      integration: {
        id: integration.id,
        status: integration.status,
        updatedAt: integration.updatedAt
      }
    });
  } catch (error) {
    console.error("Lever connection error:", error);
    return NextResponse.json({ error: "Failed to connect to Lever" }, { status: 500 });
  }
}
