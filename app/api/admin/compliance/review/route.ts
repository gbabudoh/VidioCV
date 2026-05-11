import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/mail";

export async function POST(request: Request) {
  try {
    const { userId, status } = await request.json();

    if (!userId || !['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        identityStatus: status,
        identityVerifiedAt: status === 'VERIFIED' ? new Date() : null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    });

    // Notify the user via Postal
    try {
      await sendEmail({
        to: updatedUser.email!,
        subject: `Identity Verification ${status === 'VERIFIED' ? 'Approved' : 'Action Required'}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: ${status === 'VERIFIED' ? '#10b981' : '#f43f5e'};">Identity ${status === 'VERIFIED' ? 'Verified' : 'Rejected'}</h2>
            <p>Hello,</p>
            <p>${status === 'VERIFIED' 
              ? 'Great news! Your identity has been successfully verified. You now have full access to premium job opportunities and your profile will display the "Trusted" badge.' 
              : 'Unfortunately, your identity document could not be verified. Please log in to your dashboard and re-upload a clear copy of your government-issued ID.'}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">This is an automated message from VidioCV Trust & Safety.</p>
          </div>
        `
      });
    } catch (mailError) {
      console.error("Failed to send verification email:", mailError);
    }

    return NextResponse.json({
      success: true,
      message: `User identity ${status.toLowerCase()} successfully.`,
      user: updatedUser
    });
  } catch (error) {
    console.error("Compliance Review Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
