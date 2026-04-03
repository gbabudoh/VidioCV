import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { cvProfileId, requesterName, requesterEmail, requesterCompany, message } = body;

    if (!cvProfileId || !requesterName || !requesterEmail || !message) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    const contactRequest = await prisma.contactRequest.create({
      data: {
        cvProfileId,
        requesterUserId: payload.userId,
        requesterName,
        requesterEmail,
        requesterCompany,
        message,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, contactRequest });
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json({ success: false, message: "Failed to send message." }, { status: 500 });
  }
}
