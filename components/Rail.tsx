"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getProject } from "@/content/projects";
import { site } from "@/content/site";

type Item = { id: string; href: string; label: string };

/** Section id whose top has passed 40% of the viewport (or the last one at the page end). */
function useActiveSection(key: string, ids: string[]) {
  const [state, setState] = useState({ key, id: ids[0] });
  const joined = ids.join();

  useEffect(() => {
    if (!joined) return;
    const list = joined.split(",");
    const onScroll = () => {
      let id = list[0];
      for (const s of list) {
        const el = document.getElementById(s);
        if (el && el.getBoundingClientRect().top < innerHeight * 0.4) id = s;
      }
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) id = list[list.length - 1];
      setState({ key, id });
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [key, joined]);

  return state.key === key ? state.id : ids[0];
}

export function Rail({ hasResume }: { hasResume: boolean }) {
  const pathname = usePathname().replace(/(.)\/$/, "$1");
  const project = getProject(pathname.match(/^\/projects\/([^/]+)/)?.[1] ?? "");

  const items: Item[] = project
    ? project.sections.length > 1
      ? project.sections.map((s) => ({ id: s.id, href: `#${s.id}`, label: s.title }))
      : []
    : [
        { id: "/", href: "/", label: "Projects" },
        { id: "/about", href: "/about/", label: "About" },
      ];

  const section = useActiveSection(pathname, project ? items.map((i) => i.id) : []);
  const active = project ? section : pathname;

  // One marker that slides to the active item (200ms); placed without animation the first time.
  // Offsets are relative to <nav>, the nearest positioned ancestor of each <li>.
  const list = useRef<HTMLUListElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);
  useLayoutEffect(() => {
    const place = () => {
      const m = marker.current;
      const li = list.current?.querySelector("[aria-current]")?.parentElement;
      if (!m) return;
      if (!li) return void (m.style.opacity = "0");
      m.style.transition = placed.current ? "" : "none";
      m.style.opacity = "1";
      m.style.transform = `translate(${li.offsetLeft - 13}px, ${li.offsetTop + li.offsetHeight / 2 - 2.5}px)`;
      placed.current = true;
    };
    place();
    addEventListener("resize", place);
    return () => removeEventListener("resize", place);
  }, [active, items.length]);

  return (
    <header className="relative z-30 px-4 pt-4 md:fixed md:inset-y-0 md:left-0 md:w-[200px] md:p-0 lg:w-[288px]">
      <p className="flex h-10 items-center text-[14px] text-ink-2 md:absolute md:left-8 md:top-8 md:block md:h-auto">
        {project ? (
          <>
            <Link href="/" className="tap relative transition-colors duration-150 hover:text-ink">
              <span aria-hidden="true">← </span>Projects
            </Link>
            <span aria-hidden="true" className="mx-1.5 text-muted">
              /
            </span>
            <span className="text-muted">{project.name}</span>
          </>
        ) : (
          <Link href="/" className="tap relative transition-colors duration-150 hover:text-ink">
            {site.name}
          </Link>
        )}
      </p>

      {(items.length > 0 || (!project && hasResume)) && (
        <nav aria-label={project ? "Sections" : "Main"} className="relative mt-3 pl-3 md:absolute md:left-8 md:top-[226px] md:mt-0 md:pl-0">
          <span
            ref={marker}
            aria-hidden="true"
            className="absolute left-0 top-0 size-[5px] bg-accent opacity-0 transition-transform duration-200 ease-out motion-reduce:transition-none"
          />
          <ul ref={list} className="flex gap-6 text-[15px] leading-5 md:flex-col md:gap-3">
            {items.map((item) => {
              const isActive = item.id === active;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? (project ? "location" : "page") : undefined}
                    className={`tap relative transition-colors duration-150 hover:text-ink ${isActive ? "text-ink" : "text-muted"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {!project && hasResume && (
              <li>
                <a href="/resume.pdf" target="_blank" rel="noopener" className="tap relative text-muted transition-colors duration-150 hover:text-ink">
                  Resume<span aria-hidden="true"> ↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
