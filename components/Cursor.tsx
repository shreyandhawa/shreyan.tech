"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";

// Mouse or trackpad only, and never with reduced motion (the system cursor is used then).
const QUERY = "(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)";
const subscribe = (onChange: () => void) => {
  const mq = matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
// Over these the system cursor comes back and ours hides (matches the CSS in globals.css).
const SYSTEM = "input, textarea, select, [contenteditable], pre, [data-cursor-system]";

/**
 * A seed on the light side, a fallen petal on the lily side, tip at the hotspot. It follows the pointer exactly.
 * A label from the nearest `data-cursor` attribute sits to its right; `data-cursor-accent` turns it accent red,
 * `data-cursor-ring` adds a thin ring (used on fingers).
 */
export function Cursor() {
  const enabled = useSyncExternalStore(subscribe, () => matchMedia(QUERY).matches, () => false);
  const lily = usePathname().startsWith("/lily");
  const root = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!enabled || !el) return;
    const html = document.documentElement;
    html.classList.add("custom-cursor");

    let target: Element | null = null;
    let label = "";
    let labelWidth = 0;
    let x = 0;
    const update = () => {
      el.style.opacity = target && !target.closest(SYSTEM) ? "1" : "0";
      el.dataset.accent = String(!!target?.closest("[data-cursor-accent]"));
      el.dataset.ring = String(!!target?.closest("[data-cursor-ring]"));
      const next = target?.closest("[data-cursor]")?.getAttribute("data-cursor") ?? "";
      if (next !== label) {
        label = next;
        text.current!.textContent = next;
        labelWidth = next ? text.current!.offsetWidth : 0;
        box.current!.style.width = `${labelWidth}px`;
      }
      // Near the right edge (the lily button) the label sits to the left of the glyph instead.
      el.dataset.flip = String(x + 30 + labelWidth > innerWidth);
    };
    const move = (e: PointerEvent) => {
      x = e.clientX;
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      target = e.target instanceof Element ? e.target : null;
      update();
    };
    const leave = () => {
      target = null;
      update();
    };
    // Labels can change under a still pointer ("Copy email" → "Copied").
    const observer = new MutationObserver(update);
    observer.observe(document.body, { subtree: true, attributeFilter: ["data-cursor"] });

    addEventListener("pointermove", move, { passive: true });
    html.addEventListener("pointerleave", leave);
    return () => {
      observer.disconnect();
      removeEventListener("pointermove", move);
      html.removeEventListener("pointerleave", leave);
      html.classList.remove("custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div
      ref={root}
      aria-hidden="true"
      data-side={lily ? "lily" : undefined}
      className="group pointer-events-none fixed left-0 top-0 z-[100] opacity-0 will-change-transform"
    >
      {lily ? (
        <svg width="20" height="20" viewBox="0 0 20 20" className="block overflow-visible">
          <circle cx="8" cy="8" r="11" fill="none" stroke="var(--scarlet)" strokeWidth="1" className="hidden group-data-[ring=true]:block" />
          <path d="M0 0C5 1.5 15 8 18 16C11.5 15.5 3 9 0 0Z" fill="var(--scarlet)" />
          <path d="M1.5 1.5C6 5 11 10 15.5 14" fill="none" stroke="#FFA595" strokeWidth="0.9" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" className="block text-ink group-data-[accent=true]:text-accent">
          <path d="M0 0C6 1 15 5 15 10A5 5 0 0 1 10 15C5 15 1 6 0 0Z" fill="currentColor" />
        </svg>
      )}
      <span
        ref={box}
        className="absolute left-[22px] top-[6px] block w-0 overflow-hidden transition-[width] duration-[120ms] ease-out group-data-[flip=true]:left-auto group-data-[flip=true]:right-[calc(100%+6px)]"
      >
        <span
          ref={text}
          className="inline-block whitespace-nowrap rounded-sm bg-bg/90 px-1.5 text-[14px] font-medium leading-[22px] text-ink group-data-[accent=true]:text-accent"
        />
      </span>
    </div>
  );
}
