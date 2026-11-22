import { describe, expect, it } from "vitest";
import { headBounds, ribbon, seeded, sideHead, topHead } from "./geometry";

describe("seeded", () => {
  it("is deterministic and stays in [0, 1)", () => {
    const a = seeded(42);
    const b = seeded(42);
    const xs = Array.from({ length: 1000 }, () => a());
    expect(xs).toEqual(Array.from({ length: 1000 }, () => b()));
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThan(1);
  });
});

describe("ribbon", () => {
  const petal = ribbon(0, 0, -Math.PI / 2, 100, 10, 2, 1, 8, seeded(1));

  it("has steps + 1 points per side, closing to a point at the tip", () => {
    expect(petal.outline).toHaveLength(18);
    const [tipLeft, tipRight] = [petal.outline[8], petal.outline[9]];
    expect(tipLeft[0]).toBeCloseTo(tipRight[0], 6);
    expect(tipLeft[1]).toBeCloseTo(tipRight[1], 6);
  });

  it("keeps the middle 60% of the spine as the mid-rib", () => {
    expect(petal.midrib).toHaveLength(Math.round(8 * 0.8) - Math.round(8 * 0.2) + 1);
  });

  it("starts heading in the given direction", () => {
    const [, y1] = petal.midrib[0];
    expect(y1).toBeLessThan(0); // -90° is up
  });

  it("is never wider than maxHalfWidth", () => {
    const n = petal.outline.length / 2;
    for (let k = 0; k < n; k++) {
      const [lx, ly] = petal.outline[k];
      const [rx, ry] = petal.outline[petal.outline.length - 1 - k];
      expect(Math.hypot(lx - rx, ly - ry) / 2).toBeLessThanOrEqual(10 + 1e-9);
    }
  });
});

describe("sideHead", () => {
  it("makes florets × petals and florets × stamens, the same for the same seed", () => {
    const a = sideHead(0, 0, 70, seeded(7), { florets: 7, petalsPerFloret: 5, stamensPerFloret: 5 });
    expect(a.petals).toHaveLength(35);
    expect(a.stamens).toHaveLength(35);
    expect(sideHead(0, 0, 70, seeded(7))).toEqual(a);
    expect(sideHead(0, 0, 70, seeded(8))).not.toEqual(a);
  });

  it("sweeps most stamens upward and lets them reach past the petals", () => {
    const R = 70;
    const head = sideHead(0, 0, R, seeded(3));
    // The reference lets a few on the two side florets (18° and -198°) droop.
    const up = head.stamens.filter((s) => s.to[1] < s.from[1]).length;
    expect(up / head.stamens.length).toBeGreaterThan(0.8);
    const tallest = Math.min(...head.stamens.map((s) => s.to[1]));
    expect(tallest).toBeLessThan(-R);
  });

  it("closes to a small bud, and keeps its shape at any open value", () => {
    // open scales petal length and curl, not width, so a bud is a rosette about R/2 across
    const closed = sideHead(10, 20, 70, seeded(5), { open: 0 });
    const b = headBounds(closed);
    expect(b.w).toBeLessThan(70 * 0.5);
    expect(b.h).toBeLessThan(70 * 0.5);
    // open only scales: the same seed consumes the same random numbers
    const half = sideHead(10, 20, 70, seeded(5), { open: 0.5 });
    const full = sideHead(10, 20, 70, seeded(5), { open: 1 });
    expect(half.petals).toHaveLength(full.petals.length);
    expect(headBounds(half).w).toBeLessThan(headBounds(full).w);
  });
});

describe("topHead", () => {
  it("spreads florets all the way around the centre", () => {
    const head = topHead(0, 0, 30, seeded(11));
    expect(head.petals).toHaveLength(24);
    const b = headBounds(head);
    // roughly centred on the origin in both axes
    expect(Math.abs(b.x + b.w / 2)).toBeLessThan(b.w * 0.25);
    expect(Math.abs(b.y + b.h / 2)).toBeLessThan(b.h * 0.25);
  });
});
