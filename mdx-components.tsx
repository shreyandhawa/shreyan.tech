import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { ExternalLink } from "@/components/ExternalLink";
import { Sidenote } from "@/components/Sidenote";

// Links sit inside running text here, so they keep an underline at rest (ink on ink-2 alone is under 3:1).
const inText = "text-ink underline decoration-muted underline-offset-[3px] hover:decoration-ink";

// Note body type, matching the project pages: label section headings, 16/26 body.
const components: MDXComponents = {
  h2: (props) => <h2 className="label mt-12" {...props} />,
  p: (props) => <p className="mt-3 text-[16px] leading-[26px] text-ink-2" {...props} />,
  ul: (props) => <ul className="mt-3 list-disc pl-5 text-[16px] leading-[26px] text-ink-2" {...props} />,
  ol: (props) => <ol className="mt-3 list-decimal pl-5 text-[16px] leading-[26px] text-ink-2" {...props} />,
  code: (props) => <code className="font-mono text-[0.875em]" {...props} />,
  a: ({ href = "", children }) =>
    /^https?:\/\//.test(href) ? (
      <ExternalLink href={href} className={inText}>
        {children}
      </ExternalLink>
    ) : (
      <Link href={href} className={inText}>
        {children}
      </Link>
    ),
  Sidenote,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
