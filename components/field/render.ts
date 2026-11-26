// The field: points scattered over a canvas that settle, root first, into a branching pseudotime trajectory.
// Plain canvas 2D with no React, so any page can drive it; Field.tsx runs it behind Home's headline.

const TAU = Math.PI * 2;
const STEPS = 16; // colour steps from --muted to --accent; one fill per step keeps a frame to 16 draw calls
const ALPHA = 0.6;
const REACH = 110; // CSS px around the cursor that points drift away from
const PUSH = 26; // CSS px a point right under the cursor moves

// Root → first branch, then one lineage up and a stem that splits in two: three tips. On Home at md and up the
// tree keeps to the band above the headline, and the last lineage drops into the space right of its second line.
// Each is a cubic Bézier in the canvas's 0–1 box, its pseudotime span, and its share of the points.
const SEGMENTS: [number[], number, number, number][] = [
  [[0.05, 0.44, 0.15, 0.5, 0.26, 0.28, 0.36, 0.3], 0, 0.36, 0.3],
  [[0.36, 0.3, 0.52, 0.32, 0.7, 0.08, 0.93, 0.07], 0.36, 1, 0.24],
  [[0.36, 0.3, 0.44, 0.29, 0.52, 0.4, 0.6, 0.39], 0.36, 0.6, 0.12],
  [[0.6, 0.39, 0.72, 0.38, 0.84, 0.27, 0.97, 0.3], 0.6, 1, 0.17],
  [[0.6, 0.39, 0.74, 0.4, 0.8, 0.8, 0.92, 0.84], 0.6, 1, 0.17],
];

// mulberry32: a seeded generator, so the field (and the reduced-motion still) is the same on every visit.
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --muted and --accent are #rrggbb in app/globals.css.
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** n points along SEGMENTS, coloured from `from` at pseudotime 0 to `to` at 1. */
export function makeField(n: number, from: string, to: string, seed = 7) {
  const rand = random(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(TAU * rand());
  const arr = () => new Float32Array(n);
  const f = {
    n,
    hx: arr(), // home on the trajectory, 0–1 of the canvas
    hy: arr(),
    nx: arr(), // spread around it, in units of the canvas's shorter side
    ny: arr(),
    sx: arr(), // start in the scattered field, 0–1 of the canvas
    sy: arr(),
    t: arr(), // pseudotime
    r: arr(), // radius, CSS px
    ox: arr(), // drift from the cursor, CSS px
    oy: arr(),
    x: arr(), // this frame's position and colour step
    y: arr(),
    step: new Uint8Array(n),
    palette: [] as string[],
  };
  for (let i = 0; i < n; i++) {
    let pick = rand();
    const [p, t0, t1] = SEGMENTS.find((s) => (pick -= s[3]) < 0) ?? SEGMENTS[0];
    const u = rand();
    const v = 1 - u;
    const [a, b, c, d] = [v * v * v, 3 * v * v * u, 3 * v * u * u, u * u * u];
    f.hx[i] = a * p[0] + b * p[2] + c * p[4] + d * p[6];
    f.hy[i] = a * p[1] + b * p[3] + c * p[5] + d * p[7];
    f.t[i] = t0 + u * (t1 - t0);
    // Progenitors spread wide; lineages tighten toward their tips.
    const spread = 0.045 * (1 - 0.6 * f.t[i]);
    f.nx[i] = gauss() * spread;
    f.ny[i] = gauss() * spread;
    // A soft cloud rather than the whole box, so the start has no edges.
    f.sx[i] = 0.5 + gauss() * 0.2;
    f.sy[i] = 0.4 + gauss() * 0.2;
    f.r[i] = 0.9 + rand() * 0.9;
  }
  const [c0, c1] = [rgb(from), rgb(to)];
  for (let k = 0; k < STEPS; k++) {
    const mix = c0.map((c, j) => Math.round(c + ((c1[j] - c) * k) / (STEPS - 1)));
    f.palette.push(`rgb(${mix.join(" ")} / ${ALPHA})`);
  }
  return f;
}

export type Field = ReturnType<typeof makeField>;

const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/**
 * Draws one frame on a context already scaled to CSS px. `grow` runs 0 → 1: each point leaves the scattered field
 * and takes its pseudotime colour as growth passes its pseudotime. `pointer` is in canvas CSS px, or null.
 * Returns true while points are still drifting toward or back from the pointer.
 */
export function drawField(ctx: CanvasRenderingContext2D, f: Field, w: number, h: number, grow: number, pointer: { x: number; y: number } | null) {
  const side = Math.min(w, h);
  let moving = false;
  for (let i = 0; i < f.n; i++) {
    const s = smooth((grow * 1.4 - f.t[i]) / 0.4);
    const x = (f.sx[i] + (f.hx[i] - f.sx[i]) * s) * w + f.nx[i] * side * s;
    const y = (f.sy[i] + (f.hy[i] - f.sy[i]) * s) * h + f.ny[i] * side * s;
    let wantX = 0;
    let wantY = 0;
    if (pointer) {
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const d = Math.hypot(dx, dy);
      if (d > 0 && d < REACH) {
        const k = (PUSH * (1 - d / REACH) ** 2) / d;
        wantX = dx * k;
        wantY = dy * k;
      }
    }
    f.ox[i] += (wantX - f.ox[i]) * 0.08;
    f.oy[i] += (wantY - f.oy[i]) * 0.08;
    if (Math.abs(wantX - f.ox[i]) + Math.abs(wantY - f.oy[i]) > 0.05) moving = true;
    f.x[i] = x + f.ox[i];
    f.y[i] = y + f.oy[i];
    f.step[i] = Math.round(f.t[i] * s * (STEPS - 1));
  }
  ctx.clearRect(0, 0, w, h);
  for (let k = 0; k < STEPS; k++) {
    ctx.fillStyle = f.palette[k];
    ctx.beginPath();
    for (let i = 0; i < f.n; i++) {
      if (f.step[i] !== k) continue;
      ctx.moveTo(f.x[i] + f.r[i], f.y[i]);
      ctx.arc(f.x[i], f.y[i], f.r[i], 0, TAU);
    }
    ctx.fill();
  }
  return moving;
}
