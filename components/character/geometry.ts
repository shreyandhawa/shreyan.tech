// Placeholder character geometry (build prompt, Appendix C). Scene is 1440×900, figure centred on x 720.
// Hands are described in the left hand's own coordinates (x right, y down); the right hand mirrors about x 720.

import type { FingerName, Hand } from "@/content/lily";

export type Point = [number, number];

const DEG = Math.PI / 180;

export const SCENE = { w: 1440, h: 900 };
export const LEFT_HAND = { x: 608, y: 440, rotate: -14 };
export const FINGER_WIDTH = 17;
export const FINGER_BASE_Y = -24;

/** From the inside (nearest the head) outward. Angle is from vertical, in degrees. */
export const FINGERS: Record<FingerName, { x: number; length: number; angle: number }> = {
  index: { x: 28, length: 78, angle: 10 },
  middle: { x: 9, length: 88, angle: 4 },
  ring: { x: -10, length: 82, angle: -3 },
  little: { x: -29, length: 62, angle: -12 },
};

/** Label rows (scene y) and where leader lines meet the label columns (scene x). */
export const ROWS: Record<FingerName, number> = { index: 174, middle: 232, ring: 290, little: 348 };
export const LABEL_X: Record<Hand, number> = { left: 440, right: 1000 };

/** Hand coordinates to scene coordinates. */
export function toScene(hand: Hand, [x, y]: Point): Point {
  const r = LEFT_HAND.rotate * DEG;
  const sx = LEFT_HAND.x + x * Math.cos(r) - y * Math.sin(r);
  const sy = LEFT_HAND.y + x * Math.sin(r) + y * Math.cos(r);
  return [hand === "left" ? sx : SCENE.w - sx, sy];
}

/** A straight finger at rest: base and tip, in hand coordinates. */
export function restFinger(name: FingerName): Point[] {
  const { x, length, angle } = FINGERS[name];
  return [
    [x, FINGER_BASE_Y],
    [x + length * Math.sin(angle * DEG), FINGER_BASE_Y - length * Math.cos(angle * DEG)],
  ];
}

/**
 * Leader line for a finger, in scene coordinates: starts 15px beyond the resting fingertip, follows the
 * finger's direction up to the label's row, then runs horizontally to the label column.
 */
export function leaderLine(hand: Hand, name: FingerName): Point[] {
  const [base, tip] = restFinger(name).map((p) => toScene(hand, p));
  const len = Math.hypot(tip[0] - base[0], tip[1] - base[1]);
  const dir: Point = [(tip[0] - base[0]) / len, (tip[1] - base[1]) / len];
  const start: Point = [tip[0] + dir[0] * 15, tip[1] + dir[1] * 15];
  const t = (ROWS[name] - start[1]) / dir[1];
  return [start, [start[0] + dir[0] * t, ROWS[name]], [LABEL_X[hand], ROWS[name]]];
}
