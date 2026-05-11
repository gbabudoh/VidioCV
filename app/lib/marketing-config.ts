import prisma from "@/app/lib/prisma";

export interface MarketingConfig {
  gaId: string;
  gtmId: string;
  fbPixelId: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  enableSitemap: boolean;
  enableGeoIP: boolean;
  geoPricing: boolean;
}

export async function getMarketingConfig() {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { key: "marketing_config" }
    });
    return (config?.value as unknown as MarketingConfig) || null;
  } catch (error) {
    console.error("Error fetching marketing config:", error);
    return null;
  }
}
