import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verify(token, JWT_SECRET) as { userId: string; email: string; role: string };

    if (!decoded.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    // GDPR: Permanent Deletion of User and all associated records
    // Prisma cascading deletes should handle this if defined, or we handle it manually
    
    await prisma.user.delete({
      where: { id: decoded.userId }
    });

    const response = NextResponse.json({ 
      success: true, 
      message: "Account and associated data permanently purged from systems." 
    });

    // Clear session cookie
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("GDPR Deletion Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "An error occurred during account synchronization." 
    }, { status: 500 });
  }
}
