/** A link that opens in a new tab: underline draws in on hover, ↗ after the text, and a screen-reader note. */
export function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="tap relative draw">
      {children}
      <span aria-hidden="true">&nbsp;↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
