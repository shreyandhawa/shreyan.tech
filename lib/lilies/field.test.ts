import { describe, expect, it } from "vitest";
import { drift, field, petals } from "./field";

describe("field", () => {
  const f = field(1440, 900);

  it("is the same for the same seed", () => {
    expect(field(1440, 900)).toEqual(f);
    expect(field(1440, 900, 2)).not.toEqual(f);
  });

  it("puts far behind mid behind front, around y 650 / 745 / 842 in the centre", () => {
    const centre = (list: typeof f.far) => list.filter((x) => Math.abs(x.x - 720) < 200 && x.y < 900);
    const avg = (list: typeof f.far) => list.reduce((s, x) => s + x.y, 0) / list.length;
    expect(avg(centre(f.far))).toBeGreaterThan(600);
    expect(avg(centre(f.far))).toBeLessThan(avg(centre(f.mid)));
    expect(avg(centre(f.mid))).toBeLessThan(avg(centre(f.front)));
  });

  it("is denser and taller toward the edges", () => {
    const edge = f.mid.filter((x) => Math.abs(x.x - 720) > 480);
    const centre = f.mid.filter((x) => Math.abs(x.x - 720) < 240);
    expect(edge.length).toBeGreaterThan(centre.length);
    const avgY = (l: typeof edge) => l.reduce((s, x) => s + x.y, 0) / l.length;
    expect(avgY(edge)).toBeLessThan(avgY(centre));
  });

  it("has a hero flower near each side edge and out-of-focus heads at the bottom", () => {
    const heroes = f.front.filter((x) => Math.abs(x.R - 100) < 1e-9);
    expect(heroes.map((h) => h.x < 720)).toEqual(expect.arrayContaining([true, false]));
    expect(f.front.filter((x) => x.blur && x.y > 900)).toHaveLength(3);
  });

  it("scales flower counts with the viewport width", () => {
    const narrow = field(720, 900);
    expect(narrow.mid.length).toBeLessThan(f.mid.length);
    expect(narrow.mid.length).toBeGreaterThan(0);
  });
});

describe("drift", () => {
  it("moves petals slowly and keeps them on screen", () => {
    const start = petals(1440, 900);
    const later = drift(start, 120, 1440, 900);
    expect(later).toHaveLength(start.length);
    for (const p of later) {
      expect(p.x).toBeGreaterThanOrEqual(-30);
      expect(p.x).toBeLessThanOrEqual(1440 + 30);
      expect(p.y).toBeGreaterThanOrEqual(-30);
      expect(p.y).toBeLessThanOrEqual(900 + 30);
    }
    const oneSecond = drift(start, 1, 1440, 900);
    oneSecond.forEach((p, i) => expect(Math.hypot(p.x - start[i].x, p.y - start[i].y)).toBeLessThan(30));
  });
});
