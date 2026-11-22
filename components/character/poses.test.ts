import { describe, expect, it } from "vitest";
import { FINGER_WIDTH, restFinger } from "./geometry";
import { contact, FINGER_ORDER, flatten, REST, touchPose, unflatten } from "./poses";

const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);

describe("poses", () => {
  it("rests each finger straight, ending at its Appendix C tip", () => {
    for (const name of FINGER_ORDER) {
      const [base, joint, tip] = REST.fingers[name];
      expect(tip).toEqual(restFinger(name)[1]);
      // the joint lies on the line from base to tip
      const cross = (joint[0] - base[0]) * (tip[1] - base[1]) - (joint[1] - base[1]) * (tip[0] - base[0]);
      expect(Math.abs(cross)).toBeLessThan(1e-9);
    }
  });

  it("uses Appendix C's index touch pose exactly", () => {
    const p = touchPose("index");
    expect(p.fingers.index.slice(1)).toEqual([
      [31, -64],
      [15, -50],
    ]);
    expect(p.thumb.slice(1)).toEqual([
      [33, -12],
      [17, -40],
    ]);
  });

  it.each(FINGER_ORDER)("touching %s: thumb meets the curled fingertip, the rest stay put", (name) => {
    const p = touchPose(name);
    const [, joint, tip] = p.fingers[name];
    const thumbTip = p.thumb[2];
    expect(dist(tip, thumbTip)).toBeLessThan(FINGER_WIDTH); // round ends overlap
    expect(tip[1]).toBeGreaterThan(joint[1]); // the tip folds back down
    expect(p.thumb[0]).toEqual(REST.thumb[0]); // thumb pivots from the same base
    for (const other of FINGER_ORDER.filter((n) => n !== name)) expect(p.fingers[other]).toEqual(REST.fingers[other]);
    const c = contact(name);
    expect(dist(c, tip)).toBeCloseTo(dist(c, thumbTip), 9);
  });

  it("round-trips through a flat array for tweening", () => {
    const p = touchPose("ring");
    expect(flatten(p)).toHaveLength(30);
    expect(unflatten(flatten(p))).toEqual(p);
  });
});
