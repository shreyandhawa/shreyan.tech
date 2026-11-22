// Shared handle between the lily buttons, the lily scene and the takeover overlay (all client-side).
// The overlay registers what bloom/unbloom do; the scene registers its arrival timeline so the overlay's
// clock can drive it. bloom/unbloom return false when the overlay isn't ready; the link then navigates as usual.

import type gsap from "gsap";
import type { Point } from "@/lib/lilies/geometry";

type Handler = { forward: (origin: Point) => void; back: (origin: Point, to: string) => void };

let handler: Handler | null = null;
let scene: gsap.core.Timeline | null = null;
let arriving = false;

export function setTakeoverHandler(h: Handler | null) {
  handler = h;
}

/** Light side → lily side. */
export function bloom(origin: Point) {
  handler?.forward(origin);
  return !!handler;
}

/** Lily side → a light page (the one the visitor came from, or a case study). */
export function unbloom(origin: Point, to: string) {
  handler?.back(origin, to);
  return !!handler;
}

/** The lily scene's arrival timeline; returns an unregister function. */
export function registerScene(tl: gsap.core.Timeline) {
  scene = tl;
  return () => {
    if (scene === tl) scene = null;
  };
}
export const sceneTimeline = () => scene;

/** True while a forward takeover is handing over to the lily scene, so it starts hidden instead of fading in. */
export const isArriving = () => arriving;
export function setArriving(v: boolean) {
  arriving = v;
}

// Where to return from the lily side: the light page the visitor came from, if this session knows it.
const RETURN_KEY = "lily:return";
export function rememberReturn(path: string) {
  try {
    sessionStorage.setItem(RETURN_KEY, path);
  } catch {}
}
export function returnPath() {
  try {
    return sessionStorage.getItem(RETURN_KEY) || "/";
  } catch {
    return "/";
  }
}

/** Centre of an element, for the takeover's origin. */
export function centreOf(el: Element): Point {
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
}
