import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cvProfileId, requesterUserId, requesterName, requesterEmail, requesterCompany, message } = body;

    if (!cvProfileId || !requesterName || !requesterEmail || !message) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    const contactRequest = await prisma.contactRequest.create({
      data: {
        cvProfileId,
        requesterUserId,
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
