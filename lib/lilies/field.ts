// Side-view lily field for the lily scene. Proportions from a 1440×900 reference (Appendix B):
// far heads around y 650 in the centre, mid around 745, front around 842; denser and taller toward
// the left and right edges so the centre stays clear for the character.

import { seeded } from "./geometry";
import type { Flower, LayerName } from "./paint";

export type Field = { far: Flower[]; mid: Flower[]; front: Flower[] };

type Band = { layer: keyof Field; per1440: number; y: number; lift: number; r: [number, number] };

const BANDS: Band[] = [
  { layer: "far", per1440: 30, y: 650, lift: 120, r: [16, 28] },
  { layer: "mid", per1440: 24, y: 745, lift: 110, r: [30, 46] },
  { layer: "front", per1440: 14, y: 842, lift: 90, r: [56, 82] },
];

export function field(W: number, H: number, seed = 1): Field {
  const rand = seeded(seed);
  const sy = H / 900;
  // Head size follows the smaller axis, but never so small the flowers turn to specks on a phone.
  const s = Math.max(0.5, Math.min(W / 1440, sy));
  const between = (a: number, b: number) => a + rand() * (b - a);
  const flower = (layer: LayerName, x: number, y: number, R: number, blur?: number): Flower => ({
    layer,
    x,
    y,
    R,
    seed: Math.floor(rand() * 2 ** 31),
    open: 1,
    stem: { x: x + between(-0.15, 0.15) * R, y: H + 20, bend: between(-0.3, 0.3) * R },
    blur,
  });

  const out: Field = { far: [], mid: [], front: [] };
  for (const band of BANDS) {
    const n = Math.max(4, Math.round((band.per1440 * W) / 1440));
    for (let i = 0; i < n; i++) {
      // Even spacing with jitter, then pushed outward: |v|^0.7 packs more flowers near the edges.
      const v = ((i + 0.5 + between(-0.4, 0.4)) / n) * 2 - 1;
      const e = Math.pow(Math.abs(v), 0.7);
      const x = W / 2 + Math.sign(v) * e * (W / 2 + 40);
      const y = (band.y - band.lift * e * e + between(-14, 14)) * sy;
      out[band.layer].push(flower(band.layer, x, y, between(...band.r) * s));
    }
  }

  // Two tall hero flowers at the far left and right.
  out.front.push(flower("front", W * 0.07, 620 * sy, 100 * s), flower("front", W * 0.93, 600 * sy, 100 * s));
  // A few large out-of-focus heads along the bottom edge.
  for (const fx of [0.18, 0.5, 0.82]) {
    out.front.push(flower("front", W * (fx + between(-0.05, 0.05)), H + 30 * s, between(110, 140) * s, 8));
  }

  // Within a layer, higher heads are further back: draw them first.
  for (const list of Object.values(out)) list.sort((a: Flower, b: Flower) => a.y - b.y);
  return out;
}
