import type { MetadataRoute } from 'next';
import { TOOLS } from './tool/[id]/tools-registry';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://x402.market';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`,        lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/usage`,   lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${base}/publish`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = Object.values(TOOLS).map((t) => ({
    url: `${base}/tool/${t.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...toolRoutes];
}
