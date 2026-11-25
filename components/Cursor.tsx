"use client";

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

/** A seed, tip at the hotspot, following the pointer exactly. A label from the nearest `data-cursor` attribute sits to its right. */
export function Cursor() {
  const enabled = useSyncExternalStore(subscribe, () => matchMedia(QUERY).matches, () => false);
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
    let x = -1;
    const update = () => {
      el.style.opacity = target && !target.closest(SYSTEM) ? "1" : "0";
      const next = target?.closest("[data-cursor]")?.getAttribute("data-cursor") ?? "";
      if (next !== label) {
        const t = text.current!;
        // One label swapped for another ("Copy email" → "Copied") crossfades in 150ms: the old text fades out over the new.
        if (label && next) {
          const old = document.createElement("span");
          old.className = "absolute left-1.5 top-0 whitespace-nowrap text-[14px] font-medium leading-[22px] text-ink";
          old.textContent = label;
          box.current!.append(old);
          old.animate({ opacity: [1, 0] }, 150).onfinish = () => old.remove();
          t.animate({ color: ["transparent", getComputedStyle(t).color] }, 150);
        }
        label = next;
        t.textContent = next;
        labelWidth = next ? t.offsetWidth : 0;
        box.current!.style.width = `${labelWidth}px`;
      }
      // Near the right edge the label sits to the left of the glyph instead.
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
    <div ref={root} aria-hidden="true" className="group pointer-events-none fixed left-0 top-0 z-[100] opacity-0 will-change-transform">
      <svg width="16" height="16" viewBox="0 0 16 16" className="block text-ink">
        <path d="M0 0C6 1 15 5 15 10A5 5 0 0 1 10 15C5 15 1 6 0 0Z" fill="currentColor" />
      </svg>
      <span
        ref={box}
        className="absolute left-[22px] top-[6px] block w-0 overflow-hidden transition-[width] duration-[120ms] ease-out group-data-[flip=true]:left-auto group-data-[flip=true]:right-[calc(100%+6px)]"
      >
        <span ref={text} className="inline-block whitespace-nowrap rounded-sm bg-bg/90 px-1.5 text-[14px] font-medium leading-[22px] text-ink" />
      </span>
    </div>
  );
}
