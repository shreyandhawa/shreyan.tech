import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/about/", ...projects.map((p) => `/work/${p.slug}/`), "/lily/"].map((path) => ({ url: site.url + path }));
}
