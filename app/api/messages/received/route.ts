import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Find the candidate's CV profile (existing model)
    const cvProfile = await prisma.cvProfile.findFirst({
      where: { userId: payload.userId },
    });

    if (!cvProfile) {
      // Return empty array if user has no CV profile yet
      return NextResponse.json({ success: true, messages: [] });
    }

    // Fetch contact requests to this CV profile (existing model)
    const contactRequests = await prisma.contactRequest.findMany({
      where: { 
        cvProfileId: cvProfile.id,
        NOT: { status: "archived" }
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch direct messages received by this user (RAWR-SQL Workaround for missing model)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const directMessages: any[] = await prisma.$queryRaw`
      SELECT 
        dm.id as id, 
        dm.body, 
        dm.status, 
        dm.created_at,
        u.name as "senderName",
        u.email as "senderEmail"
      FROM direct_messages dm
      JOIN users u ON dm.sender_id = u.id
      WHERE dm.receiver_id = CAST(${payload.userId} AS uuid)
      ORDER BY dm.created_at DESC
    `;
    
    console.log("[Received Messages API] Resulting Direct Threads Count:", directMessages.length);

    // Combine and format
    const formattedRelays = contactRequests.map(cr => ({
      ...cr,
      type: "inquiry",
      senderName: cr.requesterName,
      senderCompany: cr.requesterCompany
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedDirects = directMessages.map((dm: any) => ({
      id: dm.id,
      requesterName: dm.senderName,
      requesterEmail: dm.senderEmail,
      requesterCompany: "Direct Message",
      message: dm.body,
      createdAt: dm.created_at,
      status: dm.status === "unread" ? "pending" : dm.status,
      type: "direct"
    }));

    const allMessages = [...formattedRelays, ...formattedDirects].sort((a, b) => {
      const dateA = new Date(a.createdAt as string | Date).getTime();
      const dateB = new Date(b.createdAt as string | Date).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ success: true, messages: allMessages });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
