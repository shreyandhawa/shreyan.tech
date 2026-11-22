"use client";

// Dev-only check of the lily renderer: one flower large, and the full field. Not in production builds.

import { useEffect, useRef, useState } from "react";
import { field } from "@/lib/lilies/field";
import { fitCanvas, LilyPainter, STYLES, type Flower, type LayerName } from "@/lib/lilies/paint";

const SCENE = "#0B0A0C";
const SAGE = "#E4EAE0";

function useCanvas(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, dpr: number) => void, deps: unknown[]) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const { ctx, dpr } = fitCanvas(ref.current!, w, h);
    draw(ctx, dpr);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redraw only when the listed inputs change
  }, deps);
  return ref;
}

export default function DevLilies() {
  const [layer, setLayer] = useState<LayerName>("front");
  const [seed, setSeed] = useState(3);
  const [open, setOpen] = useState(1);
  const [fieldSeed, setFieldSeed] = useState(1);

  const one = useCanvas(
    640,
    640,
    (ctx, dpr) => {
      const top = STYLES[layer].view === "top";
      ctx.fillStyle = layer === "white" ? SAGE : SCENE;
      ctx.fillRect(0, 0, 640, 640);
      const f: Flower = { layer, x: 320, y: top ? 320 : 360, R: 200, seed, open, stem: top ? undefined : { x: 330, y: 660, bend: 30 } };
      new LilyPainter(dpr).draw(ctx, [f]);
    },
    [layer, seed, open],
  );

  const scene = useCanvas(
    1440,
    900,
    (ctx, dpr) => {
      ctx.fillStyle = SCENE;
      ctx.fillRect(0, 0, 1440, 900);
      const painter = new LilyPainter(dpr);
      const f = field(1440, 900, fieldSeed);
      const t0 = performance.now();
      for (const list of [f.far, f.mid, f.front]) painter.draw(ctx, list);
      const t1 = performance.now();
      for (const list of [f.far, f.mid, f.front]) painter.draw(ctx, list);
      console.info(`field: ${f.far.length + f.mid.length + f.front.length} flowers, first paint ${(t1 - t0).toFixed(1)}ms, cached repaint ${(performance.now() - t1).toFixed(1)}ms`);
    },
    [fieldSeed],
  );

  return (
    <main data-side="lily" className="min-h-dvh bg-bg p-8 text-ink">
      <h1 className="font-serif text-[40px]">Lily renderer</h1>
      <section className="mt-6 flex flex-wrap items-start gap-8">
        <canvas ref={one} style={{ width: 640, height: 640 }} className="max-w-full" />
        <form className="grid gap-4 text-[14px]" onSubmit={(e) => e.preventDefault()}>
          <label className="grid gap-1">
            Layer
            <select value={layer} onChange={(e) => setLayer(e.target.value as LayerName)} className="bg-surface px-2 py-1">
              {Object.keys(STYLES).map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            Seed
            <input type="number" value={seed} onChange={(e) => setSeed(+e.target.value)} className="w-28 bg-surface px-2 py-1" />
          </label>
          <label className="grid gap-1">
            Open {open.toFixed(2)}
            <input type="range" min={0} max={1} step={0.01} value={open} onChange={(e) => setOpen(+e.target.value)} />
          </label>
          <label className="grid gap-1">
            Field seed
            <input type="number" value={fieldSeed} onChange={(e) => setFieldSeed(+e.target.value)} className="w-28 bg-surface px-2 py-1" />
          </label>
        </form>
      </section>
      <h2 className="label mt-10">Field, 1440 × 900</h2>
      <canvas ref={scene} style={{ width: 1440, height: 900 }} className="mt-3 h-auto max-w-full" />
    </main>
  );
}
