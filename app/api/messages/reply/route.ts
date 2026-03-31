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
    const { messageId, replyMessage, type } = body;
    
    console.log("Reply Attempt:", { messageId, type, candidateId: payload.userId });

    if (!messageId || !replyMessage) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    if (type === "direct") {
       // RAWR-SQL Workaround to find original message and verify ownership
       // Using explicit CAST to ensure UUID matching across different environments
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       const dms: any[] = await prisma.$queryRaw`
         SELECT id, sender_id, receiver_id 
         FROM direct_messages 
         WHERE id = CAST(${messageId} AS uuid)
       `;

       if (!dms || dms.length === 0) {
         console.warn("[Reply API] Direct message not found in table for ID:", messageId);
         return NextResponse.json({ success: false, message: "Message not found." }, { status: 404 });
       }

       const originalMessage = dms[0];
       // Ensure the candidate was the RECEIVER of this direct message
       if (originalMessage.receiver_id !== payload.userId) {
         return NextResponse.json({ error: "Forbidden: Not your thread" }, { status: 403 });
       }

       // Create a NEW direct message as reply (swapping sender/receiver)
       await prisma.$executeRaw`
         INSERT INTO direct_messages (id, sender_id, receiver_id, body, status, created_at)
         VALUES (gen_random_uuid(), ${payload.userId}::uuid, ${originalMessage.sender_id}::uuid, ${replyMessage}, 'unread', NOW())
       `;

       return NextResponse.json({ success: true, message: "Reply dispatched via direct thread." });
    } else {
      // Standard inquiry reply (ContactRequest model exists in client)
      const contactRequest = await prisma.contactRequest.findUnique({
        where: { id: messageId },
        include: { cvProfile: { select: { userId: true } } },
      });

      if (!contactRequest) {
        return NextResponse.json({ success: false, message: "Inquiry not found." }, { status: 404 });
      }

      if (contactRequest.cvProfile.userId !== payload.userId) {
        return NextResponse.json({ error: "Forbidden: Access violation" }, { status: 403 });
      }

      const updatedRequest = await prisma.contactRequest.update({
        where: { id: messageId },
        data: {
          replyMessage,
          repliedAt: new Date(),
          status: "replied",
        },
      });

      return NextResponse.json({ success: true, contactRequest: updatedRequest });
    }
  } catch (error) {
    console.error("Failed to send reply:", error);
    return NextResponse.json({ success: false, message: "Failed to send reply." }, { status: 500 });
  }
}
