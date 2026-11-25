/**
 * A note in the right margin from 1200px, beside the line it follows; below that, a small block in the text where it's written.
 * Phrasing content, so it can sit inside a paragraph: write it after the sentence it annotates.
 * Floated with clear, so neighbouring notes stack instead of overlapping. The column must be left-aligned, with 224px free to its right.
 */
export function Sidenote({ children }: { children: React.ReactNode }) {
  return (
    <span
      role="note"
      className="my-3 block border-l border-line pl-3 text-[14px] leading-[22px] text-muted lg:float-right lg:clear-right lg:-mr-[224px] lg:mb-0 lg:mt-1 lg:w-[192px]"
    >
      {children}
    </span>
  );
}
