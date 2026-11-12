import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/discover", "/login", "/register"],
        disallow: ["/admin", "/settings", "/messages", "/swaps/new"],
      },
    ],
    sitemap: "https://skillswap.io/sitemap.xml",
  };
}
