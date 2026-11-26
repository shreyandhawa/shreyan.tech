import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import { Cursor } from "@/components/Cursor";
import { site } from "@/content/site";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
// Mono only sets small labels: not worth a preload on the critical path.
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", preload: false });
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: site.name,
    description: site.description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${site.name}: ${site.home.headline}`,
      },
    ],
  },
  twitter: { card: "summary_large_image" },
};

// --bg in globals.css.
export const viewport: Viewport = { themeColor: "#e4eae0" };

// Umami Cloud, no cookies. Only the deploy sets this (deploy.yml), so dev and CI builds carry no script; data-domains
// also keeps a local build that has it from counting visits.
const umami = process.env.UMAMI_WEBSITE_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        <Cursor />
        {umami && (
          <Script src="https://cloud.umami.is/script.js" data-website-id={umami} data-domains={new URL(site.url).hostname} strategy="lazyOnload" />
        )}
      </body>
    </html>
  );
}
