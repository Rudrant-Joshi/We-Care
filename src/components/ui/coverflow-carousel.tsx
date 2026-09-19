"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Eye, UserCheck } from "lucide-react";

import { cn } from "@/lib/utils";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
  badge?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  /** Degrees the first neighbour tilts. */
  rotate?: number;
  /** How far the first neighbour recedes, as a fraction of card width. */
  depth?: number;
  /** Viewer distance as a multiple of card width — smaller is a wider lens. */
  perspective?: number;
  /** Exponent on distance. Below 1 the rake eases off as cards travel out. */
  falloff?: number;
  /** Opacity lost per step from the centre. */
  fade?: number;
  /** Subtle depth blur applied to side cards (in px). */
  blur?: number;
  /** Any CSS length. Everything else is derived from it, so the rake scales. */
  cardWidth?: string;
  /** Space between cards, as a fraction of card width. */
  gap?: number;
  loop?: boolean;
  showCaption?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  /** Names the carousel for assistive tech. */
  label?: string;
  className?: string;
  cardClassName?: string;
  onSlideClick?: (slide: CoverflowSlide, index: number) => void;
  onSelect?: (index: number) => void;
}

export function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0,
  blur = 1.5,
  cardWidth = "clamp(148px, 22vw, 260px)",
  gap = 0.05,
  loop = true,
  showCaption = false,
  showPagination = false,
  showNavigation = false,
  label = "Cover carousel",
  className,
  cardClassName,
  onSlideClick,
  onSelect,
}: CoverflowCarouselProps) {
  const count = slides.length;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  /** Fractional card index at the centre. The single source of truth. */
  const posRef = React.useRef(0);
  /** Where the current settle is headed. Stepping off `pos` instead would
      swallow a keypress that lands mid-flight, before the round-off moves. */
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
  } | null>(null);
  const hasMovedRef = React.useRef(false);

  const [selected, setSelected] = React.useState(0);
  const selectedRef = React.useRef(selected);
  React.useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  /** Nearest whole card, folded back into 0..count-1. */
  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count],
  );

  // Paint straight to the DOM. Sixty state updates a second would re-render
  // every card for numbers React never needs to see.
  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      // Fold the distance into the shorter way round the ring. This is the
      // whole looping mechanism — no cloned nodes, no shuffling the DOM.
      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      // Both the tilt and the recession ease off as cards travel out —
      // doubling the distance adds only about half again as much of each.
      // A linear ramp folds the second card shut; this keeps it readable.
      const ramp = Math.pow(distance, falloff);
      // Capped short of edge-on so a far card never turns its back.
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

      card.style.transform =
        `translate3d(calc(-50% + ${offset * pitch}px), 0, ${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      // A card is teleported across the ring at exactly half a turn out, so it
      // has to be gone by then or the jump is visible.
      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = fade > 0 ? String(Math.max(0, 1 - fade * distance) * edge) : String(edge > 0.05 ? 1 : edge);
      card.style.zIndex = String(100 - Math.round(distance));

      // Subtle depth-of-field blur on side cards ("not too much blur little bit blur")
      const blurAmount = blur > 0 && distance >= 0.08 ? Math.min(distance * blur, blur * 1.5) : 0;
      card.style.filter = blurAmount > 0 ? `blur(${blurAmount.toFixed(1)}px)` : "none";
    });
  }, [blur, count, depth, fade, falloff, gap, loop, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      targetRef.current = target;
      let lastTime = performance.now();

      const step = (now: number) => {
        const remaining = targetRef.current - posRef.current;
        if (Math.abs(remaining) < 0.0008) {
          posRef.current = targetRef.current;
          paint();
          const finalIdx = indexAt(targetRef.current);
          if (finalIdx !== selectedRef.current) {
            selectedRef.current = finalIdx;
            setSelected(finalIdx);
            onSelect?.(finalIdx);
          }
          rafRef.current = null;
          return;
        }

        // Frame-rate independent smooth exponential ease-out:
        // Slower, visible, butter-smooth card transition (~550ms perceptible travel)
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        const decayRate = 5.0; // 5.0 gives ~550ms elegant glide
        const alpha = 1 - Math.exp(-decayRate * dt);

        posRef.current += remaining * alpha;
        paint();

        // Harmoniously update selected doctor as card glides past midpoint
        const currentIdx = indexAt(posRef.current);
        if (currentIdx !== selectedRef.current) {
          selectedRef.current = currentIdx;
          setSelected(currentIdx);
          onSelect?.(currentIdx);
        }

        rafRef.current = requestAnimationFrame(step);
      };

      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, onSelect, paint],
  );

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  const goTo = React.useCallback(
    (index: number) => {
      // Take the shorter way round rather than unwinding the whole ring.
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    hasMovedRef.current = false;
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    if (Math.abs(event.clientX - drag.x) > 6) {
      hasMovedRef.current = true;
    }

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    // Cards per second, for the throw.
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) {
      setSelected(index);
      onSelect?.(index);
    }
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    // Let a flick carry, but never more than two cards.
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
  };

  // Card width drives pitch, depth and perspective, so it is the only thing
  // worth measuring — and only when the box actually changes.
  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const active = slides[selected];

  return (
    <div
      className={cn("w-full", className)}
      style={{ ["--cf-card" as string]: cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(1);
            }
          }}
          // Vertical padding keeps the drop shadows clear of the overflow clip.
          className="cursor-grab overflow-hidden py-10 outline-none ring-ring focus-visible:ring-2 active:cursor-grabbing select-none"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            // Horizontal drag is ours; the page keeps vertical scrolling.
            touchAction: "pan-y",
          }}
        >
          <div
            className="relative select-none"
            style={{
              height: "var(--cf-card)",
              transformStyle: "preserve-3d",
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
                onClick={() => {
                  if (hasMovedRef.current) return;
                  if (index !== selected) {
                    goTo(index);
                  } else {
                    onSlideClick?.(slide, index);
                  }
                }}
                className={cn(
                  "absolute left-1/2 top-0 aspect-square overflow-hidden rounded-2xl bg-muted shadow-xl will-change-transform cursor-pointer border border-slate-200/60 transition-shadow hover:shadow-2xl",
                  cardClassName,
                )}
                style={{
                  width: "var(--cf-card)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.src}
                  alt={slide.alt}
                  draggable={false}
                  className="h-full w-full select-none object-cover object-[center_20%]"
                />
                {slide.badge && (
                  <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-mono font-bold uppercase tracking-wider text-white shadow-sm pointer-events-none">
                    {slide.badge}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {showNavigation && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => nudge(-1)}
              className="absolute left-1 sm:left-3 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-white/90 p-1.5 sm:p-2 text-slate-800 shadow-md backdrop-blur border border-slate-200/80 transition hover:bg-white hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="size-4 sm:size-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => nudge(1)}
              className="absolute right-1 sm:right-3 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-white/90 p-1.5 sm:p-2 text-slate-800 shadow-md backdrop-blur border border-slate-200/80 transition hover:bg-white hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="size-4 sm:size-5" />
            </button>
          </>
        )}
      </div>

      {showCaption && active?.title && (
        <div
          key={selected}
          className="mt-3 flex flex-col items-center px-6 duration-300 animate-in fade-in"
        >
          {/* Full Detail button placed just below the card and above the name of the Doctor */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (active.onAction) {
                active.onAction();
              } else {
                onSlideClick?.(active, selected);
              }
            }}
            className="mb-3 px-5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#135940] text-slate-800 hover:text-[#135940] text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer group/btn"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#135940]" />
            <span>Full Detail</span>
            <Eye className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-[#135940] transition-colors" />
          </button>

          <p className="text-[17px] sm:text-lg font-bold tracking-tight text-slate-900 text-center">
            {active.title}
          </p>
          {active.subtitle && (
            <p className="mt-1 text-[13px] sm:text-sm text-slate-600 text-center font-medium">
              {active.subtitle}
            </p>
          )}
          {active.meta && active.meta.length > 0 && (
            <dl className="mt-5 w-full max-w-[320px] text-[12.5px] rounded-xl bg-white/90 border border-slate-200/80 p-3.5 shadow-xs">
              {active.meta.map((row) => (
                <div key={row.label} className="flex justify-between py-[4px] border-b border-slate-100 last:border-b-0">
                  <dt className="text-slate-500 font-medium">{row.label}</dt>
                  <dd className="font-semibold text-slate-800">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {showPagination && (
        <div className="mt-6 flex items-center justify-center gap-1.5 flex-wrap max-w-sm mx-auto px-4">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selected}
              onClick={() => goTo(index)}
              className={cn(
                "h-2 rounded-full transition-all cursor-pointer",
                index === selected
                  ? "w-6 bg-[#135940] opacity-100"
                  : "w-2 bg-slate-300 hover:bg-slate-400 opacity-60",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
