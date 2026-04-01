import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { EmailNotifications } from "@/lib/listmonk";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Verification token is missing" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      // @ts-expect-error - Prisma client needs regeneration
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid verification token" },
        { status: 400 }
      );
    }

    // @ts-expect-error - Prisma client needs regeneration
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return NextResponse.json(
        { success: false, message: "Verification token has expired" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null,
      } as unknown as { emailVerified: boolean; verificationToken: string | null; verificationExpires: Date | null },
    });

    // Send welcome email now that they are verified
    if (user.role === 'candidate') {
      await EmailNotifications.welcomeCandidate(user.email, user.name);
    } else if (user.role === 'employer') {
      await EmailNotifications.welcomeEmployer(user.email, user.name);
    }

    // Redirect to login with success message
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("verified", "true");
    
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
