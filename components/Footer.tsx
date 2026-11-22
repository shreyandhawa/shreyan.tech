import { site } from "@/content/site";

export function Footer({ hasResume }: { hasResume: boolean }) {
  return (
    <footer className="mt-28 flex max-w-[864px] flex-col gap-4 pb-8 text-[13px] text-muted md:flex-row md:justify-between">
      <ul className="flex gap-5">
        <li>
          <a href={site.contact.github.href} target="_blank" rel="noopener noreferrer" className="transition-colors duration-150 hover:text-ink">
            GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
        <li>
          <a href={`mailto:${site.contact.email}`} className="transition-colors duration-150 hover:text-ink">
            Email
          </a>
        </li>
        {hasResume && (
          <li>
            <a href="/resume.pdf" target="_blank" rel="noopener" className="transition-colors duration-150 hover:text-ink">
              Resume<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        )}
      </ul>
      <p>{site.footerNote}</p>
    </footer>
  );
}
