"use client";

// The lily side, back to front: background glows, far + mid lilies (canvas), the character, front lilies and
// petals (canvas), then leader lines, labels, the panel, the name and the lily button. Fingers are the navigation;
// the selected finger lives in the URL hash (/lily#lumencell).

import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Character } from "@/components/character/Character";
import { leaderLine, ROWS, SCENE } from "@/components/character/geometry";
import { LilyButton } from "@/components/LilyButton";
import { isArriving, registerScene } from "@/components/takeover/controller";
import { fingers, isFingerId, lily, type FingerId, type Hand } from "@/content/lily";
import { site } from "@/content/site";
import { drift, field, petals } from "@/lib/lilies/field";
import { fitCanvas, LilyPainter, paintPetals, type Flower } from "@/lib/lilies/paint";
import { LilyPanel } from "./LilyPanel";

// --- URL hash as the source of truth for the selected finger -------------------------------------------------
const HASH_EVENT = "lily-hash";
const subscribeHash = (cb: () => void) => {
  addEventListener("hashchange", cb);
  addEventListener(HASH_EVENT, cb);
  return () => {
    removeEventListener("hashchange", cb);
    removeEventListener(HASH_EVENT, cb);
  };
};
const readHash = (): FingerId | null => {
  const h = decodeURIComponent(location.hash.slice(1));
  return isFingerId(h) ? h : null;
};
function setHash(id: FingerId | null) {
  history.replaceState(history.state, "", id ? `#${id}` : location.pathname + location.search);
  dispatchEvent(new Event(HASH_EVENT));
}

// --- Viewport ----------------------------------------------------------------------------------------------------
const DESKTOP = "(min-width: 900px)";
const subscribeResize = (cb: () => void) => {
  addEventListener("resize", cb);
  return () => removeEventListener("resize", cb);
};
const viewport = () => `${innerWidth}x${innerHeight}`;
const ROW_INDEX = { index: 0, middle: 1, ring: 2, little: 3 };

export function LilyScene() {
  const selected = useSyncExternalStore(subscribeHash, readHash, () => null);
  const desktop = useSyncExternalStore(subscribeResize, () => matchMedia(DESKTOP).matches, () => true);
  const size = useSyncExternalStore(subscribeResize, viewport, () => `${SCENE.w}x${SCENE.h}`);
  const [W, H] = size.split("x").map(Number);
  // The 1440×900 composition scales to fit and sits on the bottom edge; lilies fill the whole viewport.
  const k = Math.min(W / SCENE.w, H / SCENE.h);
  const [lit, setLit] = useState<FingerId | null>(null);

  const root = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLCanvasElement>(null);
  // Arriving through the takeover: start hidden and let its clock play the arrival. Loaded directly: fade in.
  const [arriving] = useState(isArriving);

  useEffect(() => {
    const f = field(W, H);
    const b = fitCanvas(back.current!, W, H);
    // Under 900px everything sits behind the label list, so it all goes on the back canvas.
    const fr = desktop ? fitCanvas(front.current!, W, H) : b;
    const painter = new LilyPainter(b.dpr);
    // Keep petals off the label columns and the character (stage boxes mapped to the viewport).
    const toStage = (x: number, y: number) => [SCENE.w / 2 + (x - W / 2) / k, SCENE.h - (H - y) / k];
    const avoid = (x: number, y: number) => {
      const [sx, sy] = toStage(x, y);
      return sy > 100 && sy < 400 && ((sx > 240 && sx < 450) || (sx > 990 && sx < 1200) || (sx > 530 && sx < 910));
    };
    const scattered = petals(W, H, 7, 12, desktop ? avoid : undefined);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Idle, the only ambient motion on the site: stamens sway a few degrees and petals drift. None with reduced motion.
    const frame = (s: number) => {
      const sway = still ? undefined : (fl: Flower) => 0.04 * Math.sin(s * 0.8 + (fl.seed % 1000) / 159);
      b.ctx.clearRect(0, 0, W, H);
      painter.draw(b.ctx, f.far, sway);
      painter.draw(b.ctx, f.mid, sway);
      if (fr !== b) fr.ctx.clearRect(0, 0, W, H);
      painter.draw(fr.ctx, f.front, sway);
      paintPetals(fr.ctx, still ? scattered : drift(scattered, s, W, H));
    };
    if (still) return void frame(0);
    let raf = requestAnimationFrame(function loop(ms) {
      frame(ms / 1000);
      raf = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(raf);
  }, [W, H, k, desktop]);

  // Arrival (t 1.3 → 2.0 of the takeover): the field grows up from the bottom, the character fades up and crosses
  // its arms, leader lines draw from fingertip to label, labels fade in top to bottom. The takeover drives this
  // timeline's progress, forwards on the way in and backwards on the way out.
  useLayoutEffect(() => {
    const el = root.current!;
    const all = (sel: string) => Array.from(el.querySelectorAll<HTMLElement>(sel));
    const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
    tl.fromTo([back.current, front.current], { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6 }, 0)
      .fromTo(all("#character"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4 }, 0)
      .fromTo(all("#forearm-right, #hand-left"), { rotation: 49, svgOrigin: "850 680" }, { rotation: 0, svgOrigin: "850 680", duration: 0.35 }, 0.1)
      .fromTo(all("#forearm-left, #hand-right"), { rotation: -49, svgOrigin: "590 680" }, { rotation: 0, svgOrigin: "590 680", duration: 0.35 }, 0.1)
      .fromTo(all("[data-intro=line]"), { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.25, stagger: 0.03 }, 0.3)
      .fromTo(
        all("[data-intro=label]"),
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.2, stagger: (_i: number, target: HTMLElement) => Number(target.dataset.row) * 0.06 },
        0.35,
      )
      .fromTo(all("[data-intro=chrome]"), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.4);
    tl.progress(arriving ? 0 : 1);
    const unregister = registerScene(tl);
    return () => {
      unregister();
      tl.kill();
    };
  }, [arriving]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && readHash() && setHash(null);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const select = (id: FingerId) => setHash(selected === id ? null : id);
  const selectedFinger = fingers.find((f) => f.id === selected);
  const panelHand = selectedFinger && (selectedFinger.hand === "left" ? "right" : "left");
  // Keep the last panel mounted for its 320ms exit after release.
  const [shown, setShown] = useState(selectedFinger);
  if (selectedFinger && selectedFinger !== shown) setShown(selectedFinger);
  const leaving = !selectedFinger && !!shown;
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setShown(undefined), 320);
    return () => clearTimeout(t);
  }, [leaving]);
  const stage = desktop ? { transform: `translateX(-50%) scale(${k})` } : undefined;
  const stageClass = "md:pointer-events-none md:absolute md:bottom-0 md:left-1/2 md:h-[900px] md:w-[1440px] md:origin-bottom";

  return (
    <div
      ref={root}
      data-side="lily"
      className={`fixed inset-0 flex flex-col overflow-hidden text-ink ${arriving ? "" : "animate-[fade-in_400ms_ease-out_both]"}`}
      style={{
        background:
          "radial-gradient(ellipse 32% 42% at 50% 44%, rgb(142 14 18 / 0.32), transparent 70%), radial-gradient(ellipse 75% 32% at 50% 102%, rgb(227 34 27 / 0.22), transparent 72%), var(--bg)",
      }}
    >
      <canvas ref={back} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />

      <h1 data-intro="chrome" className="relative z-20 px-4 pt-6 text-[15px] font-medium md:fixed md:left-8 md:top-8 md:p-0">
        {site.name}
      </h1>

      {/* Character: a stage scaled with the composition on desktop, the top half of the screen on small ones. */}
      <div className={`relative min-h-0 flex-1 ${stageClass} md:[&>svg]:pointer-events-auto`} style={stage}>
        <Character
          selected={selected}
          lit={lit}
          onSelect={select}
          onLight={setLit}
          viewBox={desktop ? undefined : "470 140 500 600"}
          className="absolute inset-0 size-full"
        />
      </div>

      <canvas ref={front} aria-hidden="true" className="pointer-events-none absolute inset-0 hidden size-full md:block" />

      {/* Leader lines, plate title and labels: a second stage above the front lilies. */}
      <div className={`relative z-10 ${stageClass}`} style={stage}>
        <svg viewBox={`0 0 ${SCENE.w} ${SCENE.h}`} aria-hidden="true" className="absolute inset-0 hidden size-full md:block">
          {fingers.map((f) => {
            const on = selected === f.id;
            const dim = (selectedFinger && selectedFinger.hand !== f.hand) || false;
            return (
              <polyline
                key={f.id}
                points={leaderLine(f.hand, f.finger).join(" ")}
                fill="none"
                strokeWidth={1}
                pathLength={1}
                strokeDasharray="1"
                data-intro="line"
                className={`transition-[stroke,opacity] ${dim ? "duration-[320ms]" : "duration-[120ms]"} ${
                  on ? "stroke-scarlet opacity-100 delay-[280ms] motion-reduce:delay-0" : `stroke-ink ${lit === f.id ? "opacity-85" : dim ? "opacity-0" : "opacity-40"}`
                }`}
              />
            );
          })}
        </svg>
        <p data-intro="chrome" className="label absolute top-[112px] hidden w-full text-center md:block">
          {selectedFinger ? lily.plateSelected(selectedFinger) : lily.plate}
        </p>

        <div className="grid grid-cols-2 gap-x-4 bg-gradient-to-t from-bg via-bg/90 to-transparent px-4 pb-6 pt-8 md:contents">
          {(["left", "right"] as Hand[]).map((hand) => {
            const hidden = panelHand === hand;
            const edge = hand === "left" ? { right: SCENE.w - 428 } : { left: 1012 };
            return (
              <div key={hand} inert={hidden} className="md:contents">
                <p className={`label text-scarlet-light! transition-opacity duration-[320ms] md:absolute md:top-[121px] ${hidden ? "md:opacity-0" : ""}`} style={edge}>
                  <span data-intro="label" data-row="0" className="inline-block">
                    {lily.hands[hand]}
                  </span>
                </p>
                <ul className="mt-2 md:contents">
                  {fingers
                    .filter((f) => f.hand === hand)
                    .map((f) => {
                      const on = selected === f.id;
                      const dim = selectedFinger?.hand === hand && !on;
                      return (
                        <li key={f.id} className={`transition-opacity duration-[320ms] md:pointer-events-auto md:absolute ${hidden ? "md:opacity-0" : ""}`} style={{ ...edge, top: ROWS[f.finger] - 18 }}>
                          <button
                            type="button"
                            data-intro="label"
                            data-row={ROW_INDEX[f.finger]}
                            aria-expanded={on}
                            aria-controls={on ? "lily-panel" : undefined}
                            onClick={() => select(f.id)}
                            onPointerEnter={() => setLit(f.id)}
                            onPointerLeave={() => setLit(null)}
                            onFocus={() => setLit(f.id)}
                            onBlur={() => setLit(null)}
                            className={`block min-h-11 py-1 text-left md:py-0 ${hand === "left" ? "md:text-right" : ""}`}
                          >
                            <span
                              className={`block font-serif text-[22px] leading-7 transition-[color,opacity] duration-[120ms] md:text-[30px] md:leading-9 ${
                                on ? "text-scarlet" : lit === f.id ? "text-scarlet-light" : "text-ink"
                              } ${dim ? "opacity-40" : ""} ${on || dim ? "delay-[280ms] motion-reduce:delay-0" : ""}`}
                            >
                              {f.label}
                            </span>
                            {/* Captions stay full strength when dimmed: at 40% they would fail AA contrast. */}
                            <span
                              className={`block font-mono text-[10px] uppercase tracking-[1.5px] transition-colors duration-[120ms] ${
                                on ? "text-scarlet-light delay-[280ms] motion-reduce:delay-0" : "text-muted"
                              }`}
                            >
                              {f.caption}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {shown && (
        <LilyPanel
          key={shown.hand}
          finger={shown}
          leaving={leaving}
          onClose={() => setHash(null)}
          style={desktop ? { top: Math.max(88, 122 * k), maxHeight: H - Math.max(88, 122 * k) - 32 } : undefined}
        />
      )}

      <div data-intro="chrome">
        <LilyButton side="lily" />
      </div>
    </div>
  );
}
