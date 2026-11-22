import Link from "next/link";
import { CopyEmail } from "@/components/CopyEmail";
import { MediaFrame } from "@/components/MediaFrame";
import { Rows } from "@/components/Rows";
import { lily, type Finger } from "@/content/lily";
import { getProject } from "@/content/projects";
import { site } from "@/content/site";

function Body({ finger }: { finger: Finger }) {
  const project = getProject(finger.id);
  if (project) {
    return (
      <>
        <p className="mt-2 font-mono text-[11px] tracking-[0.5px] text-muted">
          {project.listing.status} · {project.listing.year}
        </p>
        <div className="mt-6">
          <MediaFrame media={project.hero} />
        </div>
        <p className="mt-5 text-[15px] leading-[23px] text-ink">{project.oneLine}</p>
        <ul aria-label="Stack" className="mt-5 flex flex-wrap gap-2">
          {project.stack.slice(0, 4).map((s) => (
            <li key={s} className="rounded-full border border-ink/40 px-2.5 py-0.5 font-mono text-[11px] text-ink">
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-6">
          <Link href={`/work/${project.slug}/`} className="text-[14px] font-medium text-ink underline-offset-4 hover:underline">
            {lily.openCaseStudy}
          </Link>
        </p>
      </>
    );
  }

  switch (finger.id) {
    case "about":
      return site.about.map((p, i) => (
        <p key={p} className={i ? "mt-4 text-[15px] leading-[23px] text-ink-2" : "mt-4 font-serif text-[22px] leading-[29px] text-ink"}>
          {p}
        </p>
      ));
    case "research":
      return <Rows rows={site.research} className="mt-4" />;
    case "education":
      return <Rows rows={site.education} className="mt-4" />;
    case "contact": {
      const { email, github, city, availability } = site.contact;
      return (
        <>
          <CopyEmail email={email} className="mt-4 text-[26px] leading-[32px]" />
          <p className="mt-3 text-[14px] text-ink">
            <a href={github.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
              {github.label}
              <span aria-hidden="true"> ↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
          <p className="mt-3 text-[14px] leading-[22px] text-ink-2">{city}</p>
          <p className="text-[14px] leading-[22px] text-ink-2">{availability}</p>
        </>
      );
    }
  }
}

/**
 * The section a finger opens: a side panel on desktop (over the opposite label column), a bottom sheet under
 * 900px. Slides in over 320ms just after the thumb lands, and back out on release; a fade with reduced motion.
 */
export function LilyPanel({ finger, leaving, onClose, style }: { finger: Finger; leaving: boolean; onClose: () => void; style?: React.CSSProperties }) {
  const side = finger.hand === "left" ? "md:right-10" : "md:left-10";
  // Offsets only apply with motion allowed; reduced motion gets the fade alone.
  const away = `motion-safe:translate-y-full motion-safe:md:translate-y-0 ${finger.hand === "left" ? "motion-safe:md:translate-x-6" : "motion-safe:md:-translate-x-6"}`;
  const enterFrom = `starting:opacity-0 motion-safe:starting:translate-y-full motion-safe:md:starting:translate-y-0 ${
    finger.hand === "left" ? "motion-safe:md:starting:translate-x-6" : "motion-safe:md:starting:-translate-x-6"
  }`;
  return (
    <section
      id="lily-panel"
      aria-labelledby="lily-panel-title"
      inert={leaving}
      style={style}
      className={`fixed inset-x-0 bottom-0 z-30 max-h-[75dvh] overflow-y-auto rounded-t-2xl border border-ink/15 bg-surface p-6 transition-[opacity,translate] duration-[320ms] ease-out motion-reduce:duration-150 md:inset-x-auto md:bottom-auto md:w-[400px] md:rounded-none md:p-7 ${side} ${
        leaving ? `opacity-0 ${away}` : `${enterFrom} delay-200 motion-reduce:delay-0`
      }`}
    >
      <p className="label text-scarlet-light!">{finger.caption}</p>
      <h2 id="lily-panel-title" className="mt-3 font-serif text-[40px] leading-[44px] text-ink md:text-[46px] md:leading-[50px]">
        {finger.label}
      </h2>
      <Body finger={finger} />
      <p className="mt-6 text-right">
        <button type="button" onClick={onClose} className="label transition-colors duration-150 hover:text-ink!">
          {lily.release}
        </button>
      </p>
    </section>
  );
}
