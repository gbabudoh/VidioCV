import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    // Fetch all users with 'employer' role
    const employers = await prisma.user.findMany({
      where: { role: "employer" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({ success: true, employers });
  } catch (error) {
    console.error("Error fetching employers:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
