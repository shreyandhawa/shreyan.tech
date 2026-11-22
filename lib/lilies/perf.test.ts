import { beforeEach, describe, expect, it } from "vitest";
import { frameMeter, perf } from "./perf";

const run = (frameMs: number, frames = 40, firstFrameMs = 300) => {
  const meter = frameMeter();
  let t = 0;
  for (let i = 0; i < frames; i++) meter((t += i === 0 ? firstFrameMs : frameMs));
};

describe("frameMeter", () => {
  beforeEach(() => {
    perf.slow = false;
  });

  it("leaves 60fps alone, even with a slow first frame while bitmaps bake", () => {
    run(16.7);
    expect(perf.slow).toBe(false);
  });

  it("flags anything under 40fps", () => {
    run(30);
    expect(perf.slow).toBe(true);
  });

  it("decides once, after warm-up plus its samples", () => {
    run(30, 20); // not enough frames yet
    expect(perf.slow).toBe(false);
  });
});
