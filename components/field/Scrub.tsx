"use client";

import { useEffect, useRef } from "react";
import { drawField, makeField } from "./render";

const POINTS = 1500;
const chip = "pointer-events-none absolute bottom-3 left-3 rounded-sm bg-bg/90 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[1.5px] text-ink";

/**
 * A project figure for a `scrub` section: the grown field, all `--muted`, takes its pseudotime colour from the root
 * outward as it scrolls from half on screen to the middle. Two stills are drawn once; `--scrub` (0 → 1) masks the
 * coloured one in. A CSS view timeline animates `--scrub` (app/globals.css); without one, a scroll listener sets it.
 * Under reduced motion nothing sets it, so it rests at 1: the coloured still.
 */
export function Scrub() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const box = ref.current!;
    const css = getComputedStyle(box);
    const [muted, accent] = ["--muted", "--accent"].map((v) => css.getPropertyValue(v).trim());
    // Same seed, so the coloured points sit exactly on the muted ones.
    const fields = [makeField(POINTS, muted, muted), makeField(POINTS, muted, accent)];
    const canvases = [...box.querySelectorAll("canvas")];

    const resize = new ResizeObserver(([entry]) => {
      const dpr = Math.min(devicePixelRatio, 2);
      const { width: w, height: h } = entry.contentRect;
      canvases.forEach((canvas, i) => {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        const ctx = canvas.getContext("2d")!;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawField(ctx, fields[i], w, h, 1, null);
      });
    });
    resize.observe(box);

    // Reads the scroll position, never sets it. Same range as the CSS: entry 50% → cover 50%.
    const set = () => {
      const { top, height } = box.getBoundingClientRect();
      box.style.setProperty("--scrub", String(Math.min(1, Math.max(0, (innerHeight - height / 2 - top) / (innerHeight / 2)))));
    };
    const fallback = !CSS.supports("animation-timeline: view()") && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fallback) {
      set();
      addEventListener("scroll", set, { passive: true });
      addEventListener("resize", set);
    }
    return () => {
      resize.disconnect();
      removeEventListener("scroll", set);
      removeEventListener("resize", set);
    };
  }, []);

  return (
    // No overflow-hidden: that would make the figure its own scroller, and the view timeline would never move.
    <figure
      ref={ref}
      className="scrub relative bg-surface after:pointer-events-none after:absolute after:inset-0 after:shadow-[inset_0_0_0_1px_rgb(30_42_34/0.08)]"
    >
      <div
        role="img"
        aria-label="Schematic trajectory: a cloud of points branches from one root on the left into three lineages, coloured by pseudotime from grey-green at the root to blue at the three tips."
        className="aspect-[16/10]"
      >
        <canvas className="absolute inset-0 size-full" />
        <canvas className="scrub-colour absolute inset-0 size-full" />
      </div>
      <figcaption className={chip}>Schematic</figcaption>
    </figure>
  );
}
