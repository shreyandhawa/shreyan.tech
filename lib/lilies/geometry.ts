// Red spider lily geometry, ported from the reference generator (build prompt, Appendix B).
// Pure functions: points only, no canvas. Screen space: y points down, -90° is up.

export type Point = [number, number];
export type Rand = () => number;

export type Petal = { outline: Point[]; midrib: Point[] };
export type Stamen = { from: Point; control: Point; to: Point; antherRadius: number };
export type Head = { petals: Petal[]; stamens: Stamen[] };

export type HeadOptions = {
  florets?: number;
  petalsPerFloret?: number;
  stamensPerFloret?: number;
  steps?: number;
  /** 0 (bud) to 1 (fully open): scales petal length and curl, and stamen length. */
  open?: number;
};

const DEG = Math.PI / 180;

/** Seeded PRNG (mulberry32), 0 to 1. */
export function seeded(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One strap-shaped, curled petal: its outline (left side forward, right side back) and a mid-rib polyline. */
export function ribbon(
  cx: number,
  cy: number,
  angle: number,
  length: number,
  maxHalfWidth: number,
  curl: number,
  sign: number,
  steps: number,
  rand: Rand,
): Petal {
  const left: Point[] = [];
  const right: Point[] = [];
  const mid: Point[] = [];
  let x = cx;
  let y = cy;
  const ds = length / steps;
  const phase = rand() * 6.28;
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    // heading turns back on itself, with a slight waver
    const th = angle + sign * curl * Math.pow(t, 1.6) + 0.22 * t * Math.sin(8 * t + phase);
    // narrow at the base, widest mid-way, pointed at the tip
    const w = maxHalfWidth * Math.pow(Math.max(0, Math.sin(Math.PI * (0.1 + 0.9 * t))), 0.55);
    const nx = -Math.sin(th);
    const ny = Math.cos(th);
    left.push([x + nx * w, y + ny * w]);
    right.push([x - nx * w, y - ny * w]);
    mid.push([x, y]);
    x += ds * Math.cos(th);
    y += ds * Math.sin(th);
  }
  return {
    outline: left.concat(right.reverse()),
    midrib: mid.slice(Math.round(steps * 0.2), Math.round(steps * 0.8) + 1),
  };
}

/** One flower head seen from the side; R is the head radius. Stamens sweep upward. */
export function sideHead(cx: number, cy: number, R: number, rand: Rand, opts: HeadOptions = {}): Head {
  const { florets = 7, petalsPerFloret = 5, stamensPerFloret = 5, steps = 8, open = 1 } = opts;
  const petals: Petal[] = [];
  const stamens: Stamen[] = [];
  const axes = [-162, -126, -90, -54, -18, -198, 18].slice(0, florets);
  for (const a0 of axes) {
    const ax = (a0 + (rand() - 0.5) * 14) * DEG;
    const bx = cx + Math.cos(ax) * R * 0.13;
    const by = cy + Math.sin(ax) * R * 0.13;
    for (let i = 0; i < petalsPerFloret; i++) {
      const spread = ((i / (petalsPerFloret - 1)) * 2 - 1) * 78 * DEG + (rand() - 0.5) * 0.25;
      const sign = Math.abs(spread) < 0.2 ? (rand() < 0.5 ? 1 : -1) : Math.sign(spread); // curl away from the floret axis
      const length = R * (0.85 + rand() * 0.4);
      const curl = (105 + rand() * 85) * DEG;
      petals.push(ribbon(bx, by, ax + spread, length * open, R * 0.1, curl * open, sign, steps, rand));
    }
    for (let i = 0; i < stamensPerFloret; i++) {
      const a = ax + (rand() - 0.5) * 1.0;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const L = R * (1.5 + rand() * 0.6) * open;
      stamens.push({
        from: [bx, by],
        control: [bx + c * L * 0.6, by + s * L * 0.6 + R * 0.16 * open], // sags a little first
        to: [bx + c * L * 0.8, by + s * L * 0.8 - L * (0.22 + 0.2 * Math.abs(c))], // then sweeps upward
        antherRadius: Math.max(1, R * 0.036),
      });
    }
  }
  return { petals, stamens };
}

/** One flower head seen from above (the takeover): floret axes evenly around 360°, a 60° petal spread, stamens that swirl. */
export function topHead(cx: number, cy: number, R: number, rand: Rand, opts: HeadOptions = {}): Head {
  const { florets = 6, petalsPerFloret = 4, stamensPerFloret = 4, steps = 8, open = 1 } = opts;
  const petals: Petal[] = [];
  const stamens: Stamen[] = [];
  const turn = rand() * 360;
  for (let f = 0; f < florets; f++) {
    const ax = (turn + (f * 360) / florets + (rand() - 0.5) * 14) * DEG;
    const bx = cx + Math.cos(ax) * R * 0.13;
    const by = cy + Math.sin(ax) * R * 0.13;
    for (let i = 0; i < petalsPerFloret; i++) {
      const spread = ((i / (petalsPerFloret - 1)) * 2 - 1) * 30 * DEG + (rand() - 0.5) * 0.25;
      const sign = Math.abs(spread) < 0.2 ? (rand() < 0.5 ? 1 : -1) : Math.sign(spread);
      const length = R * (0.85 + rand() * 0.4);
      const curl = (105 + rand() * 85) * DEG;
      petals.push(ribbon(bx, by, ax + spread, length * open, R * 0.1, curl * open, sign, steps, rand));
    }
    for (let i = 0; i < stamensPerFloret; i++) {
      const a = ax + (rand() - 0.5) * 0.8;
      const L = R * (1.1 + rand() * 0.4) * open;
      const swirl = 0.35; // radians the tip turns past the base direction
      stamens.push({
        from: [bx, by],
        control: [bx + Math.cos(a + swirl * 0.3) * L * 0.55, by + Math.sin(a + swirl * 0.3) * L * 0.55],
        to: [bx + Math.cos(a + swirl) * L * 0.9, by + Math.sin(a + swirl) * L * 0.9],
        antherRadius: Math.max(1, R * 0.036),
      });
    }
  }
  return { petals, stamens };
}

/** Axis-aligned bounds of every point in a head (petal outlines, stamen curves and anthers). */
export function headBounds(head: Head): { x: number; y: number; w: number; h: number } {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  const add = ([x, y]: Point, r = 0) => {
    x0 = Math.min(x0, x - r);
    y0 = Math.min(y0, y - r);
    x1 = Math.max(x1, x + r);
    y1 = Math.max(y1, y + r);
  };
  for (const p of head.petals) p.outline.forEach((pt) => add(pt));
  for (const s of head.stamens) {
    add(s.from);
    add(s.control);
    add(s.to, s.antherRadius);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
