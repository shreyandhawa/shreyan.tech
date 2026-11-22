// Poses are data: each finger and the thumb is a polyline in the left hand's own coordinates.
// New art only needs new paths and pivot points; the right hand mirrors the left.

import type { FingerName } from "@/content/lily";
import { restFinger, type Point } from "./geometry";

export type HandPose = { fingers: Record<FingerName, Point[]>; thumb: Point[] };

export const REST: HandPose = {
  fingers: {
    index: restFinger("index"),
    middle: restFinger("middle"),
    ring: restFinger("ring"),
    little: restFinger("little"),
  },
  // Folded across the palm.
  thumb: [
    [36, 20],
    [-4, 8],
  ],
};
