import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, action, type } = body;

    if (!messageId || !action || !type) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    if (type === "direct") {
      if (action === "delete") {
        await prisma.$executeRaw`
          DELETE FROM direct_messages 
          WHERE id = CAST(${messageId} AS uuid) 
          AND (sender_id = CAST(${payload.userId} AS uuid) OR receiver_id = CAST(${payload.userId} AS uuid))
        `;
      } else if (action === "archive") {
        await prisma.$executeRaw`
          UPDATE direct_messages 
          SET status = 'archived' 
          WHERE id = CAST(${messageId} AS uuid) 
          AND (sender_id = CAST(${payload.userId} AS uuid) OR receiver_id = CAST(${payload.userId} AS uuid))
        `;
      }
    } else {
      // Inquiry (ContactRequest)
      if (action === "delete") {
        await prisma.contactRequest.delete({
          where: { id: messageId },
        });
      } else if (action === "archive") {
        await prisma.contactRequest.update({
          where: { id: messageId },
          data: { status: "archived" },
        });
      }
    }

    return NextResponse.json({ success: true, message: `Message ${action}ed successfully.` });
  } catch (error) {
    console.error(`Failed to execute message action:`, error);
    return NextResponse.json({ success: false, message: "Action failed." }, { status: 500 });
  }
}
