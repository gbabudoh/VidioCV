import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";
import { z } from "zod";

const sendMessageSchema = z.object({
  receiverId: z.string().uuid(),
  subject: z.string().optional(),
  body: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const json = await request.json();
    const { receiverId, subject, body } = sendMessageSchema.parse(json);

    // RAWR-SQL Workaround because DirectMessage model is missing from Prisma Client
    await prisma.$executeRaw`
      INSERT INTO direct_messages (id, sender_id, receiver_id, subject, body, status, created_at)
      VALUES (uuid_generate_v4(), CAST(${payload.userId} AS uuid), CAST(${receiverId} AS uuid), ${subject || null}, ${body}, 'unread', NOW())
    `;

    return NextResponse.json({ success: true, message: "Signal Dispatched" });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
    console.error("Direct message send error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "received" or "sent"

    if (type === "sent") {
      // RAWR-SQL Workaround to join with User table for meta-data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messages: any[] = await prisma.$queryRaw`
        SELECT 
          dm.id as id, 
          dm.body, 
          dm.created_at as "createdAt", 
          dm.status,
          json_build_object('name', u.name, 'email', u.email) as receiver
        FROM direct_messages dm
        JOIN users u ON dm.receiver_id = u.id
        WHERE dm.sender_id = CAST(${payload.userId} AS uuid)
        ORDER BY dm.created_at DESC
      `;
      return NextResponse.json({ success: true, messages });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messages: any[] = await prisma.$queryRaw`
        SELECT 
          dm.id as id, 
          dm.body, 
          dm.created_at as "createdAt", 
          dm.status,
          json_build_object('name', u.name, 'email', u.email) as sender
        FROM direct_messages dm
        JOIN users u ON dm.sender_id = u.id
        WHERE dm.receiver_id = CAST(${payload.userId} AS uuid)
        ORDER BY dm.created_at DESC
      `;
      return NextResponse.json({ success: true, messages });
    }
  } catch (error) {
    console.error("Direct message fetch error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
