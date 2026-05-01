import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

interface ExtendedPrisma {
  integration: {
    findFirst: (args: { where: { type: string; status: string } }) => Promise<{ userId: string; config: unknown; apiKey: string } | null>;
  };
  job: {
    findFirst: (args: { where: { employerId: string } }) => Promise<{ id: string } | null>;
  };
  application: {
    upsert: (args: {
      where: { jobId_candidateId: { jobId: string; candidateId: string } };
      update: { externalId: string; status: string };
      create: { jobId: string; candidateId: string; externalId: string; status: string };
    }) => Promise<unknown>;
  };
}

const db = (prisma as unknown) as ExtendedPrisma;

/**
 * Lever Webhook Handler
 * Receives real-time signals from Lever ATS
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Lever standard webhook payload structure
    const { action, candidateId, performerId, stageId } = body;

    console.log(`[Lever Webhook] Action: ${action} | Candidate: ${candidateId} | Performer: ${performerId} | Stage: ${stageId}`);

    // LOGIC: If a candidate is moved to the "VidioCV Request" stage
    // We trigger our internal invitation logic
    if (action === "candidateStageChange") {
      // Find the associated integration to get the config
      // In a real scenario, we'd use a shared secret in the header to identify the tenant
      const integration = await db.integration.findFirst({
        where: { type: "LEVER", status: "active" }
      });

      if (integration) {
        interface LeverConfig {
          triggerStageId?: string;
        }
        const config = integration.config as LeverConfig;
        
        // Check if the new stage matches the 'triggerStage' set in the integration config
        if (stageId === config.triggerStageId) {
          console.log(`Triggering VidioCV invitation for candidate ${candidateId}`);
          
          // 1. Find the employer's Job that corresponds to this Lever event
          const job = await db.job.findFirst({
            where: { employerId: integration.userId }
          });

          if (job) {
             // 2. Create/Update the Application with the Lever Opportunity ID
             await db.application.upsert({
               where: {
                 jobId_candidateId: {
                   jobId: job.id,
                   candidateId: candidateId
                 }
               },
               update: {
                 externalId: candidateId,
                 status: "lever_invited"
               },
               create: {
                 jobId: job.id,
                 candidateId: candidateId,
                 externalId: candidateId,
                 status: "lever_invited"
               }
             });
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Lever Webhook Processing Error:", error);
    // Return 200 anyway to prevent Lever from retrying indefinitely on logical errors, 
    // but log the failure.
    return NextResponse.json({ error: "Webhook received but processing failed" }, { status: 200 });
  }
}

/**
 * Handle Webhook Verification (for some ATS that send GET for verification)
 */
export async function GET() {
  return NextResponse.json({ message: "VidioCV Lever Webhook Endpoint Active" });
}
