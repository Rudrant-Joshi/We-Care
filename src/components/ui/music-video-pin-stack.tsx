import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function getScrollParent(el: HTMLElement): HTMLElement | Window {
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    const style = window.getComputedStyle(node);
    const oy = style.overflowY;
    const canScroll =
      (oy === "auto" || oy === "scroll" || oy === "overlay") &&
      node.scrollHeight > node.clientHeight + 1;
    if (canScroll) {
      if (node === document.documentElement || node === document.body) {
        return window;
      }
      return node;
    }
    node = node.parentElement;
  }
  return window;
}

function isElementScrollRoot(
  root: HTMLElement | Window,
): root is HTMLElement {
  return typeof HTMLElement !== "undefined" && root instanceof HTMLElement;
}

function readScrollProgress(
  track: HTMLElement,
  scrollRoot: HTMLElement | Window,
): number {
  const useWindowScroll =
    !(scrollRoot instanceof HTMLElement) ||
    (typeof document !== "undefined" &&
      (scrollRoot === document.documentElement || scrollRoot === document.body));

  if (useWindowScroll) {
    const rect = track.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const scrollable = track.offsetHeight - vh;
    if (scrollable <= 0) return 1;
    return clamp01(-rect.top / scrollable);
  }

  const rootRect = scrollRoot.getBoundingClientRect();
  const trackRect = track.getBoundingClientRect();
  const scrollable = track.offsetHeight - scrollRoot.clientHeight;
  if (scrollable <= 0) return 1;
  return clamp01((rootRect.top - trackRect.top) / scrollable);
}

const FONT_LINK_ID = "music-video-pin-stack-fonts";
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans+JP:wght@400;500&display=swap";
const FONT_UI = '"Inter", "Noto Sans JP", "Helvetica Neue", Arial, sans-serif';

const COLOR_FIELD = "#f3eee6";
const COLOR_INK = "#5c574f";

export type MusicVideoPinStackItem = {
  id: string;
  title: string;
  label: string;
  released: string;
  imageSrc?: string;
  imageAlt?: string;
  youtubeUrl?: string;
  href?: string;
};

function youtubeVideoId(input?: string): string | null {
  const raw = input?.trim();
  if (!raw) return null;
  if (/^[\w-]{11}$/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
    }
  } catch {
    /* not a URL */
  }
  return null;
}

function youtubeThumbSrc(id: string, quality: "max" | "hq" = "max") {
  return quality === "max"
    ? `https://i.ytimg.com/vi/${id}/hq720.jpg`
    : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function resolveItemMedia(item: MusicVideoPinStackItem) {
  const id = youtubeVideoId(item.youtubeUrl ?? item.href);
  const href = item.href ?? item.youtubeUrl;
  const imageSrc =
    item.imageSrc ?? (id ? youtubeThumbSrc(id) : undefined);
  return { id, href, imageSrc };
}

export type MusicVideoPinStackProps = {
  heading?: string;
  items?: MusicVideoPinStackItem[];
  fieldColor?: string;
  inkColor?: string;
  forceProgress?: number;
  className?: string;
};

export const MUSIC_VIDEO_PIN_STACK_DEFAULT_ITEMS: MusicVideoPinStackItem[] = [
  {
    id: "robotic-surgery",
    title: "Precision Surgery",
    label: "Division: Surgical Sciences",
    released: "Robotic & Laparoscopic Care",
    imageAlt: "WeCare Hospital Advanced Surgical Suite",
    imageSrc: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=1600&q=85",
    href: "/departments",
  },
  {
    id: "emergency-trauma",
    title: "Emergency Trauma",
    label: "Division: 24/7 Acute Care",
    released: "Zero-Wait Emergency Triage",
    imageAlt: "WeCare Hospital Emergency and Acute Trauma Center",
    imageSrc: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1600&q=85",
    href: "/departments",
  },
  {
    id: "diagnostic-imaging",
    title: "Diagnostic Imaging",
    label: "Division: Radiology & Imaging",
    released: "High-Field 3T MRI & CT Scans",
    imageAlt: "WeCare Hospital Diagnostic CT and MRI Imaging Suite",
    imageSrc: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?auto=format&fit=crop&w=1600&q=85",
    href: "/departments",
  },
  {
    id: "cardiac-telemetry",
    title: "Cardiac Sciences",
    label: "Division: Heart & Vascular",
    released: "Advanced Telemetry Care",
    imageAlt: "WeCare Hospital Cardiac Care Specialist Reviewing Digital Telemetry",
    imageSrc: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=85",
    href: "/departments",
  },
];

function useMusicVideoFonts() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);
}

export function MusicVideoPinStack({
  heading = "CLINICAL CARE",
  items = MUSIC_VIDEO_PIN_STACK_DEFAULT_ITEMS,
  fieldColor = COLOR_FIELD,
  inkColor = COLOR_INK,
  forceProgress,
  className,
}: MusicVideoPinStackProps) {
  useMusicVideoFonts();
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const metaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchMovedRef = useRef(false);
  const pinned = forceProgress != null;
  const count = items.length;

  useEffect(() => {
    const root = rootRef.current;
    const runway = runwayRef.current;
    const stage = stageRef.current;
    const list = listRef.current;
    if (!root || !stage || !list || count === 0) return;

    const cards = Array.from(
      list.querySelectorAll<HTMLElement>("[data-mv-item]"),
    );
    const overlays = cards.map((card) =>
      card.querySelector<HTMLElement>("[data-mv-overlay]"),
    );
    if (cards.length !== count) return;

    let activeIndex = -1;

    const setActive = (index: number) => {
      if (index === activeIndex) return;
      activeIndex = index;
      setActiveIdx(index);

      titleRefs.current.forEach((el, i) => {
        if (!el) return;
        const on = i === index;
        el.toggleAttribute("data-active", on);
        el.style.opacity = on ? "1" : "0";
      });
      metaRefs.current.forEach((el, i) => {
        if (!el) return;
        const on = i === index;
        el.toggleAttribute("data-active", on);
        el.style.opacity = on ? "1" : "0";
      });
    };

    const cardLocal = (p: number, i: number) => {
      if (i === 0 || count <= 1) return 1;
      const incoming = count - 1;
      const start = (i - 1) / incoming;
      const end = i / incoming;
      return clamp01((p - start) / Math.max(0.0001, end - start));
    };

    const applyProgress = (raw: number) => {
      const p = clamp01(raw);

      cards.forEach((card, i) => {
        const local = cardLocal(p, i);
        const y = (1 - local) * 100;
        const scale = 0.6 + local * 0.4;
        const inset = (1 - local) * 10;

        gsap.set(card, {
          y: `${y}vh`,
          scale,
          clipPath: `inset(${inset}% ${inset}% ${inset}% ${inset}% round 22px)`,
          zIndex: i + 1,
          force3D: true,
        });

        const overlay = overlays[i];
        if (overlay) {
          let overlayOpacity = 0;
          if (i < count - 1) {
            const nextLocal = cardLocal(p, i + 1);
            overlayOpacity = nextLocal * 0.75;
          }
          gsap.set(overlay, { opacity: overlayOpacity });
        }
      });

      let nextActive = 0;
      for (let i = 0; i < count; i++) {
        if (cardLocal(p, i) >= 0.55) nextActive = i;
      }
      setActive(nextActive);

      cards.forEach((card, i) => {
        const op = Number.parseFloat(overlays[i]?.style.opacity || "0");
        card.toggleAttribute("data-prev", op > 0.05);
      });
    };

    if (pinned) {
      applyProgress(forceProgress);
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      applyProgress(1);
      return;
    }

    if (!runway) return;

    const scrollRoot = getScrollParent(runway);

    const viewportHeight = () => {
      if (isElementScrollRoot(scrollRoot)) {
        const h = scrollRoot.clientHeight;
        if (h > 0) return h;
      }
      return window.innerHeight;
    };

    const sizeLayout = () => {
      const vh = viewportHeight();
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      // On mobile view, calibrated multiplier prevents scroll fatigue and lets cards smoothly advance per swipe
      const heightMultiplier = isMobile
        ? Math.max(count * 0.75 + 0.35, 2.2)
        : count + 1;
      stage.style.height = `${vh}px`;
      runway.style.minHeight = `${heightMultiplier * vh}px`;
      runway.style.height = `${heightMultiplier * vh}px`;
    };
    sizeLayout();

    let rafId: number | null = null;
    const syncFromScroll = () => {
      const p = readScrollProgress(runway, scrollRoot);
      applyProgress(p);
    };

    const handleScroll = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        syncFromScroll();
      });
    };

    if (isElementScrollRoot(scrollRoot)) {
      scrollRoot.addEventListener("scroll", handleScroll, { passive: true });
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    applyProgress(0);
    syncFromScroll();

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        sizeLayout();
        syncFromScroll();
      }, 160);
    };
    window.addEventListener("resize", onResize);
    const containerObserver = new ResizeObserver(onResize);
    if (isElementScrollRoot(scrollRoot)) containerObserver.observe(scrollRoot);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      if (isElementScrollRoot(scrollRoot)) {
        scrollRoot.removeEventListener("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
      containerObserver.disconnect();
      gsap.set(cards, { clearProps: "all" });
      overlays.forEach((el) => el && gsap.set(el, { clearProps: "opacity" }));
      stage.style.height = "";
      runway.style.height = "";
      runway.style.minHeight = "";
    };
  }, [items, forceProgress, pinned, count]);

  const goToCard = (targetIdx: number) => {
    const runway = runwayRef.current;
    if (!runway) return;
    const clampedIdx = Math.max(0, Math.min(count - 1, targetIdx));
    const targetP = count > 1 ? clampedIdx / (count - 1) : 0;
    const scrollRoot = getScrollParent(runway);
    const vh = isElementScrollRoot(scrollRoot)
      ? scrollRoot.clientHeight
      : window.innerHeight;
    const scrollable = runway.offsetHeight - vh;
    if (scrollable <= 0) return;

    const runwayRect = runway.getBoundingClientRect();
    const currentScrollY = isElementScrollRoot(scrollRoot)
      ? scrollRoot.scrollTop
      : window.scrollY;
    const runwayTopDoc = runwayRect.top + currentScrollY;
    const targetScrollTop = runwayTopDoc + targetP * scrollable;

    if (isElementScrollRoot(scrollRoot)) {
      scrollRoot.scrollTo({ top: targetScrollTop, behavior: "smooth" });
    } else {
      window.scrollTo({ top: targetScrollTop, behavior: "smooth" });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: performance.now(),
      };
      touchMovedRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStartPos.current.x;
    const dy = e.touches[0].clientY - touchStartPos.current.y;
    if (Math.hypot(dx, dy) > 8) {
      touchMovedRef.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;
    touchStartPos.current = null;

    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 0.7) {
      if (dx < 0) {
        goToCard(activeIdx + 1);
      } else {
        goToCard(activeIdx - 1);
      }
    } else if (Math.abs(dy) > 42 && Math.abs(dy) > Math.abs(dx) * 1.2) {
      if (dy < 0) {
        goToCard(activeIdx + 1);
      } else {
        goToCard(activeIdx - 1);
      }
    }

    setTimeout(() => {
      touchMovedRef.current = false;
    }, 180);
  };

  const handleCardClick = (
    e: React.MouseEvent<HTMLElement>,
    href?: string,
    isExternal?: boolean,
  ) => {
    if (touchMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (href && !isExternal && href.startsWith("/")) {
      e.preventDefault();
      navigate(href);
    }
  };

  const cssVars = {
    "--mvp-field": fieldColor,
    "--mvp-ink": inkColor,
    "--mvp-font": FONT_UI,
  } as CSSProperties;

  return (
    <section
      ref={rootRef}
      data-tsuna-id="music-video-pin-stack"
      aria-label={heading}
      className={cn("mvp relative w-full", pinned && "is-preview", className)}
      style={cssVars}
    >
      <style>{`
[data-tsuna-id="music-video-pin-stack"].mvp {
  --mvp-field: ${COLOR_FIELD};
  --mvp-ink: ${COLOR_INK};
  --mvp-font: ${FONT_UI};
  background: var(--mvp-field);
  color: var(--mvp-ink);
  font-family: var(--mvp-font);
  -webkit-font-smoothing: antialiased;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-stage {
  --mvp-thumb-w: min(72vw, calc(100vw - 26rem), 1120px);
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  height: 100svh;
  background: var(--mvp-field);
  overflow: hidden;
}
[data-tsuna-id="music-video-pin-stack"].is-preview .mvp-stage {
  position: relative;
  height: auto;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-stage::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.18;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
[data-tsuna-id="music-video-pin-stack"] .mvp-heading {
  position: absolute;
  z-index: 2;
  top: clamp(-0.4rem, -0.7vh, 0);
  left: clamp(0.7rem, 1.2vw, 1.3rem);
  margin: 0;
  font-size: clamp(2.6rem, 12vw, 10.5rem);
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 0.92;
  color: var(--mvp-ink);
  pointer-events: none;
  transition: color 0.35s ease;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-titles,
[data-tsuna-id="music-video-pin-stack"] .mvp-metas {
  position: absolute;
  z-index: 4;
  top: 0;
  bottom: 0;
  margin: auto;
  height: fit-content;
  color: var(--mvp-ink);
  transition: color 0.35s ease;
  pointer-events: none;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-titles {
  left: calc(50% - (var(--mvp-thumb-w) / 2) - 0.9rem);
  transform: translateX(-100%);
  width: max-content;
  max-width: 11.5rem;
  font-size: clamp(0.75rem, 1.05cqw, 0.95rem);
  text-align: right;
  white-space: normal;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-metas {
  left: calc(50% + (var(--mvp-thumb-w) / 2) + 0.9rem);
  width: max-content;
  max-width: 12rem;
  font-size: clamp(0.7rem, 1.05cqw, 0.95rem);
  letter-spacing: 0.1em;
  text-align: left;
  white-space: normal;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-title-item,
[data-tsuna-id="music-video-pin-stack"] .mvp-meta-item {
  display: block;
  opacity: 0;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-title-item:not(:first-of-type),
[data-tsuna-id="music-video-pin-stack"] .mvp-meta-item:not(:first-of-type) {
  position: absolute;
  inset: 0;
  margin: auto;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-title-item[data-active],
[data-tsuna-id="music-video-pin-stack"] .mvp-meta-item[data-active] {
  animation: mvp-flicker 0.075s steps(1) 4 forwards;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-meta-label,
[data-tsuna-id="music-video-pin-stack"] .mvp-meta-release {
  display: block;
  text-align: inherit;
  margin: 0;
  line-height: 1.45;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-list {
  position: absolute;
  z-index: 3;
  inset: 0;
  margin: auto;
  width: var(--mvp-thumb-w);
  aspect-ratio: 16 / 9;
  height: auto;
  max-width: min(92vw, 1120px);
  max-height: none;
  border-radius: 22px;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-item {
  position: absolute;
  inset: 0;
  margin: auto;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 22px;
  will-change: transform, clip-path;
  transform-origin: 50% 50%;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-item[data-prev] {
  pointer-events: none;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 22px;
  pointer-events: none;
  -webkit-user-drag: none;
  user-select: none;
  -webkit-user-select: none;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-tsuna-id="music-video-pin-stack"] .mvp-play {
  position: absolute;
  z-index: 6;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 0.45rem 1.1rem;
  border-radius: 999px;
  background: rgba(243, 238, 230, 0.92);
  color: var(--mvp-ink);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  pointer-events: none;
  backdrop-blur: 8px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-tsuna-id="music-video-pin-stack"]:not(.is-preview) .mvp-item:hover .mvp-play {
  transform: translate(-50%, -50%) scale(1.1);
  background: #135940;
  color: #ffffff;
  border-color: rgba(167, 243, 208, 0.85);
  box-shadow: 0 10px 28px -4px rgba(19, 89, 64, 0.45);
}
[data-tsuna-id="music-video-pin-stack"] .mvp-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: var(--mvp-ink);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
[data-tsuna-id="music-video-pin-stack"]:not(.is-preview) .mvp-item:hover img {
  transform: scale(1.08);
}
[data-tsuna-id="music-video-pin-stack"] .mvp-mobile-controls {
  display: none;
}
@keyframes mvp-flicker {
  0% { opacity: 0; }
  25% { opacity: 1; }
  50% { opacity: 0; }
  75% { opacity: 1; }
  100% { opacity: 1; }
}
@media (max-width: 1100px) {
  [data-tsuna-id="music-video-pin-stack"] .mvp-stage {
    --mvp-thumb-w: min(86vw, 640px);
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-heading {
    top: clamp(3.5rem, 10cqh, 5rem);
    left: 1rem;
    right: 1rem;
    font-size: clamp(2.2rem, 12vw, 3.5rem);
    letter-spacing: 0;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-titles,
  [data-tsuna-id="music-video-pin-stack"] .mvp-metas {
    left: 1rem;
    right: 1rem;
    transform: none;
    width: auto;
    max-width: none;
    text-align: center;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-titles {
    top: auto;
    bottom: calc(50% + (var(--mvp-thumb-w) * 9 / 32) + 1rem);
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-metas {
    top: calc(50% + (var(--mvp-thumb-w) * 9 / 32) + 0.85rem);
    bottom: auto;
    letter-spacing: 0.06em;
  }
}
@media (max-width: 768px) {
  [data-tsuna-id="music-video-pin-stack"] .mvp-stage {
    --mvp-thumb-w: min(90vw, 420px);
    touch-action: pan-y;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-heading {
    top: 2rem;
    font-size: clamp(1.75rem, 9vw, 2.75rem);
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-titles {
    font-size: 0.85rem;
    bottom: calc(50% + (var(--mvp-thumb-w) * 9 / 32) + 0.65rem);
    max-width: min(88vw, 380px);
    margin-left: auto;
    margin-right: auto;
    line-height: 1.35;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-metas {
    font-size: 0.75rem;
    top: calc(50% + (var(--mvp-thumb-w) * 9 / 32) + 0.65rem);
    max-width: min(88vw, 360px);
    margin-left: auto;
    margin-right: auto;
    line-height: 1.4;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-item {
    touch-action: pan-y;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-mobile-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    position: absolute;
    z-index: 25;
    left: 0;
    right: 0;
    bottom: calc(clamp(1.2rem, 3.5svh, 2.25rem) + env(safe-area-inset-bottom, 0px));
    margin: 0 auto;
    width: max-content;
    padding: 6px 14px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(226, 232, 240, 0.95);
    box-shadow: 0 6px 20px -3px rgba(15, 23, 42, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.08);
    touch-action: auto;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-mobile-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 9999px;
    background: #f8fafc;
    color: #1e293b;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-mobile-nav-btn:active {
    transform: scale(0.92);
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-mobile-nav-btn:disabled {
    opacity: 0.35;
    pointer-events: none;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-mobile-dots {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-mobile-dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: #cbd5e1;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-mobile-dot.is-active {
    width: 22px;
    height: 6px;
    background: #135940;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-mobile-counter {
    font-size: 11px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-weight: 600;
    color: #475569;
    margin-left: 2px;
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-tsuna-id="music-video-pin-stack"] .mvp-title-item[data-active],
  [data-tsuna-id="music-video-pin-stack"] .mvp-meta-item[data-active] {
    animation: none;
    opacity: 1;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-item img {
    transition: none;
  }
}
      `}</style>

      <div
        ref={runwayRef}
        className={cn("relative w-full", pinned && "contents")}
        style={
          pinned
            ? undefined
            : { minHeight: `calc(${Math.max(count, 1) + 1} * 100svh)` }
        }
      >
        <div
          ref={stageRef}
          className={cn(
            "mvp-stage w-full",
            pinned
              ? "relative aspect-[16/10] max-h-[100svh]"
              : "sticky top-0 h-[100svh]",
          )}
        >
          <h2 className="mvp-heading">{heading}</h2>

          <div className="mvp-titles" aria-live="polite">
            {items.map((item, i) => (
              <span
                key={`title-${item.id}`}
                ref={(el) => {
                  titleRefs.current[i] = el;
                }}
                className="mvp-title-item"
                data-index={i + 1}
                data-active={i === 0 ? true : undefined}
                style={i === 0 ? { opacity: 1 } : undefined}
              >
                {item.title}
              </span>
            ))}
          </div>

          <div className="mvp-metas" aria-hidden="true">
            {items.map((item, i) => (
              <div
                key={`meta-${item.id}`}
                ref={(el) => {
                  metaRefs.current[i] = el;
                }}
                className="mvp-meta-item"
                data-index={i + 1}
                data-active={i === 0 ? true : undefined}
                style={i === 0 ? { opacity: 1 } : undefined}
              >
                <p className="mvp-meta-label">{item.label}</p>
                <p className="mvp-meta-release">{item.released}</p>
              </div>
            ))}
          </div>

          <div
            ref={listRef}
            className="mvp-list"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {items.map((item, i) => {
              const media = resolveItemMedia(item);
              const href = media.href;
              const isExternal = Boolean(href?.startsWith("http"));
              const cardContent = (
                <>
                  {media.imageSrc ? (
                    <img
                      src={media.imageSrc}
                      alt={item.imageAlt ?? item.title}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="w-full h-full object-cover select-none pointer-events-none"
                      draggable={false}
                    />
                  ) : null}
                  <span className="mvp-play" aria-hidden="true">
                    Explore
                  </span>
                  <div className="mvp-overlay" data-mv-overlay />
                </>
              );

              if (href) {
                return (
                  <a
                    key={item.id}
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    onClick={(e) => handleCardClick(e, href, isExternal)}
                    className="mvp-item"
                    data-mv-item
                    data-index={i + 1}
                    aria-label={`Explore ${item.title}`}
                  >
                    {cardContent}
                  </a>
                );
              }

              return (
                <div
                  key={item.id}
                  onClick={(e) => handleCardClick(e, href, isExternal)}
                  className="mvp-item"
                  data-mv-item
                  data-index={i + 1}
                  aria-label={`Explore ${item.title}`}
                >
                  {cardContent}
                </div>
              );
            })}
          </div>

          {/* Mobile Touch Navigation Controls - Elegant Dots, Arrows & Counter */}
          <div
            className="mvp-mobile-controls"
            aria-label="Clinical cards navigation"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToCard(activeIdx - 1);
              }}
              disabled={activeIdx === 0}
              className="mvp-mobile-nav-btn"
              aria-label="Previous card"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="mvp-mobile-dots">
              {items.map((it, idx) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToCard(idx);
                  }}
                  className={`mvp-mobile-dot ${
                    idx === activeIdx ? "is-active" : ""
                  }`}
                  aria-label={`Go to ${it.title}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToCard(activeIdx + 1);
              }}
              disabled={activeIdx === count - 1}
              className="mvp-mobile-nav-btn"
              aria-label="Next card"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="mvp-mobile-counter">
              0{activeIdx + 1} / 0{count}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MusicVideoPinStack;
