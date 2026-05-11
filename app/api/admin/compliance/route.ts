import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: {
        role: 'candidate',
        identityStatus: 'PENDING'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      select: {
        id: true,
        email: true,
        identityStatus: true,
        identityDocumentKey: true,
        identityMatchScore: true,
        createdAt: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    });

    return NextResponse.json({
      success: true,
      users: pendingUsers
    });
  } catch (error) {
    console.error("Compliance API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
