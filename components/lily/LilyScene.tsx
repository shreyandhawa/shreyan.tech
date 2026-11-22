"use client";

// The lily side, back to front: background glows, far + mid lilies (canvas), the character, front lilies and
// petals (canvas), then leader lines, labels, the panel, the name and the lily button. Fingers are the navigation;
// the selected finger lives in the URL hash (/lily#lumencell).

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Character } from "@/components/character/Character";
import { leaderLine, ROWS, SCENE } from "@/components/character/geometry";
import { LilyButton } from "@/components/LilyButton";
import { fingers, isFingerId, lily, type FingerId, type Hand } from "@/content/lily";
import { site } from "@/content/site";
import { field, petals } from "@/lib/lilies/field";
import { fitCanvas, LilyPainter, paintPetals } from "@/lib/lilies/paint";
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

export function LilyScene() {
  const selected = useSyncExternalStore(subscribeHash, readHash, () => null);
  const desktop = useSyncExternalStore(subscribeResize, () => matchMedia(DESKTOP).matches, () => true);
  const size = useSyncExternalStore(subscribeResize, viewport, () => `${SCENE.w}x${SCENE.h}`);
  const [W, H] = size.split("x").map(Number);
  // The 1440×900 composition scales to fit and sits on the bottom edge; lilies fill the whole viewport.
  const k = Math.min(W / SCENE.w, H / SCENE.h);
  const [lit, setLit] = useState<FingerId | null>(null);

  const back = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const f = field(W, H);
    const b = fitCanvas(back.current!, W, H);
    const painter = new LilyPainter(b.dpr);
    painter.draw(b.ctx, f.far);
    painter.draw(b.ctx, f.mid);
    // Under 900px everything sits behind the label list, so it all goes on the back canvas.
    const ctx = desktop ? fitCanvas(front.current!, W, H).ctx : b.ctx;
    painter.draw(ctx, f.front);
    // Keep petals off the label columns and the character (stage boxes mapped to the viewport).
    const kk = Math.min(W / SCENE.w, H / SCENE.h);
    const toStage = (x: number, y: number) => [SCENE.w / 2 + (x - W / 2) / kk, SCENE.h - (H - y) / kk];
    const avoid = (x: number, y: number) => {
      const [sx, sy] = toStage(x, y);
      return sy > 100 && sy < 400 && ((sx > 240 && sx < 450) || (sx > 990 && sx < 1200) || (sx > 530 && sx < 910));
    };
    paintPetals(ctx, petals(W, H, 7, 12, desktop ? avoid : undefined));
  }, [W, H, desktop]);

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
      data-side="lily"
      className="fixed inset-0 flex animate-[fade-in_400ms_ease-out_both] flex-col overflow-hidden text-ink"
      style={{
        background:
          "radial-gradient(ellipse 32% 42% at 50% 44%, rgb(142 14 18 / 0.32), transparent 70%), radial-gradient(ellipse 75% 32% at 50% 102%, rgb(227 34 27 / 0.22), transparent 72%), var(--bg)",
      }}
    >
      <canvas ref={back} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />

      <h1 className="relative z-20 px-4 pt-6 text-[15px] font-medium md:fixed md:left-8 md:top-8 md:p-0">{site.name}</h1>

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
                className={`transition-[stroke,opacity] ${dim ? "duration-[320ms]" : "duration-[120ms]"} ${
                  on ? "stroke-scarlet opacity-100 delay-[280ms] motion-reduce:delay-0" : `stroke-ink ${lit === f.id ? "opacity-85" : dim ? "opacity-0" : "opacity-40"}`
                }`}
              />
            );
          })}
        </svg>
        <p className="label absolute top-[112px] hidden w-full text-center md:block">
          {selectedFinger ? lily.plateSelected(selectedFinger) : lily.plate}
        </p>

        <div className="grid grid-cols-2 gap-x-4 bg-gradient-to-t from-bg via-bg/90 to-transparent px-4 pb-6 pt-8 md:contents">
          {(["left", "right"] as Hand[]).map((hand) => {
            const hidden = panelHand === hand;
            const edge = hand === "left" ? { right: SCENE.w - 428 } : { left: 1012 };
            return (
              <div key={hand} inert={hidden} className="md:contents">
                <p className={`label text-scarlet-light! transition-opacity duration-[320ms] md:absolute md:top-[121px] ${hidden ? "md:opacity-0" : ""}`} style={edge}>
                  {lily.hands[hand]}
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

      <LilyButton side="lily" />
    </div>
  );
}
