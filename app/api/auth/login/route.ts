import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/app/lib/auth";
import { z } from "zod";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["candidate", "employer"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (role && user.role !== role) {
      return NextResponse.json(
        { success: false, message: `This account is not registered as ${role === "employer" ? "an employer" : "a candidate"}. Please use the correct login.` },
        { status: 403 }
      );
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as "candidate" | "employer" | "admin",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token,
        user: { 
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role 
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
