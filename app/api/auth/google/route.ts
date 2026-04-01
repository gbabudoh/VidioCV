import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import slugify from "slugify";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const { idToken, role = "candidate" } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { success: false, message: "ID Token is required" },
        { status: 400 }
      );
    }

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json(
        { success: false, message: "Invalid Google token" },
        { status: 401 }
      );
    }

    const { email, sub: googleId, name, picture } = payload;

    // 1. Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleId as any }, // eslint-disable-line @typescript-eslint/no-explicit-any
          { email: email as any } // eslint-disable-line @typescript-eslint/no-explicit-any
        ]
      } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    });

    if (user) {
      // Update Google ID if not present
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(user as any).googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: { googleId, emailVerified: true } as any,
        });
      }

      // Check role mismatch (optional policy)
      if (role && user.role !== role) {
        return NextResponse.json(
          { success: false, message: `This account is already registered as ${user.role}. Please use the correct login page.` },
          { status: 403 }
        );
      }
    } else {
      // 2. Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          googleId,
          role: role as string,
          emailVerified: true,
          // Create empty profile
          profile: {
            create: {
              fullName: name || email.split("@")[0],
              email: email,
              avatarUrl: picture,
            }
          },
          // If candidate, create CV Profile
          ...(role === "candidate" ? {
            cvProfile: {
              create: {
                slug: `${slugify(name || email.split("@")[0], { lower: true })}-${Math.random().toString(36).substring(2, 7)}`,
                title: "Professional Profile",
              }
            }
          } : {})
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      });
    }

    // Generate our JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as "candidate" | "employer" | "admin",
    });

    const response = NextResponse.json(
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

    // Set persistent session cookie (7 days)
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google Auth error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
