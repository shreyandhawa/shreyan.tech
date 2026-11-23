"use client";

import { useEffect, useRef } from "react";

/** A muted looping clip that plays only while on screen. With reduced motion, or before scripts run, the poster stays. */
export function Clip({ src, poster, label, width, height }: { src: string; poster: string; label: string; width: number; height: number }) {
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

  return (
    <video
      ref={video}
      src={src}
      poster={poster}
      width={width}
      height={height}
      muted
      loop
      playsInline
      preload="none"
      role="img"
      aria-label={label}
      className="h-auto w-full"
    />
  );
}
