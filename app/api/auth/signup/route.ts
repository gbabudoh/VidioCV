import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { Notifications } from "@/lib/ntfy";
import { EmailNotifications } from "@/lib/listmonk";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  country: z.string().min(2),
  role: z.enum(["candidate", "employer"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, country, role } = signupSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Bypass verification ONLY for specific demo accounts
    const isDemoUser = email === "employer@demo.com" || email === "candidate@demo.com";

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        country,
        role,
        // @ts-expect-error - Prisma client needs regeneration
        emailVerified: isDemoUser,
        verificationToken,
        verificationExpires,
        profile: {
          create: {
            fullName: name,
            email,
          }
        }
      },
    });

    await prisma.userProfile.update({
      where: { userId: user.id },
      data: { ntfyTopic: `videocv-user-${user.id}` }
    });

    // Send system notification
    await Notifications.system.newUserRegistered(name, role as 'candidate' | 'employer');

    // Send verification email
    await EmailNotifications.sendVerificationEmail(email, name, verificationToken);

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! Please check your email to verify your account.",
        user: { 
          id: user.id,
          email: user.email, 
          name: user.name, 
          role: user.role 
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
