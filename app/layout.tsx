import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import PwaRegistration from "@/components/PwaRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VidioCV - Transform Your Recruitment",
  description:
    "VidioCV: A revolutionary platform that replaces static resumes with dynamic, AI-enhanced video profiles for modern recruitment.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          strategy="afterInteractive"
          data-domain={
            process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "vidio-cv.com"
          }
          src={`${process.env.NEXT_PUBLIC_PLAUSIBLE_URL || "https://plausible.feendesk.com"}/js/script.js`}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
