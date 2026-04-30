/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await (prisma.user as any).findUnique({
      where: { email },
    });

    if (!user) {
      // For security reasons, don't reveal if the user exists
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await (prisma.user as any).update({
      where: { id: user.id },
      data: {
        resetToken,
        resetExpires,
      },
    });

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    // await sendEmail(user.email, "Reset Your Password", `Link: ${resetUrl}`);

    console.log(`Password reset link for ${email}: ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`);

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ message: "An error occurred. Please try again later." }, { status: 500 });
  }
}
