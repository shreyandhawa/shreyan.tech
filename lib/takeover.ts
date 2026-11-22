// The takeover's timing and layout as plain functions of time t (seconds, 0 to 2); drawing lives in
// components/takeover. Reversing the takeover is just running t backwards.
//
//   0.00        the button dips; one white flower opens on it
//   0.10–0.70   white flowers open across the page, nearest the button first
//   0.40–1.30   a dark irregular front spreads from the button; flowers it reaches turn red from the centre out
//   1.30        the front covers the viewport: navigate here, under cover
//   1.00–1.60   the flowers close and fade; the cover lifts off the new page
//   1.30–2.00   the lily scene arrives (its own timeline, driven by the same clock)

import { seeded, type Point } from "./lilies/geometry";

export const DURATION = 2;
export const COVERED = 1.3;
export const FRONT_START = 0.4;
export const OPEN_TIME = 0.25;
export const CLOSE_START = 1.0;
export const CLOSE_TIME = 0.45;
export const LIFT_END = 1.6;

export type TakeoverFlower = { x: number; y: number; R: number; seed: number; start: number; close: number; dist: number; angle: number };
export type TakeoverPlan = { origin: Point; flowers: TakeoverFlower[]; reach: number; phases: [number, number, number] };

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);

/** Flowers on a jittered grid over the viewport, opening outward from the button; one flower on the button itself, drawn last. */
export function planTakeover(W: number, H: number, origin: Point, density = 1, seed = 11): TakeoverPlan {
  const rand = seeded(seed);
  const cell = 120 / Math.sqrt(density);
  const far = Math.max(...[[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => Math.hypot(x - origin[0], y - origin[1])));
  const at = (x: number, y: number, R: number, start: number): TakeoverFlower => ({
    x,
    y,
    R,
    seed: Math.floor(rand() * 2 ** 31),
    start,
    close: CLOSE_START + rand() * 0.15,
    dist: Math.hypot(x - origin[0], y - origin[1]),
    angle: Math.atan2(y - origin[1], x - origin[0]),
  });
  const flowers: TakeoverFlower[] = [];
  for (let gy = 0; gy * cell < H + cell / 2; gy++) {
    for (let gx = 0; gx * cell < W + cell / 2; gx++) {
      const x = (gx + 0.15 + rand() * 0.7) * cell;
      const y = (gy + 0.15 + rand() * 0.7) * cell;
      const d = Math.hypot(x - origin[0], y - origin[1]);
      if (d < 40) continue; // the button's own flower sits here
      flowers.push(at(x, y, 12 + rand() * 20, 0.1 + 0.35 * (d / far)));
    }
  }
  flowers.push(at(origin[0], origin[1], 16, 0));
  // The edge wobbles by up to ±20%, so the base radius reaches past the farthest corner by that much.
  return { origin, flowers, reach: (far / 0.8) * 1.04, phases: [rand() * 6.28, rand() * 6.28, rand() * 6.28] };
}

/** Front radius in a given direction at time t: an irregular, slowly shifting edge. 0 before it starts. */
export function frontEdge(plan: TakeoverPlan, angle: number, t: number): number {
  if (t <= FRONT_START) return 0;
  const p = clamp01((t - FRONT_START) / (COVERED - FRONT_START));
  const [a, b, c] = plan.phases;
  const wobble = 1 + 0.1 * Math.sin(3 * angle + a + 0.8 * t) + 0.06 * Math.sin(5 * angle + b - 1.1 * t) + 0.04 * Math.sin(9 * angle + c + 1.7 * t);
  return plan.reach * Math.pow(p, 1.25) * wobble;
}

/** How open a flower is at t (0 to 1), and how far it has closed and faded after CLOSE_START. */
export function flowerState(f: TakeoverFlower, t: number) {
  return {
    open: easeOut(clamp01((t - f.start) / OPEN_TIME)),
    closed: clamp01((t - f.close) / CLOSE_TIME),
  };
}

/** How red a flower is (0 to 1): it turns from the centre outward as the front passes over it. */
export function redness(plan: TakeoverPlan, f: TakeoverFlower, t: number): number {
  return clamp01((frontEdge(plan, f.angle, t) - f.dist) / (f.R * 2.5));
}

/** Opacity of the dark cover once it fills the screen: it lifts off the new page between COVERED and LIFT_END. */
export const coverOpacity = (t: number) => (t < COVERED ? 1 : 1 - clamp01((t - COVERED) / (LIFT_END - COVERED)));
