import { MetadataRoute } from 'next';
import { getMarketingConfig } from '@/app/lib/marketing-config';
import prisma from "@/app/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = await getMarketingConfig();
  
  // If sitemap is disabled in admin, return minimal
  if (config && config.enableSitemap === false) {
    return [
      {
        url: 'https://vidio-cv.com',
        lastModified: new Date(),
      },
    ];
  }

  const baseUrl = 'https://vidio-cv.com';

  // Fetch all active jobs for sitemap
  const jobs = await prisma.job.findMany({
    select: { id: true, updatedAt: true }
  });

  const jobUrls = jobs.map((job) => ({
    url: `${baseUrl}/jobs/${job.id}`,
    lastModified: job.updatedAt,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    ...jobUrls,
  ];
}
