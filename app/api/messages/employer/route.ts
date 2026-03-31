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

    // Fetch contact requests where the requester is this employer (This model exists in Prisma client)
    const contactRequests = await prisma.contactRequest.findMany({
      where: { requesterUserId: payload.userId },
      include: {
        cvProfile: {
          select: { title: true, userId: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch direct messages received by this employer (RAWR-SQL Workaround for missing model)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const directMessages: any[] = await prisma.$queryRaw`
      SELECT 
        dm.id, 
        dm.body, 
        dm.status, 
        dm.created_at,
        u.name as "senderName"
      FROM direct_messages dm
      JOIN users u ON dm.sender_id = u.id
      WHERE dm.receiver_id = ${payload.userId}::uuid
      ORDER BY dm.created_at DESC
    `;

    // Resolve candidate names for contact requests
    const candidateUserIds = [...new Set(contactRequests.map((m) => m.cvProfile.userId))];
    const userProfiles = await prisma.userProfile.findMany({
      where: { userId: { in: candidateUserIds } },
      select: { userId: true, fullName: true },
    });
    const users = await prisma.user.findMany({
      where: { id: { in: candidateUserIds } },
      select: { id: true, name: true },
    });
    const profileMap = Object.fromEntries(userProfiles.map((p) => [p.userId, p.fullName]));
    const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

    const formattedRelays = contactRequests.map((m) => ({
      id: m.id,
      candidateName: profileMap[m.cvProfile.userId] || userMap[m.cvProfile.userId] || "Candidate",
      candidateTitle: m.cvProfile.title || "Professional",
      message: m.message,
      replyMessage: m.replyMessage || null,
      status: m.status || "pending",
      createdAt: m.createdAt,
      type: "inquiry"
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedDirects = directMessages.map((dm: any) => ({
      id: dm.id,
      candidateName: dm.senderName,
      candidateTitle: "Direct Message",
      message: dm.body,
      replyMessage: null,
      status: dm.status === "unread" ? "pending" : dm.status,
      createdAt: dm.created_at,
      type: "direct"
    }));

    const allMessages = [...formattedRelays, ...formattedDirects].sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dateA = new Date(a.createdAt as any).getTime();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dateB = new Date(b.createdAt as any).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ success: true, messages: allMessages });
  } catch (error) {
    console.error("Fetch employer messages error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
