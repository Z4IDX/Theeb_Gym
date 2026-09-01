"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { FramedImageRatio } from "./framed-image";

const ratioClass: Record<FramedImageRatio, string> = {
  "4/5": "aspect-[4/5]",
  "3/2": "aspect-[3/2]",
  "1/1": "aspect-[1/1]",
};

export type GalleryItem = {
  src: string;
  alt: string;
  width: number;
  height: number;
  ratio?: FramedImageRatio;
  caption?: string;
};

export type GalleryProps = {
  items: GalleryItem[];
  closeLabel?: string;
  className?: string;
};

/**
 * A staggered grid of framed gym photos honouring mixed 4:5 / 3:2 crops.
 * Click-to-enlarge uses a plain <dialog> rather than a lightbox library:
 * <dialog> gives native Escape-to-close and we handle focus return manually.
 */
export function Gallery({ items, closeLabel = "Close", className = "" }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeIndex === null) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
  }, [activeIndex]);

  function openAt(index: number, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setActiveIndex(index);
  }

  function close() {
    setActiveIndex(null);
    triggerRef.current?.focus();
  }

  const active = activeIndex !== null ? items[activeIndex] : null;

  return (
    <div className={`columns-1 gap-5 sm:columns-2 lg:columns-3 ${className}`}>
      {items.map((item, index) => (
        <figure key={item.src} className="mb-5 w-full break-inside-avoid" style={{ maxWidth: item.width }}>
          <button
            type="button"
            onClick={(event) => openAt(index, event.currentTarget)}
            className="block w-full text-start"
            aria-haspopup="dialog"
          >
            <span className={`relative block overflow-hidden border border-ink-line p-2 ${ratioClass[item.ratio ?? "4/5"]}`}>
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </span>
          </button>
          {item.caption ? (
            <figcaption className="mt-3 border-t border-ink-line pt-3 text-xs text-bone-faint">{item.caption}</figcaption>
          ) : null}
        </figure>
      ))}

      <dialog
        ref={dialogRef}
        onClose={close}
        onCancel={close}
        className="max-h-[90vh] max-w-[90vw] border border-ink-line bg-ink-panel p-0 backdrop:bg-ink/90"
      >
        {active ? (
          <div className="flex flex-col gap-4 p-4">
            <div className="relative" style={{ maxWidth: active.width }}>
              <Image
                src={active.src}
                alt={active.alt}
                width={active.width}
                height={active.height}
                className="h-auto max-h-[75vh] w-auto object-contain"
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              {active.caption ? <p className="text-sm text-bone-dim">{active.caption}</p> : <span />}
              <button
                type="button"
                onClick={close}
                className="shrink-0 border border-ink-line px-3 py-1.5 text-xs font-semibold text-bone-dim transition-colors hover:border-bone/40 hover:text-bone"
              >
                {closeLabel}
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
