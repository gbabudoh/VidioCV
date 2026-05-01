import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { verifyToken } from "@/app/lib/auth";

interface ExtendedPrisma {
  integration: {
    findMany: (args: { where: { userId: string } }) => Promise<Array<{ type: string; status: string; updatedAt: Date }>>;
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
    const decoded = verifyToken(token) as { userId: string };

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const integrations = await db.integration.findMany({
      where: { userId: decoded.userId }
    });

    return NextResponse.json({
      success: true,
      integrations: integrations.map((i) => ({
        type: i.type,
        status: i.status,
        updatedAt: i.updatedAt
      }))
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Integration Status Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
