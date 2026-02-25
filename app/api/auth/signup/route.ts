import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/app/lib/auth";
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

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        country,
        role,
        profile: {
          create: {
            fullName: name,
            email,
          }
        }
      },
    });

    // TODO: Remove (prisma as any) after running 'npx prisma generate' locally
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).userProfile.update({
      where: { userId: user.id },
      data: { ntfyTopic: `videocv-user-${user.id}` }
    });

    // Send system notification
    await Notifications.system.newUserRegistered(name, role as 'candidate' | 'employer');

    // Subscribe and send welcome email (Listmonk)
    if (role === 'candidate') {
      await EmailNotifications.welcomeCandidate(email, name);
    } else if (role === 'employer') {
      await EmailNotifications.welcomeEmployer(email, name);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as "candidate" | "employer" | "admin",
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        token,
        user: { 
          id: user.id,
          email: user.email, 
          name: user.name, 
          country: user.country, 
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
