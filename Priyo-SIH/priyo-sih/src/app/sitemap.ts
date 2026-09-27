import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://skillbridge-sih-rho.vercel.app",
      lastModified: new Date(),
    },
  ];
}