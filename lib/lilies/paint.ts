// Canvas 2D painting for lilies. Fully open heads are baked once into bitmaps and reused;
// only flowers that are still opening are drawn as vectors each frame.

import type { Petal } from "./field";
import { headBounds, ribbon, seeded, sideHead, topHead, type Head, type Point } from "./geometry";

export type LayerName = "far" | "mid" | "front" | "white" | "red";

type Style = {
  view: "side" | "top";
  florets: number;
  petals: number;
  /** Flat colour, or a radial gradient from the head centre: [core, mid, edge]. */
  fill: string | [string, string, string];
  outline?: [color: string, width: number];
  stamen: string;
  anther: string;
  stem?: string;
  midrib?: string;
  blur?: number;
  glow?: boolean;
  shadow?: boolean;
};

// Appendix B, layer table.
export const STYLES: Record<LayerName, Style> = {
  far: { view: "side", florets: 5, petals: 3, fill: "#4F090D", stamen: "#5E1512", anther: "#6E4A1C", stem: "#1F3319", blur: 2.5 },
  mid: {
    view: "side",
    florets: 5,
    petals: 4,
    fill: ["#5E080C", "#B8161A", "#D93A2C"],
    outline: ["#3E0406", 0.7],
    stamen: "#B93522",
    anther: "#C9942F",
    stem: "#35562A",
    midrib: "#E8705F",
  },
  front: {
    view: "side",
    florets: 7,
    petals: 5,
    fill: ["#8E0E12", "#E3221B", "#F4513F"],
    outline: ["#5A0609", 0.9],
    stamen: "#E8452F",
    anther: "#F4B63F",
    stem: "#4F7A32",
    midrib: "#FFA595",
    glow: true,
  },
  white: { view: "top", florets: 6, petals: 4, fill: "#FFFFFF", outline: ["#B9B6A6", 0.7], stamen: "#A9AC9C", anther: "#D8BE6A", shadow: true },
  // A takeover flower once the dark front reaches it: the front layer's colours, seen from above.
  red: {
    view: "top",
    florets: 6,
    petals: 4,
    fill: ["#8E0E12", "#E3221B", "#F4513F"],
    outline: ["#5A0609", 0.7],
    stamen: "#E8452F",
    anther: "#F4B63F",
    midrib: "#FFA595",
  },
};

export type Flower = {
  layer: LayerName;
  /** Head centre, CSS px. */
  x: number;
  y: number;
  R: number;
  seed: number;
  /** 0 to 1; anything under 1 is drawn as vectors each frame. */
  open: number;
  /** Where the stem meets the ground, and how far its midpoint bows sideways. */
  stem?: { x: number; y: number; bend: number };
  /** Extra blur in px (out-of-focus flowers at the bottom edge). */
  blur?: number;
};

export function buildHead(f: Flower, open = f.open): Head {
  const s = STYLES[f.layer];
  const opts = { florets: s.florets, petalsPerFloret: s.petals, stamensPerFloret: s.petals, open };
  return (s.view === "top" ? topHead : sideHead)(f.x, f.y, f.R, seeded(f.seed), opts);
}

/** Closed outline smoothed with quadratic curves through the midpoints. */
function smooth(pts: Point[]): Path2D {
  const path = new Path2D();
  const mid = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  path.moveTo(...mid(pts[pts.length - 1], pts[0]));
  for (let i = 0; i < pts.length; i++) path.quadraticCurveTo(...pts[i], ...mid(pts[i], pts[(i + 1) % pts.length]));
  path.closePath();
  return path;
}

/** Paint order per head: stamens, petals (fill then outline), mid-ribs, anthers. The stem is drawn separately. */
export function paintHead(ctx: CanvasRenderingContext2D, head: Head, f: Flower) {
  const s = STYLES[f.layer];
  const R = f.R;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const stamens = new Path2D();
  for (const st of head.stamens) {
    stamens.moveTo(...st.from);
    stamens.quadraticCurveTo(...st.control, ...st.to);
  }
  ctx.strokeStyle = s.stamen;
  ctx.lineWidth = Math.max(0.5, R * 0.014);
  ctx.stroke(stamens);

  let fill: string | CanvasGradient = s.fill as string;
  if (Array.isArray(s.fill)) {
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, R * 1.15);
    g.addColorStop(0, s.fill[0]);
    g.addColorStop(0.45, s.fill[1]);
    g.addColorStop(1, s.fill[2]);
    fill = g;
  }
  for (const p of head.petals) {
    const path = smooth(p.outline);
    ctx.fillStyle = fill;
    ctx.fill(path);
    if (s.outline) {
      ctx.strokeStyle = s.outline[0];
      ctx.lineWidth = s.outline[1];
      ctx.stroke(path);
    }
  }

  if (s.midrib) {
    const ribs = new Path2D();
    for (const p of head.petals) {
      ribs.moveTo(...p.midrib[0]);
      for (const pt of p.midrib.slice(1)) ribs.lineTo(...pt);
    }
    ctx.strokeStyle = s.midrib;
    ctx.lineWidth = Math.max(0.5, R * 0.012);
    ctx.stroke(ribs);
  }

  const anthers = new Path2D();
  for (const st of head.stamens) {
    anthers.moveTo(st.to[0] + st.antherRadius, st.to[1]);
    anthers.arc(st.to[0], st.to[1], st.antherRadius, 0, Math.PI * 2);
  }
  ctx.fillStyle = s.anther;
  ctx.fill(anthers);
}

/** Stem from the ground to the head; `dx` moves the head end sideways (sway). */
export function paintStem(ctx: CanvasRenderingContext2D, f: Flower, dx = 0) {
  const color = STYLES[f.layer].stem;
  if (!color || !f.stem) return;
  const { x, y, bend } = f.stem;
  ctx.beginPath();
  ctx.moveTo(f.x + dx, f.y + f.R * 0.05);
  ctx.quadraticCurveTo((f.x + x) / 2 + bend, (f.y + y) / 2, x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, f.R * 0.05);
  ctx.lineCap = "round";
  ctx.stroke();
}

type Sprite = { img: HTMLCanvasElement; glow?: HTMLCanvasElement; x: number; y: number; w: number; h: number };

/** Bakes one open head (with its blur, glow or drop shadow) into bitmaps at the given pixel ratio. */
function bake(f: Flower, dpr: number): Sprite {
  const s = STYLES[f.layer];
  const head = buildHead(f, 1);
  const b = headBounds(head);
  const blur = (s.blur ?? 0) + (f.blur ?? 0);
  const pad = Math.ceil(blur * 3 + (s.glow ? f.R * 0.3 : 0) + (s.shadow ? 10 : 0) + 2);
  const x = Math.floor(b.x - pad);
  const y = Math.floor(b.y - pad);
  const w = Math.ceil(b.w + pad * 2);
  const h = Math.ceil(b.h + pad * 2);
  const canvas = (draw: (ctx: CanvasRenderingContext2D) => void) => {
    const c = document.createElement("canvas");
    c.width = Math.ceil(w * dpr);
    c.height = Math.ceil(h * dpr);
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, -x * dpr, -y * dpr);
    draw(ctx);
    return c;
  };

  const sharp = canvas((ctx) => paintHead(ctx, head, f));
  const img = canvas((ctx) => {
    // Canvas filter lengths are in bitmap pixels, so scale CSS px by the pixel ratio.
    if (blur) ctx.filter = `blur(${blur * dpr}px)`;
    if (s.shadow) {
      ctx.shadowColor = "rgba(30, 42, 34, 0.28)";
      ctx.shadowBlur = 6 * dpr;
      ctx.shadowOffsetY = 2 * dpr;
    }
    ctx.drawImage(sharp, x, y, w, h);
  });
  // Front glow: a blurred copy, drawn underneath in screen blend at 70%.
  const glow = s.glow
    ? canvas((ctx) => {
        ctx.filter = `blur(${(Math.max(4, f.R * 0.12) + blur) * dpr}px)`;
        ctx.globalAlpha = 0.7;
        ctx.drawImage(sharp, x, y, w, h);
      })
    : undefined;
  return { img, glow, x, y, w, h };
}

/** Draws flowers: each head from a cached bitmap once fully open, or as vectors while it opens. */
export class LilyPainter {
  private sprites = new Map<Flower, Sprite>();
  constructor(private dpr: number) {}

  /** One head, no stem. */
  drawHead(ctx: CanvasRenderingContext2D, f: Flower) {
    if (f.open < 1) {
      if (f.open > 0) paintHead(ctx, buildHead(f), f);
      return;
    }
    let sprite = this.sprites.get(f);
    if (!sprite) this.sprites.set(f, (sprite = bake(f, this.dpr)));
    if (sprite.glow) {
      ctx.globalCompositeOperation = "screen";
      ctx.drawImage(sprite.glow, sprite.x, sprite.y, sprite.w, sprite.h);
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.drawImage(sprite.img, sprite.x, sprite.y, sprite.w, sprite.h);
  }

  /**
   * Stems then heads, in order. `sway` gives each flower a small angle (radians): the head leans and tilts by it
   * and the stem follows, so the stamens sway a few degrees without redrawing the cached bitmap.
   */
  draw(ctx: CanvasRenderingContext2D, flowers: Flower[], sway?: (f: Flower) => number) {
    for (const f of flowers) {
      const a = sway?.(f) ?? 0;
      if (!a) {
        paintStem(ctx, f);
        this.drawHead(ctx, f);
        continue;
      }
      const dx = a * (f.stem ? (f.stem.y - f.y) * 0.12 : 0);
      paintStem(ctx, f, dx);
      ctx.save();
      ctx.translate(f.x + dx, f.y);
      ctx.rotate(a);
      ctx.translate(-f.x, -f.y);
      this.drawHead(ctx, f);
      ctx.restore();
    }
  }
}

/** Sizes a canvas to its CSS box with the device pixel ratio capped at 2, and returns a context in CSS px. */
export function fitCanvas(canvas: HTMLCanvasElement, w: number, h: number) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, dpr };
}

/** Fallen petals: short curled scarlet ribbons with a pale mid-rib. */
export function paintPetals(ctx: CanvasRenderingContext2D, list: Petal[]) {
  for (const p of list) {
    const r = ribbon(p.x, p.y, p.angle, p.length, p.length * 0.2, 1.4, p.sign, 6, seeded(p.seed));
    ctx.fillStyle = "#E3221B";
    ctx.fill(smooth(r.outline));
    ctx.strokeStyle = "#FFA595";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    r.midrib.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }
}
