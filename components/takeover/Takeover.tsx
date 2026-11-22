"use client";

// The takeover overlay: one fixed canvas above every page, in the root layout so it survives the route change.
// A single GSAP tween drives time t from 0 to 2 (forward) or 2 to 0 at 1.4× (return); every frame is drawn from t
// (see lib/takeover.ts), the lily scene's arrival timeline follows the same clock, and the route changes at
// t = 1.3 while the dark front covers the screen.

import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { fitCanvas, LilyPainter, type Flower } from "@/lib/lilies/paint";
import type { Point } from "@/lib/lilies/geometry";
import {
  clamp01,
  COVERED,
  coverOpacity,
  DURATION,
  flowerState,
  frontEdge,
  LIFT_END,
  planTakeover,
  redness,
  type TakeoverPlan,
} from "@/lib/takeover";
import { CURSOR_REFRESH } from "@/components/Cursor";
import { rememberReturn, sceneTimeline, setArriving, setTakeoverHandler } from "./controller";

const SCENE_BG = "#0B0A0C";
const HAZE = "rgba(227, 34, 27, 0.55)";
const norm = (p: string) => p.replace(/(.)\/$/, "$1");
const refreshCursor = () => dispatchEvent(new Event(CURSOR_REFRESH));

type Twins = { white: Flower; red: Flower };

function draw(ctx: CanvasRenderingContext2D, plan: TakeoverPlan, twins: Twins[], painter: LilyPainter, t: number, W: number, H: number, dpr: number) {
  ctx.clearRect(0, 0, W, H);

  // The dark front, with a red haze on its edge; once it covers everything it lifts off the new page.
  const cover = coverOpacity(t);
  if (t > 0.4 && cover > 0) {
    ctx.save();
    ctx.globalAlpha = cover;
    ctx.fillStyle = SCENE_BG;
    if (t < COVERED) {
      ctx.beginPath();
      for (let i = 0; i <= 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        const r = frontEdge(plan, a, t);
        ctx[i ? "lineTo" : "moveTo"](plan.origin[0] + Math.cos(a) * r, plan.origin[1] + Math.sin(a) * r);
      }
      ctx.shadowColor = HAZE;
      ctx.shadowBlur = 60 * dpr; // shadow lengths are in device pixels
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  // Flowers on top: white, then red from the centre outward as the front reaches them; they close and fade at the end.
  plan.flowers.forEach((f, i) => {
    const { open, closed } = flowerState(f, t);
    if (open <= 0 || closed >= 1) return;
    const { white, red } = twins[i];
    white.open = red.open = open;
    ctx.save();
    ctx.globalAlpha = 1 - closed;
    if (closed > 0) {
      const s = 1 - 0.8 * closed;
      ctx.translate(f.x, f.y);
      ctx.scale(s, s);
      ctx.translate(-f.x, -f.y);
    }
    const r = redness(plan, f, t);
    if (r < 1) painter.drawHead(ctx, white);
    if (r > 0) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.R * 2.2 * r, 0, Math.PI * 2);
      ctx.clip();
      painter.drawHead(ctx, red);
    }
    ctx.restore();
  });
}

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
    const c = canvas.current!;
    router.prefetch("/lily/");

    function go(origin: Point, direction: 1 | -1, to: string) {
      if (running.current) return;
      running.current = true;
      const W = innerWidth;
      const H = innerHeight;
      const { ctx, dpr } = fitCanvas(c, W, H);
      c.style.display = "block";
      c.style.opacity = "1";
      refreshCursor();

      const finish = () => {
        ctx.clearRect(0, 0, W, H);
        c.style.display = "none";
        running.current = false;
        setArriving(false);
        refreshCursor();
      };

      // Navigate under cover, then wait for the new page before carrying on. If it never arrives, load it fully.
      const navigate = (resume: () => void) => {
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
      };

      // Reduced motion: a 200ms cross-fade through the scene colour instead.
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        ctx.fillStyle = SCENE_BG;
        ctx.fillRect(0, 0, W, H);
        gsap.fromTo(c, { opacity: 0 }, {
          opacity: 1,
          duration: 0.1,
          onComplete: () => navigate(() => {
            sceneTimeline()?.progress(1);
            gsap.to(c, { opacity: 0, duration: 0.1, onComplete: finish });
          }),
        });
        return;
      }

      const plan = planTakeover(W, H, origin, navigator.hardwareConcurrency <= 4 ? 0.5 : 1);
      const twins: Twins[] = plan.flowers.map((f) => ({
        white: { layer: "white", x: f.x, y: f.y, R: f.R, seed: f.seed, open: 0 },
        red: { layer: "red", x: f.x, y: f.y, R: f.R, seed: f.seed, open: 0 },
      }));
      const painter = new LilyPainter(dpr);
      const clock = { t: direction === 1 ? 0 : DURATION };
      let crossed = false;

      // The button dips as it is pressed.
      const button = document.querySelector("[data-lily-button]");
      if (button && direction === 1) gsap.fromTo(button, { scale: 1 }, { scale: 0.86, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" });

      const tween = gsap.to(clock, {
        t: direction === 1 ? DURATION : 0,
        duration: DURATION,
        ease: "none",
        onUpdate() {
          if (!crossed && (direction === 1 ? clock.t >= COVERED : clock.t <= COVERED)) {
            crossed = true;
            clock.t = COVERED;
            tween.pause();
            navigate(() => tween.resume());
          }
          // Nothing left to draw once the cover has lifted; the scene's own timeline carries on to t = 2.
          if (clock.t < LIFT_END) draw(ctx, plan, twins, painter, clock.t, W, H, dpr);
          else ctx.clearRect(0, 0, W, H);
          sceneTimeline()?.progress(clamp01((clock.t - COVERED) / (DURATION - COVERED)));
        },
        onComplete: finish,
      });
      if (direction === -1) tween.timeScale(1.4);
    }

    setTakeoverHandler({
      forward: (origin) => {
        rememberReturn(location.pathname);
        go(origin, 1, "/lily/");
      },
      back: (origin, to) => go(origin, -1, to),
    });
    return () => setTakeoverHandler(null);
  }, [router]);

  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-auto fixed inset-0 z-[95] size-full" style={{ display: "none" }} />;
}
