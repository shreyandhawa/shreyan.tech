"use client";

// Placeholder character (build prompt, Appendix C): line art in --ink at 2px on --surface fills, closed eyes,
// dark hair. Head, torso, each upper arm, forearm, palm, finger and thumb are separate named groups, so final
// art can replace the paths and keep the same structure. Swap point: this file plus geometry.ts and poses.ts.

import { fingers, type FingerId, type FingerName, type Hand } from "@/content/lily";
import { FINGER_WIDTH, LEFT_HAND, SCENE, toScene, type Point } from "./geometry";
import { REST, type HandPose } from "./poses";

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
const poly = (pts: Point[]) => `M${pts.map((p) => p.join(" ")).join("L")}`;

/** A band with a 2px outline: the outline stroke, then a narrower fill stroke on top. */
function Band({ points, width, fill = "var(--surface)", outline = "var(--ink)" }: { points: Point[]; width: number; fill?: string; outline?: string }) {
  const d = poly(points);
  return (
    <>
      <path d={d} fill="none" stroke={outline} strokeWidth={width + LINE * 2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={fill} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function HandGroup({ hand, pose, selected, lit, onSelect, onLight }: { hand: Hand; pose: HandPose } & Omit<Props, "viewBox" | "className">) {
  const ids = Object.fromEntries(fingers.filter((f) => f.hand === hand).map((f) => [f.finger, f.id])) as Record<FingerName, FingerId>;
  const inner = (
    <g transform={`translate(${LEFT_HAND.x} ${LEFT_HAND.y}) rotate(${LEFT_HAND.rotate})`}>
      {(Object.keys(pose.fingers) as FingerName[]).map((name) => {
        const id = ids[name];
        const points = pose.fingers[name];
        const isSelected = selected === id;
        return (
          <g
            key={name}
            id={`finger-${id}`}
            data-cursor-ring
            style={{ transformOrigin: `${points[0][0]}px ${points[0][1]}px` }}
            onPointerEnter={() => onLight(id)}
            onPointerLeave={() => onLight(null)}
            onClick={() => onSelect(id)}
          >
            <Band
              points={points}
              width={FINGER_WIDTH}
              fill={isSelected ? "var(--scarlet)" : "var(--surface)"}
              outline={isSelected || lit === id ? "var(--scarlet)" : "var(--ink)"}
            />
            {/* Transparent hit area, 44px across. */}
            <path d={poly(points)} fill="none" stroke="transparent" strokeWidth={44} strokeLinecap="round" pointerEvents="stroke" />
          </g>
        );
      })}
      <g id={`palm-${hand}`}>
        <rect x={-40} y={-36} width={80} height={76} rx={16} fill="var(--surface)" stroke="var(--ink)" strokeWidth={LINE} />
      </g>
      <g id={`thumb-${hand}`} style={{ transformOrigin: `${pose.thumb[0][0]}px ${pose.thumb[0][1]}px` }}>
        <Band points={pose.thumb} width={FINGER_WIDTH} />
      </g>
    </g>
  );
  // The right hand is the left hand mirrored about x 720.
  return <g id={`hand-${hand}`}>{hand === "left" ? inner : <g transform={`matrix(-1 0 0 1 ${SCENE.w} 0)`}>{inner}</g>}</g>;
}

export function Character({ viewBox = `0 0 ${SCENE.w} ${SCENE.h}`, className, ...rest }: Props) {
  const wrist = (hand: Hand) => toScene(hand, [0, 40]);
  return (
    <svg viewBox={viewBox} aria-hidden="true" className={className}>
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
      <HandGroup hand="left" pose={REST} {...rest} />
      <HandGroup hand="right" pose={REST} {...rest} />
    </svg>
  );
}
