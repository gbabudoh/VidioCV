import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";
import { z } from "zod";

const manageRequestSchema = z.object({
  messageId: z.string().uuid(),
  action: z.enum(["archive", "delete"]),
});

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { messageId, action } = manageRequestSchema.parse(body);

    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id: messageId },
      include: {
        cvProfile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!contactRequest || contactRequest.cvProfile.userId !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to message" },
        { status: 403 }
      );
    }

    if (action === "delete") {
      await prisma.contactRequest.delete({
        where: { id: messageId },
      });
      return NextResponse.json({ success: true, message: "Message deleted successfully" });
    } else if (action === "archive") {
      await prisma.contactRequest.update({
        where: { id: messageId },
        data: { status: "archived" },
      });
      return NextResponse.json({ success: true, message: "Message archived successfully" });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
    }
    console.error("Message management error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
