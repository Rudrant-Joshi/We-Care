import { useEffect, useRef } from 'react';

const VIDEO_SRC = '/hero-video.mp4';

// Key moments in the source clip (seconds):
// - Around 3.7s: fullest left-facing pose.
// - Around 5.8s: forward-facing / center pose looking directly at viewer.
// - Around 7.3s: fullest right-facing turn.
// Using this continuous 3.7s -> 5.8s -> 7.3s sequence ensures a smooth, monotonic
// head turn from left to center to right without reversing through the left turn.
const TIME_LEFT = 3.7; // fullest left-facing turn
const TIME_CENTER = 5.8; // forward-facing / center pose
const TIME_RIGHT = 7.3; // fullest right-facing turn

// How quickly the mapped pose "catches up" to the cursor each frame.
const EASING = 0.14;
// Minimum change (seconds) before we bother re-seeking, avoiding
// pointless micro-seeks that can make playback look jittery.
const SETTLE_THRESHOLD = 0.006;

// Converts a 0-1 cursor ratio (0 = far left of screen, 1 = far right) into a
// timestamp in the source clip: 0 -> TIME_LEFT, 0.5 -> TIME_CENTER,
// 1 -> TIME_RIGHT, with a smooth linear blend on either side of center.
function mapRatioToTime(ratio: number): number {
  if (ratio <= 0.5) {
    return TIME_LEFT + (TIME_CENTER - TIME_LEFT) * (ratio / 0.5);
  }
  return TIME_CENTER + (TIME_RIGHT - TIME_CENTER) * ((ratio - 0.5) / 0.5);
}


export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const targetRatioRef = useRef(0.5);
  const smoothedRatioRef = useRef(0.5);
  const lastSeekedTimeRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);
  const pendingSeekRef = useRef(false);
  const readyRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId = 0;

    const commitSeek = (time: number) => {
      lastSeekedTimeRef.current = time;
      if (isSeekingRef.current) {
        pendingSeekRef.current = true;
        return;
      }
      isSeekingRef.current = true;
      video.currentTime = time;
    };

    const handleSeeked = () => {
      isSeekingRef.current = false;
      if (pendingSeekRef.current) {
        pendingSeekRef.current = false;
        commitSeek(mapRatioToTime(smoothedRatioRef.current));
      }
    };

    const handleLoadedMetadata = () => {
      readyRef.current = true;
      video.currentTime = mapRatioToTime(smoothedRatioRef.current);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!readyRef.current) return;
      targetRatioRef.current = Math.min(Math.max(event.clientX / window.innerWidth, 0), 1);
    };

    // We ease the ABSTRACT 0-1 cursor position (not the raw video
    // timestamp) toward the cursor every frame, then convert that eased
    // position into a timestamp each frame via mapRatioToTime. Easing the
    // position instead of the timestamp is what keeps the glide from ever
    // passing back through the wrong pose: the source clip returns to
    // center between its left-turn and right-turn segments, so easing the
    // timestamp directly would replay that unrelated middle section as the
    // cursor crossed from one half of the screen to the other.
    const tick = () => {
      const diff = targetRatioRef.current - smoothedRatioRef.current;
      if (Math.abs(diff) > 0.0008) {
        smoothedRatioRef.current += diff * EASING;
        const targetTime = mapRatioToTime(smoothedRatioRef.current);
        if (
          lastSeekedTimeRef.current === null ||
          Math.abs(targetTime - lastSeekedTimeRef.current) > SETTLE_THRESHOLD
        ) {
          commitSeek(targetTime);
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('seeked', handleSeeked);
    window.addEventListener('mousemove', handleMouseMove);
    rafId = requestAnimationFrame(tick);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', handleSeeked);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="fixed inset-0 z-0 h-full w-full object-cover"
      style={{
        objectPosition: 'center center',
        // GPU-composite the layer so scrubbing doesn't repaint the page.
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform',
      }}
      src={VIDEO_SRC}
      muted
      playsInline
      preload="auto"
    />
  );
}
