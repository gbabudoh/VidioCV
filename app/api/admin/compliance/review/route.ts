import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId, status } = await request.json();

    if (!userId || !['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        identityStatus: status,
        identityVerifiedAt: status === 'VERIFIED' ? new Date() : null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    });

    return NextResponse.json({
      success: true,
      message: `User identity ${status.toLowerCase()} successfully.`,
      user: updatedUser
    });
  } catch (error) {
    console.error("Compliance Review Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
