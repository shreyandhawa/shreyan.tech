/** A link that opens in a new tab: underline draws in on hover, ↗ after the text, and a screen-reader note. Other props (data-umami-event) pass through. */
export function ExternalLink({ href, children, className = "draw", ...rest }: React.ComponentProps<"a"> & { href: string }) {
  return (
    <a {...rest} href={href} target="_blank" rel="noopener noreferrer" className={`tap relative ${className}`}>
      {children}
      <span aria-hidden="true">&nbsp;↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
