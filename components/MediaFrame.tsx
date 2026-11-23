import { Clip } from "@/components/Clip";
import { SMALL, type Media } from "@/content/projects";

const chip = "absolute bottom-3 left-3 rounded-sm bg-bg/90 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[1.5px] text-ink";

/**
 * Still (AVIF with WebP fallback), or the "Interface in progress" panel when media is missing.
 * Width and height are always set so nothing shifts on load.
 */
export function MediaFrame({
  media,
  eager,
  hover,
  sizes = "(min-width: 900px) 864px, 100vw",
}: {
  media?: Media;
  eager?: boolean;
  hover?: boolean;
  /** Shown width, so small frames pick the SMALL variant. */
  sizes?: string;
}) {
  // 1px inset border at 8% ink, plus the card-hover wash, drawn above the media.
  const frame = `relative overflow-hidden bg-surface after:pointer-events-none after:absolute after:inset-0 after:shadow-[inset_0_0_0_1px_rgb(30_42_34/0.08)] ${
    hover ? "after:bg-white/0 after:transition-colors after:duration-200 group-hover:after:bg-white/15" : ""
  }`;

  if (!media) {
    return (
      <div className={`${frame} flex aspect-[16/10] items-end p-3`}>
        <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-ink-2">Interface in progress</span>
      </div>
    );
  }

  const portrait = media.height > media.width;
  const srcSet = (ext: string) =>
    media.width > SMALL ? `${media.src}-${SMALL}.${ext} ${SMALL}w, ${media.src}.${ext} ${media.width}w` : `${media.src}.${ext}`;
  return (
    <figure className={`${frame} ${portrait ? "mx-auto w-fit" : ""}`}>
      {media.video ? (
        <Clip src={media.video} poster={`${media.src}.webp`} label={media.alt} width={media.width} height={media.height} />
      ) : (
        <picture>
          <source srcSet={srcSet("avif")} sizes={sizes} type="image/avif" />
          <img
            src={`${media.src}.webp`}
            srcSet={srcSet("webp")}
            sizes={sizes}
            alt={media.alt}
            width={media.width}
            height={media.height}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : undefined}
            decoding="async"
            className={portrait ? "h-auto max-h-[640px] w-auto max-w-full" : "h-auto w-full"}
          />
        </picture>
      )}
      {media.caption && <figcaption className={chip}>{media.caption}</figcaption>}
    </figure>
  );
}
