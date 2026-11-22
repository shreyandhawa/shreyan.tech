// Performance rules for the lily effects: halve flower counts on small machines, and if the first frames of an
// animation run under 40fps, drop the far layer and the blur for the rest of the visit.

export const perf = { slow: false };

/** 0.5 on machines with four or fewer cores, else 1. */
export const density = () => (typeof navigator !== "undefined" && navigator.hardwareConcurrency <= 4 ? 0.5 : 1);

/**
 * Feed it each frame's timestamp (ms). After `warmup` frames (bitmaps bake then) it averages the next `samples`
 * frame times; over 25ms (under 40fps) it sets perf.slow.
 */
export function frameMeter(samples = 30, warmup = 5) {
  let last = 0;
  let seen = 0;
  let total = 0;
  return (ms: number) => {
    if (seen >= warmup + samples) return;
    if (last && seen >= warmup) total += ms - last;
    last = ms;
    seen++;
    if (seen === warmup + samples && total / (samples - 1) > 25) perf.slow = true;
  };
}
