import type { Row } from "@/content/site";

/** Label and value rows separated by hairlines; stacked when the container is narrow. Without a title, the caller supplies the heading. */
export function Rows({ title, rows, className = "" }: { title?: string; rows: Row[]; className?: string }) {
  const id = title && `rows-${title.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <section aria-labelledby={id} className={`@container ${className}`}>
      {title && (
        <h2 id={id} className="label mb-3">
          {title}
        </h2>
      )}
      <dl>
        {rows.map((r) => (
          <div key={r.label} className="grid gap-1 border-b border-line py-4 @lg:grid-cols-[180px_1fr] @lg:gap-6">
            <dt className="text-[14px] font-medium leading-[22px] text-ink">{r.label}</dt>
            <dd className="text-[14px] leading-[22px] text-ink-2">
              {r.value.map((v) => (
                <p key={v} className="first-letter:uppercase">
                  {v}
                </p>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
