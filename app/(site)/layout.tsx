import { existsSync } from "node:fs";
import { join } from "node:path";
import { Footer } from "@/components/Footer";
import { Rail } from "@/components/Rail";

// The Resume link is hidden until public/resume.pdf exists.
const hasResume = existsSync(join(process.cwd(), "public", "resume.pdf"));

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#content" className="sr-only z-50 bg-bg px-3 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Rail hasResume={hasResume} />
      <div className="px-4 md:pl-[200px] md:pr-[72px] lg:pl-[288px]">
        <main id="content" className="max-w-[864px] pt-12 md:pt-[220px]">
          {children}
        </main>
        <Footer hasResume={hasResume} />
      </div>
      <div aria-hidden="true" className="grain" />
    </>
  );
}
