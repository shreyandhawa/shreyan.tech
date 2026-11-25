"use client";

import { useEffect, useRef } from "react";

/**
 * A muted looping clip over its poster still (MediaFrame), playing only while on screen.
 * It has no poster of its own and shows nothing until it plays, so with reduced motion, or before scripts run, the still shows.
 */
export function Clip({ src, width, height }: { src: string; width: number; height: number }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // aria-hidden: the still underneath carries the alt text.
  return (
    <video
      ref={video}
      src={src}
      width={width}
      height={height}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      className="relative h-auto w-full"
    />
  );
}
