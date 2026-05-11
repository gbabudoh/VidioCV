import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // In a real app, get current user ID from session
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // const userId = session.user.id;
    
    // For now, let's assume we have a way to identify the user (e.g., from a header or just a mock)
    // In this repo, auth seems to be handled via cookies or specific middleware
    
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. Upload to storage (MinIO/Local)
    // const storageKey = await uploadToStorage(file);
    const storageKey = `id_docs/${Date.now()}_${file.name}`;
    
    // 2. Mock AI Face Match (Tensorflow.js logic would go here in a worker or server-side)
    const matchScore = 0.92; // Mock score

    // 3. Update User Status in DB
    // Since we don't have session here, we'd normally use the authenticated user's ID
    // We'll mock it for now by finding any candidate user
    const user = await prisma.user.findFirst({ where: { role: "candidate" } });
    
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma.user as any).update({
        where: { id: user.id },
        data: {
          identityStatus: "PENDING",
          identityDocumentKey: storageKey,
          identityMatchScore: matchScore
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      status: "PENDING",
      matchScore
    });

  } catch (error) {
    console.error("Identity upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
