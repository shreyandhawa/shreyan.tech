import { describe, expect, it } from "vitest";
import { fingers } from "@/content/lily";
import { FINGERS, leaderLine, restFinger, toScene, type Point } from "./geometry";

// Proper intersection of segments ab and cd (shared endpoints don't count).
function crosses([a, b]: Point[], [c, d]: Point[]) {
  const o = (p: Point, q: Point, r: Point) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
}
const segments = (line: Point[]) => line.slice(1).map((p, i) => [line[i], p]);

describe("hands", () => {
  it("mirrors the right hand about x 720", () => {
    const l = toScene("left", [12, -30]);
    const r = toScene("right", [12, -30]);
    expect(l[0] + r[0]).toBeCloseTo(1440, 9);
    expect(l[1]).toBeCloseTo(r[1], 9);
  });

  it("puts the left hand's centre at (608, 440)", () => {
    expect(toScene("left", [0, 0])).toEqual([608, 440]);
  });

  it("makes each resting finger its listed length, pointing up", () => {
    for (const name of Object.keys(FINGERS) as (keyof typeof FINGERS)[]) {
      const [base, tip] = restFinger(name);
      expect(Math.hypot(tip[0] - base[0], tip[1] - base[1])).toBeCloseTo(FINGERS[name].length, 9);
      expect(tip[1]).toBeLessThan(base[1]);
    }
  });
});

describe("leader lines", () => {
  const lines = fingers.map((f) => ({ f, line: leaderLine(f.hand, f.finger) }));

  it("rise from 15px past the fingertip to the label row, then run to the label column", () => {
    for (const { f, line } of lines) {
      const [start, bend, end] = line;
      expect(bend[1]).toBeLessThan(start[1]);
      expect(end[1]).toBe(bend[1]);
      expect(end[0]).toBe(f.hand === "left" ? 440 : 1000);
    }
  });

  it("never cross each other", () => {
    for (let i = 0; i < lines.length; i++)
      for (let j = i + 1; j < lines.length; j++)
        for (const a of segments(lines[i].line))
          for (const b of segments(lines[j].line)) expect(crosses(a, b), `${lines[i].f.id} × ${lines[j].f.id}`).toBe(false);
  });
});
