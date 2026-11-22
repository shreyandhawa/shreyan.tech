// The takeover itself: drawing and the GSAP clock. Loaded after the page (or on first use) so it never delays
// first paint; components/takeover/Takeover.tsx owns the canvas, routing and the handler the buttons call.

import gsap from "gsap";
import { CURSOR_REFRESH } from "@/components/Cursor";
import type { Point } from "@/lib/lilies/geometry";
import { fitCanvas, LilyPainter, type Flower } from "@/lib/lilies/paint";
import { density, frameMeter, perf } from "@/lib/lilies/perf";
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
import { sceneTimeline, setArriving } from "./controller";

const SCENE_BG = "#0B0A0C";
const HAZE = "rgba(227, 34, 27, 0.55)";
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
      // The haze is a full-screen blur: the first thing to go on a slow machine.
      if (!perf.slow) {
        ctx.shadowColor = HAZE;
        ctx.shadowBlur = 60 * dpr; // shadow lengths are in device pixels
      }
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

type Run = {
  canvas: HTMLCanvasElement;
  origin: Point;
  /** 1: light → lily; -1: the same timeline backwards at 1.4×. */
  direction: 1 | -1;
  /** Change the route under cover, then call resume once the new page is there. */
  navigate: (resume: () => void) => void;
  done: () => void;
};

export function runTakeover({ canvas: c, origin, direction, navigate, done }: Run) {
  const W = innerWidth;
  const H = innerHeight;
  const { ctx, dpr } = fitCanvas(c, W, H);
  c.style.display = "block";
  c.style.opacity = "1";
  refreshCursor();

  const finish = () => {
    ctx.clearRect(0, 0, W, H);
    c.style.display = "none";
    setArriving(false);
    refreshCursor();
    done();
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

  const plan = planTakeover(W, H, origin, density());
  const meter = frameMeter();
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
      meter(performance.now());
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
