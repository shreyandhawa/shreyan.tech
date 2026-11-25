import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

// Plugins by name: Turbopack can't take functions. remark-frontmatter keeps the YAML block out of the page; content/notes.ts reads it.
const withMDX = createMDX({ options: { remarkPlugins: ["remark-frontmatter"] } });

export default withMDX(nextConfig);
