import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Script from "next/script";
import PwaRegistration from "@/components/PwaRegistration";
import CookieBanner from "@/components/CookieBanner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Index' });
 
  return {
    title: t('title'),
    description: t('description'),
    icons: {
      icon: "/favicon.png",
    },
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!['en', 'fr', 'es', 'de'].includes(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
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
        <NextIntlClientProvider messages={messages}>
          <PwaRegistration />
          {children}
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
