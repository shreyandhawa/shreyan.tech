"use client";

import { useEffect, useRef } from "react";
import { drawField, makeField } from "./render";

const POINTS = 1500;
const GROW_MS = 7000;

/**
 * The field behind Home's headline: it grows into a branching trajectory over 7s, and points drift from the mouse.
 * Under reduced motion it draws one finished frame. The loop sleeps off screen, in a hidden tab, and once grown and still.
 */
export function Field({ className }: { className: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const css = getComputedStyle(canvas);
    const f = makeField(POINTS, css.getPropertyValue("--muted").trim(), css.getPropertyValue("--accent").trim());
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let grow = still ? 1 : 0;
    let last = 0;
    let raf = 0;
    let onScreen = false;
    let moving = false;
    let mouse: { x: number; y: number } | null = null;

    const draw = () => {
      const box = canvas.getBoundingClientRect();
      moving = drawField(ctx, f, w, h, grow, mouse && { x: mouse.x - box.left, y: mouse.y - box.top });
    };
    const tick = (now: number) => {
      grow = Math.min(1, grow + (last && now - last) / GROW_MS);
      last = now;
      draw();
      raf = 0;
      wake();
    };
    // Growth only advances while the loop runs, so a hidden tab or a scrolled-away field picks up where it left off.
    const wake = () => {
      if (onScreen && !document.hidden && (grow < 1 || moving)) raf ||= requestAnimationFrame(tick);
      else {
        cancelAnimationFrame(raf);
        raf = last = 0;
      }
    };

    const resize = new ResizeObserver(([entry]) => {
      const dpr = Math.min(devicePixelRatio, 2);
      ({ width: w, height: h } = entry.contentRect);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    });
    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      wake();
    });
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse = { x: e.clientX, y: e.clientY };
      moving = true;
      wake();
    };
    const leave = () => {
      mouse = null;
      moving = true;
      wake();
    };

    resize.observe(canvas);
    if (!still) {
      seen.observe(canvas);
      document.addEventListener("visibilitychange", wake);
      addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
    }
    return () => {
      resize.disconnect();
      seen.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", wake);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  // A replaced element won't stretch between insets, so the wrapper takes the position and the canvas fills it.
  return (
    <div aria-hidden="true" className={`pointer-events-none ${className}`}>
      <canvas ref={ref} className="block size-full" />
    </div>
  );
}
