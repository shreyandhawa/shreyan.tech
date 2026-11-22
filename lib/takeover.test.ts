import { describe, expect, it } from "vitest";
import { COVERED, coverOpacity, flowerState, frontEdge, planTakeover, redness } from "./takeover";

const W = 1440;
const H = 900;
const origin: [number, number] = [W - 52, 52]; // the lily button, top right
const plan = planTakeover(W, H, origin);

describe("takeover plan", () => {
  it("fills the viewport with flowers, opening nearest the button first, all open by 0.7s", () => {
    expect(plan.flowers.length).toBeGreaterThan(60);
    const sorted = [...plan.flowers].sort((a, b) => a.dist - b.dist);
    for (let i = 1; i < sorted.length; i++) expect(sorted[i].start).toBeGreaterThanOrEqual(sorted[i - 1].start);
    for (const f of plan.flowers) expect(flowerState(f, 0.7).open).toBe(1);
  });

  it("opens one flower on the button at t = 0, drawn last", () => {
    const last = plan.flowers[plan.flowers.length - 1];
    expect([last.x, last.y]).toEqual(origin);
    expect(last.start).toBe(0);
    expect(flowerState(last, 0.12).open).toBeGreaterThan(0.5);
  });

  it("scales with density", () => {
    expect(planTakeover(W, H, origin, 0.5).flowers.length).toBeLessThan(plan.flowers.length * 0.65);
  });
});

describe("the front", () => {
  it("has not started at 0.4s and covers every corner by 1.3s", () => {
    expect(frontEdge(plan, 0, 0.4)).toBe(0);
    for (const [x, y] of [[0, 0], [W, 0], [0, H], [W, H], [0, H / 2], [W / 2, H]]) {
      const angle = Math.atan2(y - origin[1], x - origin[0]);
      expect(frontEdge(plan, angle, COVERED)).toBeGreaterThan(Math.hypot(x - origin[0], y - origin[1]));
    }
  });

  it("is irregular: its radius varies with direction", () => {
    const radii = Array.from({ length: 36 }, (_, i) => frontEdge(plan, (i / 36) * Math.PI * 2, 0.9));
    expect(Math.max(...radii) / Math.min(...radii)).toBeGreaterThan(1.15);
  });

  it("turns flowers red as it passes, near ones first, all red when it covers", () => {
    const near = plan.flowers.reduce((a, b) => (a.dist < b.dist ? a : b));
    const far = plan.flowers.reduce((a, b) => (a.dist > b.dist ? a : b));
    expect(redness(plan, near, 0.7)).toBeGreaterThan(redness(plan, far, 0.7));
    expect(redness(plan, far, COVERED)).toBe(1);
  });

  it("lifts the cover between 1.3s and 1.6s", () => {
    expect(coverOpacity(1.2)).toBe(1);
    expect(coverOpacity(1.45)).toBeCloseTo(0.5, 5);
    expect(coverOpacity(1.6)).toBe(0);
  });
});
