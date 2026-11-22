"use client";

// The takeover overlay: one fixed canvas above every page, in the root layout so it survives the route change.
// A single GSAP tween (run.ts) drives time t from 0 to 2 (forward) or 2 to 0 at 1.4× (return); every frame is
// drawn from t (see lib/takeover.ts), the lily scene's arrival timeline follows the same clock, and the route
// changes at t = 1.3 while the dark front covers the screen. run.ts loads after the page, so it costs nothing
// before first paint.

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { Point } from "@/lib/lilies/geometry";
import { rememberReturn, setArriving, setTakeoverHandler } from "./controller";

const norm = (p: string) => p.replace(/(.)\/$/, "$1");
const load = () => import("./run");

export function Takeover() {
  const router = useRouter();
  const pathname = usePathname();
  const canvas = useRef<HTMLCanvasElement>(null);
  const pending = useRef<{ to: string; resume: () => void } | null>(null);
  const running = useRef(false);

  // Resume the clock once the route under the cover has changed (the new page's effects have run by now).
  useEffect(() => {
    const p = pending.current;
    if (p && norm(pathname) === norm(p.to)) {
      pending.current = null;
      p.resume();
    }
  }, [pathname]);

  useEffect(() => {
    router.prefetch("/lily/");
    // Fetch the takeover code once the page has loaded and the browser is idle.
    const warm = () => ("requestIdleCallback" in window ? requestIdleCallback(() => void load()) : setTimeout(load, 200));
    if (document.readyState === "complete") warm();
    else addEventListener("load", warm, { once: true });

    async function go(origin: Point, direction: 1 | -1, to: string) {
      if (running.current) return;
      running.current = true;
      const { runTakeover } = await load();
      runTakeover({
        canvas: canvas.current!,
        origin,
        direction,
        // Navigate under cover, then wait for the new page before carrying on. If it never arrives, load it fully.
        navigate: (resume) => {
          if (direction === 1) setArriving(true);
          const fallback = setTimeout(() => location.assign(to), 4000);
          pending.current = {
            to,
            resume: () => {
              clearTimeout(fallback);
              resume();
            },
          };
          router.push(to);
        },
        done: () => {
          running.current = false;
        },
      });
    }

    setTakeoverHandler({
      forward: (origin) => {
        rememberReturn(location.pathname);
        go(origin, 1, "/lily/");
      },
      back: (origin, to) => go(origin, -1, to),
    });
    return () => {
      removeEventListener("load", warm);
      setTakeoverHandler(null);
    };
  }, [router]);

  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-auto fixed inset-0 z-[95] size-full" style={{ display: "none" }} />;
}
