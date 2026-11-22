// Poses are data: each finger and the thumb is a three-point polyline (base, joint, tip) in the left hand's own
// coordinates. New art only needs new points; the right hand mirrors the left. Interpolating these numbers is
// the whole animation.

import type { FingerName } from "@/content/lily";
import { FINGERS, FINGER_BASE_Y, restFinger, type Point } from "./geometry";

export type HandPose = { fingers: Record<FingerName, Point[]>; thumb: Point[] };

export const FINGER_ORDER: FingerName[] = ["index", "middle", "ring", "little"];
const THUMB_BASE: Point = [36, 20];
const JOINT = 40; // the bend sits this far up each finger

/** A straight finger as three points, so it can bend at the middle one. */
function straight(name: FingerName): Point[] {
  const [base, tip] = restFinger(name);
  const a = (FINGERS[name].angle * Math.PI) / 180;
  return [base, [base[0] + JOINT * Math.sin(a), FINGER_BASE_Y - JOINT * Math.cos(a)], tip];
}

export const REST: HandPose = {
  fingers: { index: straight("index"), middle: straight("middle"), ring: straight("ring"), little: straight("little") },
  thumb: [THUMB_BASE, [16, 14], [-4, 8]], // folded across the palm
};

/**
 * Thumb-to-fingertip poses. Index is Appendix C's: the finger bends through (31, -64) to (15, -50) and the thumb
 * goes through (33, -12) to (17, -40). The others follow it: each finger bends at its joint and folds its tip down
 * towards the palm, and the thumb reaches across to meet it.
 */
const TOUCH: Record<FingerName, { joint: Point; tip: Point; knuckle: Point; thumbTip: Point }> = {
  index: { joint: [31, -64], tip: [15, -50], knuckle: [33, -12], thumbTip: [17, -40] },
  middle: { joint: [9, -64], tip: [2, -49], knuckle: [30, -10], thumbTip: [4, -39] },
  ring: { joint: [-12, -64], tip: [-12, -48], knuckle: [27, -6], thumbTip: [-10, -37] },
  little: { joint: [-34, -62], tip: [-25, -41], knuckle: [24, -2], thumbTip: [-22, -32] },
};

export function touchPose(name: FingerName): HandPose {
  const t = TOUCH[name];
  return {
    fingers: { ...REST.fingers, [name]: [REST.fingers[name][0], t.joint, t.tip] },
    thumb: [THUMB_BASE, t.knuckle, t.thumbTip],
  };
}

/** Where thumb and fingertip meet: the ring pulses here. */
export function contact(name: FingerName): Point {
  const { tip, thumbTip } = TOUCH[name];
  return [(tip[0] + thumbTip[0]) / 2, (tip[1] + thumbTip[1]) / 2];
}

/** Pose ↔ flat number array (index, middle, ring, little, thumb; 6 numbers each) for tweening. */
export const flatten = (p: HandPose) => [...FINGER_ORDER.map((n) => p.fingers[n]), p.thumb].flat(2);

export function unflatten(a: number[]): HandPose {
  const line = (i: number): Point[] => [0, 1, 2].map((j) => [a[i * 6 + j * 2], a[i * 6 + j * 2 + 1]]);
  return {
    fingers: { index: line(0), middle: line(1), ring: line(2), little: line(3) },
    thumb: line(4),
  };
}
