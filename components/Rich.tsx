/** Renders `backticked` spans of a content string as inline code. */
export function Rich({ text }: { text: string }) {
  return text
    .split("`")
    .map((part, i) => (i % 2 ? <code key={i} className="font-mono text-[0.875em]">{part}</code> : part));
}
