"use client";

import { addTransitionType, startTransition, useCallback, useRef, useState, ViewTransition } from "react";
import type { Media } from "@/content/projects";

/**
 * A figure's picture as a button that opens the full-size still in a modal <dialog>.
 * The picture morphs into the lightbox and back through a shared ViewTransition name; under reduced motion it is a plain fade (globals.css).
 */
export function Lightbox({ media, children }: { media: Media; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const touchY = useRef(NaN);
  // From the file path, so names stay unique across pages (a useId could pair two projects' figures on a route change).
  const name = `zoom${media.src.replace(/\W/g, "-")}`;
  const toggle = (next: boolean) =>
    startTransition(() => {
      addTransitionType("zoom");
      setOpen(next);
    });
  // Runs inside the transition, so the dialog is in the top layer before the new snapshot. On close it leaves the top layer first, so the figure can take focus back.
  const modal = useCallback((dialog: HTMLDialogElement) => {
    dialog.showModal();
    return () => {
      dialog.close();
      button.current?.focus();
    };
  }, []);
  const morph = (child: React.ReactNode) => (
    <ViewTransition name={name} share="morph" default="none">
      {child}
    </ViewTransition>
  );

  return (
    <>
      <button ref={button} type="button" aria-label={`Enlarge: ${media.alt}`} data-cursor="Zoom" onClick={() => toggle(true)} className="block w-full">
        {/* While open, an invisible copy keeps the figure's place in the page. */}
        {open ? <span className="invisible block">{children}</span> : morph(<span className="block">{children}</span>)}
      </button>
      {open && (
        <dialog
          ref={modal}
          aria-label={media.alt}
          data-cursor-system // the custom cursor sits below the top layer
          onCancel={(e) => {
            e.preventDefault(); // Esc closes through the transition, so the picture morphs back
            toggle(false);
          }}
          // A native close the cancel above couldn't stop. Skip one already undone (StrictMode re-runs the ref: open, close, open).
          onClose={(e) => !e.currentTarget.open && toggle(false)}
          onClick={() => toggle(false)}
          onTouchStart={(e) => (touchY.current = e.touches.length === 1 ? e.touches[0].clientY : NaN)}
          onTouchEnd={(e) => e.changedTouches[0].clientY - touchY.current > 60 && toggle(false)}
          className="fixed inset-0 size-full max-h-none max-w-none touch-pinch-zoom place-items-center bg-transparent p-4 open:grid backdrop:bg-bg/95 md:p-8"
        >
          {morph(
            <picture>
              <source srcSet={`${media.src}.avif`} type="image/avif" />
              <img
                src={`${media.src}.webp`}
                alt={media.alt}
                width={media.width}
                height={media.height}
                className="h-auto max-h-[calc(100dvh-2rem)] w-auto max-w-full md:max-h-[calc(100dvh-4rem)]"
              />
            </picture>,
          )}
        </dialog>
      )}
    </>
  );
}
