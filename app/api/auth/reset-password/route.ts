/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: "Token and password are required" }, { status: 400 });
    }

    const user = await (prisma.user as any).findUnique({
      where: { resetToken: token },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired reset token" }, { status: 400 });
    }

    // Check expiry
    if (new Date() > new Date(user.resetExpires)) {
      return NextResponse.json({ message: "Reset token has expired" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    await (prisma.user as any).update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
      },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ message: "An error occurred. Please try again later." }, { status: 500 });
  }
}
