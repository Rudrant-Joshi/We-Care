import { useEffect, useRef } from 'react';

const VIDEO_SRC = '/hero-video.mp4';

// Key moments in the source clip (seconds):
// - Around 3.7s: fullest left-facing pose.
// - Around 5.8s: forward-facing / center pose looking directly at viewer.
// - Around 7.3s: fullest right-facing turn.
const TIME_LEFT = 3.7;
const TIME_CENTER = 5.8;
const TIME_RIGHT = 7.3;

// How quickly the mapped pose "catches up" to the cursor
const EASING = 0.12;
// Minimum timestamp change before dispatching another seek (prevents decoder starvation)
const SETTLE_THRESHOLD = 0.035;
// Minimum interval in ms between consecutive seeks to keep the compositor 60fps
const MIN_SEEK_INTERVAL_MS = 45;

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
  const lastSeekTimestampRef = useRef<number>(0);
  const isSeekingRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const readyRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId = 0;

    const commitSeek = (time: number) => {
      const now = performance.now();
      if (now - lastSeekTimestampRef.current < MIN_SEEK_INTERVAL_MS) {
        return;
      }
      if (isSeekingRef.current) {
        return;
      }
      isSeekingRef.current = true;
      lastSeekTimestampRef.current = now;
      lastSeekedTimeRef.current = time;
      video.currentTime = time;
    };

    const handleSeeked = () => {
      isSeekingRef.current = false;
      const targetTime = mapRatioToTime(smoothedRatioRef.current);
      if (
        lastSeekedTimeRef.current === null ||
        Math.abs(targetTime - lastSeekedTimeRef.current) > SETTLE_THRESHOLD
      ) {
        commitSeek(targetTime);
      }
    };

    const handleLoadedMetadata = () => {
      readyRef.current = true;
      const initialTime = mapRatioToTime(smoothedRatioRef.current);
      video.currentTime = initialTime;
      lastSeekedTimeRef.current = initialTime;
    };

    const tick = () => {
      const diff = targetRatioRef.current - smoothedRatioRef.current;
      if (Math.abs(diff) > 0.001) {
        smoothedRatioRef.current += diff * EASING;
        const targetTime = mapRatioToTime(smoothedRatioRef.current);
        if (
          lastSeekedTimeRef.current === null ||
          Math.abs(targetTime - lastSeekedTimeRef.current) > SETTLE_THRESHOLD
        ) {
          commitSeek(targetTime);
        }
        rafId = requestAnimationFrame(tick);
      } else {
        isAnimatingRef.current = false;
      }
    };

    const startAnimationLoop = () => {
      if (!isAnimatingRef.current) {
        isAnimatingRef.current = true;
        rafId = requestAnimationFrame(tick);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!readyRef.current) return;
      targetRatioRef.current = Math.min(Math.max(event.clientX / window.innerWidth, 0), 1);
      startAnimationLoop();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('seeked', handleSeeked);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', handleSeeked);
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="fixed inset-0 z-0 h-full w-full object-cover"
      style={{
        objectPosition: 'center center',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform',
      }}
      src={VIDEO_SRC}
      poster="/about-bg.jpg"
      muted
      playsInline
      preload="auto"
    />
  );
}
