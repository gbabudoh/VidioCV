import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { name, country, companyType } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name: name || undefined,
        country: country || undefined,
        // @ts-expect-error - companyType is in schema and generated client but not yet recognized by IDE
        companyType: companyType || undefined,
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        country: updatedUser.country,
        // @ts-expect-error - companyType is in schema and generated client but not yet recognized by IDE
        companyType: updatedUser.companyType
      } 
    });
  } catch (error) {
    console.error("Error updating employer profile:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
