"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { getProject, nextProject, prevProject, type Project } from "@/content/projects";

/** One result, built on the server in app/(site)/layout.tsx. A mailto: href copies the address; http(s) and .pdf open a new tab. */
export type PaletteItem = { group: string; label: string; href: string };

const external = (href: string) => /^https?:|\.pdf$/.test(href);
// So "resume" finds "Open résumé".
const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const step: Record<string, (slug: string) => Project> = { j: nextProject, ArrowRight: nextProject, k: prevProject, ArrowLeft: prevProject };

/** ⌘K / Ctrl+K search over the site, and j/k or ←/→ between projects on a project page. */
export function Palette({ items }: { items: PaletteItem[] }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [shown, setShown] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const results = items.filter((i) => fold(i.label).includes(fold(query.trim())));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // The dialog's own open flag, not state: Esc closes it at once but its close event lands a moment later.
        const d = dialog.current!;
        if (d.open) return d.close();
        flushSync(() => {
          setShown(true);
          setQuery("");
          setActive(0);
          setCopied(false);
        });
        return d.showModal(); // focuses the input, now rendered
      }
      // Any open dialog, this one or a figure's lightbox: stepping away would drop it mid-view.
      if (document.querySelector("dialog[open]") || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if ((e.target as Element).closest?.("input, textarea, select, [contenteditable]")) return;
      // location, not usePathname: a key pressed right after a navigation must see the new page.
      const slug = location.pathname.match(/^\/projects\/([^/]+)/)?.[1] ?? "";
      const to = getProject(slug) && step[e.key]?.(slug);
      if (to) router.push(`/projects/${to.slug}/`);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [router]);

  // Braces matter: scrollIntoView now returns a promise, which React would call as a cleanup.
  useEffect(() => {
    list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  async function run({ href }: PaletteItem) {
    if (href.startsWith("mailto:")) {
      // Umami, when the build turned it on (app/layout.tsx); the About button tags itself with data-umami-event.
      (window as { umami?: { track(event: string): void } }).umami?.track("Copy email");
      try {
        await navigator.clipboard.writeText(href.slice(7));
        return setCopied(true);
      } catch {
        location.href = href;
      }
    } else if (external(href)) window.open(href, "_blank", "noopener");
    else router.push(href);
    dialog.current!.close();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const n = results.length;
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && n) {
      e.preventDefault();
      setActive((active + (e.key === "ArrowDown" ? 1 : n - 1)) % n);
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      run(results[active]);
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-label="Search the site"
      data-cursor-system
      // A late close event from an Esc right before a reopen must not empty the open dialog.
      onClose={(e) => !e.currentTarget.open && setShown(false)}
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      className="mx-auto mt-[15vh] w-[calc(100%-32px)] max-w-[560px] border border-line bg-surface text-ink backdrop:bg-ink/20"
    >
      {/* Rendered only while open, so each page's HTML carries an empty dialog. */}
      {shown && (
        <>
          <input
            role="combobox"
            aria-label="Search projects, notes and pages"
            aria-expanded={results.length > 0}
            aria-controls="palette-results"
            aria-autocomplete="list"
            aria-activedescendant={results.length ? `palette-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder="Search projects, notes and pages"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            className="w-full bg-transparent px-4 py-3.5 text-[16px] text-ink outline-none placeholder:text-ink-2"
          />
          {results.length ? (
            <ul ref={list} id="palette-results" role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto border-t border-line py-2">
              {results.map((item, i) => (
                <li
                  key={item.href}
                  id={`palette-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onClick={() => run(item)}
                  onPointerMove={() => setActive(i)}
                  className={`flex cursor-pointer items-baseline justify-between gap-4 px-4 py-2 text-[14px] leading-[22px] touch:py-3 ${i === active ? "bg-bg" : ""}`}
                >
                  <span>
                    {copied && item.href.startsWith("mailto:") ? "Copied" : item.label}
                    {external(item.href) && <span aria-hidden="true">&nbsp;↗</span>}
                  </span>
                  {/* The label style in ink-2, not its muted grey: muted on the surface ground is under 4.5:1. */}
                  <span className="font-mono text-[11px] uppercase leading-4 tracking-[1.5px] text-ink-2">{item.group}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-t border-line px-4 py-3 text-[14px] leading-[22px] text-ink-2">No matches</p>
          )}
          <span role="status" className="sr-only">
            {copied ? "Email copied" : ""}
          </span>
        </>
      )}
    </dialog>
  );
}
