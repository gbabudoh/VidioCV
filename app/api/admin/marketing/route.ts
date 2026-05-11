import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { key: "marketing_config" }
    });
    
    return NextResponse.json({ 
      success: true, 
      config: config?.value || {} 
    });
  } catch (error) {
    console.error("Marketing config GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const config = await prisma.siteConfig.upsert({
      where: { key: "marketing_config" },
      update: { value: body },
      create: { 
        key: "marketing_config", 
        value: body 
      }
    });

    return NextResponse.json({ 
      success: true, 
      config: config.value 
    });
  } catch (error) {
    console.error("Marketing config POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
