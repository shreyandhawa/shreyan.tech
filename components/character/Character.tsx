"use client";

// Placeholder character (build prompt, Appendix C): line art in --ink at 2px on --surface fills, closed eyes,
// dark hair. Head, torso, each upper arm, forearm, palm, finger and thumb are separate named groups, so final
// art can replace the paths and keep the same structure. Swap point: this file plus geometry.ts and poses.ts.

import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import { fingers, type FingerId, type FingerName, type Hand } from "@/content/lily";
import { FINGER_WIDTH, LEFT_HAND, SCENE, toScene, type Point } from "./geometry";
import { contact, FINGER_ORDER, flatten, REST, touchPose, unflatten, type HandPose } from "./poses";

type Props = {
  selected: FingerId | null;
  lit: FingerId | null;
  onSelect: (id: FingerId) => void;
  onLight: (id: FingerId | null) => void;
  viewBox?: string;
  className?: string;
};

const LINE = 2;
const HAIR = "#26222a";
const HANDS: Hand[] = ["left", "right"];
const poly = (pts: Point[]) => `M${pts.map((p) => p.join(" ")).join("L")}`;
// Colour lands as the thumb arrives (280ms); instant with reduced motion.
const ARRIVE = "transition-[stroke] duration-[160ms] ease-out delay-[280ms] motion-reduce:delay-0";

/** A band with a 2px outline: the outline stroke, then a narrower fill stroke on top. */
function Band({
  points,
  width,
  fill = "stroke-surface",
  outline = "stroke-ink",
  pose,
  className = "",
}: {
  points: Point[];
  width: number;
  fill?: string;
  outline?: string;
  pose?: string;
  className?: string;
}) {
  const d = poly(points);
  return (
    <>
      <path d={d} data-pose={pose} fill="none" strokeWidth={width + LINE * 2} strokeLinecap="round" strokeLinejoin="round" className={`${outline} ${className}`} />
      <path d={d} data-pose={pose} fill="none" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" className={`${fill} ${className}`} />
    </>
  );
}

function HandGroup({ hand, selected, lit, onSelect, onLight }: { hand: Hand } & Omit<Props, "viewBox" | "className">) {
  const ids = Object.fromEntries(fingers.filter((f) => f.hand === hand).map((f) => [f.finger, f.id])) as Record<FingerName, FingerId>;
  const inner = (
    // Paths render the rest pose; the pose animation in Character writes their `d` from then on.
    <g transform={`translate(${LEFT_HAND.x} ${LEFT_HAND.y}) rotate(${LEFT_HAND.rotate})`}>
      {FINGER_ORDER.map((name) => {
        const id = ids[name];
        const points = REST.fingers[name];
        const on = selected === id;
        return (
          <g
            key={name}
            id={`finger-${id}`}
            data-cursor-ring
            onPointerEnter={() => onLight(id)}
            onPointerLeave={() => onLight(null)}
            onClick={() => onSelect(id)}
          >
            <Band
              points={points}
              width={FINGER_WIDTH}
              pose={`${hand}-${name}`}
              fill={on ? "stroke-scarlet" : "stroke-surface"}
              outline={on || lit === id ? "stroke-scarlet" : "stroke-ink"}
              className={on ? ARRIVE : "transition-[stroke] duration-[120ms]"}
            />
            {/* Transparent hit area, 44px across. */}
            <path d={poly(points)} data-pose={`${hand}-${name}`} fill="none" stroke="transparent" strokeWidth={44} strokeLinecap="round" pointerEvents="stroke" />
          </g>
        );
      })}
      <g id={`palm-${hand}`}>
        <rect x={-40} y={-36} width={80} height={76} rx={16} fill="var(--surface)" stroke="var(--ink)" strokeWidth={LINE} />
      </g>
      <g id={`thumb-${hand}`}>
        <Band points={REST.thumb} width={FINGER_WIDTH} pose={`${hand}-thumb`} />
      </g>
      {/* Pulses once where thumb and fingertip meet. */}
      <circle data-ring={hand} r={0} fill="none" strokeWidth={1.5} className="stroke-scarlet" opacity={0} pointerEvents="none" />
    </g>
  );
  // The right hand is the left hand mirrored about x 720.
  return <g id={`hand-${hand}`}>{hand === "left" ? inner : <g transform={`matrix(-1 0 0 1 ${SCENE.w} 0)`}>{inner}</g>}</g>;
}

function writePose(root: SVGSVGElement, hand: Hand, pose: HandPose) {
  for (const name of FINGER_ORDER) {
    const d = poly(pose.fingers[name]);
    root.querySelectorAll(`[data-pose="${hand}-${name}"]`).forEach((p) => p.setAttribute("d", d));
  }
  const d = poly(pose.thumb);
  root.querySelectorAll(`[data-pose="${hand}-thumb"]`).forEach((p) => p.setAttribute("d", d));
}

export function Character({ viewBox = `0 0 ${SCENE.w} ${SCENE.h}`, className, ...rest }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const current = useRef<Record<Hand, number[]>>({ left: flatten(REST), right: flatten(REST) });
  const first = useRef(true);

  // Selecting a finger: it curls and the thumb travels to meet its tip (280ms, ease-out), then a ring pulses at
  // the contact point. Switching fingers tweens from wherever the thumb is. First render and reduced motion snap.
  useLayoutEffect(() => {
    const root = svg.current!;
    const sel = fingers.find((f) => f.id === rest.selected);
    const snap = first.current || matchMedia("(prefers-reduced-motion: reduce)").matches;
    first.current = false;
    const anims: gsap.core.Animation[] = [];

    for (const hand of HANDS) {
      const target = flatten(sel?.hand === hand ? touchPose(sel.finger) : REST);
      const values = current.current[hand];
      const write = () => writePose(root, hand, unflatten(values));
      if (snap) {
        values.splice(0, values.length, ...target);
        write();
      } else {
        anims.push(gsap.to(values, { endArray: target, duration: 0.28, ease: "power2.out", onUpdate: write }));
      }
    }

    if (sel && !snap) {
      const ring = root.querySelector<SVGCircleElement>(`[data-ring="${sel.hand}"]`)!;
      const [cx, cy] = contact(sel.finger);
      anims.push(
        // immediateRender off: the ring stays hidden until the thumb arrives.
        gsap.fromTo(
          ring,
          { attr: { cx, cy, r: 5 }, opacity: 0.9 },
          { attr: { r: 24 }, opacity: 0, duration: 0.5, ease: "power1.out", delay: 0.28, immediateRender: false },
        ),
      );
    }
    // A newer selection takes over from wherever these got to.
    return () => anims.forEach((a) => a.kill());
  }, [rest.selected]);

  const wrist = (hand: Hand) => toScene(hand, [0, 40]);
  return (
    <svg ref={svg} id="character" viewBox={viewBox} aria-hidden="true" className={className}>
      <g id="torso">
        <rect x={700} y={300} width={40} height={60} fill="var(--surface)" stroke="var(--ink)" strokeWidth={LINE} />
        <path
          d="M548 920V432Q548 404 576 396L700 352Q720 366 740 352L864 396Q892 404 892 432V920Z"
          fill="var(--surface)"
          stroke="var(--ink)"
          strokeWidth={LINE}
        />
      </g>
      <g id="head" style={{ transformOrigin: "720px 320px" }}>
        <ellipse cx={720} cy={250} rx={58} ry={70} fill="var(--surface)" stroke="var(--ink)" strokeWidth={LINE} />
        <path d="M662 246Q660 178 720 178Q780 178 778 246Q752 222 720 222Q688 222 662 246Z" fill={HAIR} stroke="var(--ink)" strokeWidth={LINE} />
        <path d="M688 262Q698 270 708 262M732 262Q742 270 752 262M711 290Q720 297 729 290" fill="none" stroke="var(--ink)" strokeWidth={LINE} strokeLinecap="round" />
      </g>
      <g id="upper-arm-left">
        <Band points={[[575, 425], [590, 680]]} width={52} />
      </g>
      <g id="upper-arm-right">
        <Band points={[[865, 425], [850, 680]]} width={52} />
      </g>
      {/* Forearms cross in front of the chest, each to the opposite wrist. */}
      <g id="forearm-right">
        <Band points={[[850, 680], wrist("left")]} width={54} />
      </g>
      <g id="forearm-left">
        <Band points={[[590, 680], wrist("right")]} width={54} />
      </g>
      {HANDS.map((hand) => (
        <HandGroup key={hand} hand={hand} {...rest} />
      ))}
    </svg>
  );
}
