"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import GlyphPortal from "@/components/ui/glyph-portal";

export type DemoFeature = {
  no: string;
  title: string;
  text: string;
};

export type DemoButton = {
  label: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  href?: string;
};

export type DemoProps = {
  navbar?: ReactNode;
  word?: string;
  logo?: string;
  category?: string;
  eyebrow?: string;
  support?: string;
  scrollNotice?: string;
  enterLabel?: string;
  badge?: string;
  headline?: string;
  subtitle?: string;
  features?: DemoFeature[];
  primaryButton?: DemoButton;
  secondaryButton?: DemoButton;
  scrollLength?: number;
  interactive?: boolean;
  annotations?: boolean;
  children?: ReactNode;
};

const family = '"Glyph Portal Jakarta", Arial, sans-serif';
let fontLoad: Promise<void> | undefined;

export default function Demo({
  navbar,
  word = "DOCTORS",
  logo,
  category,
  eyebrow,
  support,
  scrollNotice = "Scroll for a closer look ↓",
  enterLabel = "Step inside",
  badge,
  headline,
  subtitle,
  features,
  primaryButton,
  secondaryButton,
  scrollLength = 2.4,
  interactive = true,
  annotations = false,
  children,
}: DemoProps) {
  const [face, setFace] = useState<string | null>(null);

  // Context-aware defaults based on website domain and route
  const isDoctors = word.toUpperCase() === "DOCTORS";
  const isDepartments = word.toUpperCase() === "DEPARTMENTS";

  const resolvedLogo = logo ?? `${word.toLowerCase()}.`;
  const resolvedCategory =
    category ??
    (isDoctors
      ? "Board-Certified Specialists & Clinical Chiefs"
      : isDepartments
        ? "Specialized Clinical Centers & Divisions"
        : "Design & digital experiences");

  const resolvedEyebrow =
    eyebrow ??
    (isDoctors
      ? "Excellence in Precision Medicine & Compassionate Care"
      : isDepartments
        ? "Integrated Tertiary Care Architecture & Flagship Specialties"
        : "A different perspective starts here.");

  const resolvedSupport =
    support ??
    (isDoctors
      ? "Choose any letter to explore our clinical staff."
      : isDepartments
        ? "Choose any letter to step inside our clinical divisions."
        : "Follow your curiosity.");

  const resolvedBadge =
    badge ??
    (isDoctors
      ? "We Care Medical Staff"
      : isDepartments
        ? "We Care Centers of Excellence"
        : undefined);

  const resolvedHeadline =
    headline ??
    (isDoctors
      ? "World-class medical minds dedicated to your recovery and well-being."
      : isDepartments
        ? "Comprehensive clinical specialties engineered for high-precision treatment."
        : "A different way into what comes next.");

  const resolvedSubtitle =
    subtitle ??
    (isDoctors
      ? "Our hospital brings together over 120 board-certified physicians, surgeons, and clinical professors across multidisciplinary institutes — collaborating to deliver individualized treatment for every patient."
      : isDepartments
        ? "From emergency trauma triage and cardiovascular surgery to pediatric neurology and robotic orthopedics, our dedicated hospital wards provide seamless 24/7 multidisciplinary patient care."
        : undefined);

  const resolvedFeatures: DemoFeature[] =
    features ??
    (isDoctors
      ? [
        {
          no: "01",
          title: "Multidisciplinary Care",
          text: "Specialists across Cardiology, Oncology, Neurology, and Surgery coordinate seamlessly on complex clinical diagnoses.",
        },
        {
          no: "02",
          title: "Advanced Credentials",
          text: "Fellowship-trained faculty leading clinical trials, minimally invasive interventions, and robotic-assisted surgery.",
        },
        {
          no: "03",
          title: "Direct Access & Booking",
          text: "Review verified doctor credentials, specialized focus areas, live consultation schedules, and book appointments below.",
        },
      ]
      : isDepartments
        ? [
          {
            no: "01",
            title: "Flagship Clinical Wings",
            text: "Dedicated centers for Cardiology, Neurology, Orthopedics, Pediatrics, Oncology, and 24/7 Emergency Trauma.",
          },
          {
            no: "02",
            title: "State-of-the-Art Suites",
            text: "Biplane angiography labs, 3T MRI diagnostic suites, robotic surgical theatres, and ultra-sterile recovery units.",
          },
          {
            no: "03",
            title: "Seamless Patient Navigation",
            text: "Integrated patient care pathways coordinating rapid triage, diagnosis, inpatient surgery, and rehabilitation.",
          },
        ]
        : [
          {
            no: "01",
            title: "Choose your way in",
            text: "Pick any letter, then scroll. Each path takes you into the same green.",
          },
          {
            no: "02",
            title: "Set the scene",
            text: "A gradient, photograph, video or canvas can sit behind the word.",
          },
          {
            no: "03",
            title: "Keep going",
            text: "The next section is yours. Add a story, a project, or a reason to stay.",
          },
        ]);

  const resolvedPrimaryButton: DemoButton | undefined =
    primaryButton ??
    (isDoctors
      ? {
        label: "Browse Doctor Roster ↓",
        href: "#doctors-roster",
        onClick: (e) => {
          e.preventDefault();
          document
            .getElementById("doctors-roster")
            ?.scrollIntoView({ behavior: "smooth" });
        },
      }
      : isDepartments
        ? {
          label: "Explore Clinical Divisions ↓",
          href: "#departments-roster",
          onClick: (e) => {
            e.preventDefault();
            document
              .getElementById("departments-roster")
              ?.scrollIntoView({ behavior: "smooth" });
          },
        }
        : undefined);

  const resolvedSecondaryButton: DemoButton | undefined =
    secondaryButton ??
    (isDoctors || isDepartments
      ? {
        label: "Book Appointment →",
        href: "/book-appointment",
      }
      : undefined);

  useEffect(() => {
    let settled = false;
    const finish = (value: string) => {
      if (!settled) {
        settled = true;
        setFace(value);
      }
    };
    // The demo uses the résumé's face. The component itself never fetches a font.
    fontLoad ??= new FontFace(
      "Glyph Portal Jakarta",
      'url("https://cdn.21st.dev/assets/mirror/15/153fc85b70298beeb1d61a5f723331649e7f23bb77302a66e61cb3e2fbdb5e79.woff2")',
      { weight: "400 700" }
    )
      .load()
      .then((font) => {
        document.fonts.add(font);
      });
    const timeout = window.setTimeout(() => finish("Arial, sans-serif"), 1600);
    void fontLoad.then(
      () => finish(family),
      () => finish("Arial, sans-serif")
    );
    return () => {
      settled = true;
      clearTimeout(timeout);
    };
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize reverse and forward scrolling between Section 1 (inner scroll container) and Section 2 (window scroll)
  // This completely eliminates the scroll trap where Section 2 gets stuck midway on Section 1 during reverse scrolling.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // 1. Reverse scrolling: User scrolls UP (deltaY < 0)
      if (e.deltaY < 0) {
        // If window is scrolled down into Section 2 (window.scrollY > 0.5):
        // Section 2 is still visible on screen. We MUST scroll the window back up to 0 first!
        // We prevent the inner container from scrolling backwards while Section 2 is still on screen.
        if (window.scrollY > 0.5) {
          e.preventDefault();
          const windowToScroll = Math.min(window.scrollY, -e.deltaY);
          const remainingDelta = e.deltaY + windowToScroll;
          const targetY = Math.max(0, window.scrollY - windowToScroll);
          window.scrollTo({ top: targetY, behavior: "auto" });

          // If the window has now reached 0, apply any leftover upward delta to container.scrollTop
          if (targetY === 0 && remainingDelta < 0) {
            container.scrollTop = Math.max(0, container.scrollTop + remainingDelta);
          }
          return;
        }
      }

      // 2. Forward scrolling: User scrolls DOWN (deltaY > 0)
      if (e.deltaY > 0) {
        const maxScroll = container.scrollHeight - container.clientHeight;
        const availableDown = maxScroll - container.scrollTop;
        if (availableDown <= 2) {
          // Inner container is at the bottom: forward scroll down into Section 2
          e.preventDefault();
          window.scrollBy({ top: e.deltaY, behavior: "auto" });
          return;
        }
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY; // positive = swipe up (scroll down), negative = swipe down (scroll up)
      touchStartY = currentY;

      // Reverse scrolling on mobile touch
      if (deltaY < 0 && window.scrollY > 0.5) {
        e.preventDefault();
        const windowToScroll = Math.min(window.scrollY, -deltaY);
        const remainingDelta = deltaY + windowToScroll;
        const targetY = Math.max(0, window.scrollY - windowToScroll);
        window.scrollTo({ top: targetY, behavior: "auto" });
        if (targetY === 0 && remainingDelta < 0) {
          container.scrollTop = Math.max(0, container.scrollTop + remainingDelta);
        }
        return;
      }

      // Forward scrolling on mobile touch when container reaches bottom
      if (deltaY > 0) {
        const maxScroll = container.scrollHeight - container.clientHeight;
        const availableDown = maxScroll - container.scrollTop;
        if (availableDown <= 2) {
          e.preventDefault();
          window.scrollBy({ top: deltaY, behavior: "auto" });
          return;
        }
      }
    };

    // If cursor is outside container (e.g. over margin/scrollbar) and window is at 0:
    const handleWindowWheel = (e: WheelEvent) => {
      if (window.scrollY <= 1 && e.deltaY < 0) {
        if (!container.contains(e.target as Node) && container.scrollTop > 0) {
          container.scrollTop = Math.max(0, container.scrollTop + e.deltaY);
        }
      }
    };

    // Snap cleanly to 0 if left hovering slightly above 0 after scrolling up
    let scrollTimeout: number | undefined;
    const handleWindowScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        if (window.scrollY > 0 && window.scrollY < 80) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 150);
    };

    let winTouchStartY = 0;
    const handleWinTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        winTouchStartY = e.touches[0].clientY;
      }
    };
    const handleWinTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      const deltaY = winTouchStartY - currentY; // negative = swipe down = scroll up
      winTouchStartY = currentY;
      if (window.scrollY <= 0.5 && deltaY < 0 && container.scrollTop > 0) {
        if (!container.contains(e.target as Node)) {
          container.scrollTop = Math.max(0, container.scrollTop + deltaY);
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("wheel", handleWindowWheel, { passive: true });
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    window.addEventListener("touchstart", handleWinTouchStart, { passive: true });
    window.addEventListener("touchmove", handleWinTouchMove, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("wheel", handleWindowWheel);
      window.removeEventListener("scroll", handleWindowScroll);
      window.removeEventListener("touchstart", handleWinTouchStart);
      window.removeEventListener("touchmove", handleWinTouchMove);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-demo-scroll
      data-slipstream-demo
      tabIndex={0}
      role="region"
      aria-label={`${word}. Scroll to step inside.`}
      style={{
        position: "relative",
        width: "100%",
        height: navbar ? "100svh" : "min(720px, 100svh)",
        overflowY: "auto",
        background: "#fff",
        containerType: "inline-size",
        fontFamily: face ?? "Arial, sans-serif",
      }}
    >
      <style>{`
        [data-slipstream-demo] [data-gp-caption]{inset:calc(var(--gp-word-bottom,50%) + 82px) 24px auto;justify-content:center;}
        [data-slipstream-demo] [data-gp-hint]{display:none;}
        [data-slipstream-demo] [data-gp-enter]{min-height:46px;padding:0 20px;gap:28px;background:#142b22;border:1px solid #10261d;border-radius:10px;color:#fff;font-size:13px;font-weight:500;box-shadow:0 1px 2px #10261d1a;transition:background .18s,box-shadow .18s;}
        [data-slipstream-demo] [data-gp-enter]:hover{background:#204434;box-shadow:0 3px 8px #10261d18;}
        [data-slipstream-demo] [data-gp-enter]:focus-visible{outline:2px solid #176247;outline-offset:4px;}
        [data-slipstream-demo] [data-gp-touch-picker]{top:auto;bottom:18px;left:50%;}
        [data-slipstream-demo] [data-gp-select]{border-color:transparent;border-radius:8px;font-size:12px;color:#626964;}
        [data-sublime-header]{position:absolute;inset:clamp(24px,4.5cqw,48px) clamp(24px,5cqw,64px) auto;display:flex;align-items:center;justify-content:space-between;gap:20px;z-index:20;pointer-events:none;}
        [data-sublime-logo]{font-size:19px;font-weight:600;letter-spacing:-.065em;color:#18251e;}
        [data-sublime-category]{font-size:12px;line-height:1.5;color:#71766f;}
        [data-sublime-eyebrow]{position:absolute;inset:auto 24px calc(100% - var(--gp-word-top,35%) + 32px);margin:0;text-align:center;font-size:13px;font-weight:400;line-height:1.5;letter-spacing:.005em;color:#71766f;}
        [data-sublime-support]{position:absolute;inset:calc(var(--gp-word-bottom,50%) + 32px) 24px auto;margin:0;text-align:center;font-size:16px;font-weight:400;line-height:1.5;color:#646a63;}
        [data-sublime-scroll]{position:absolute;inset:auto 24px 7%;text-align:center;color:#7c817b;font-size:11px;letter-spacing:.01em;}
        @media(any-pointer:coarse){[data-sublime-scroll]{bottom:13%;}}
        @container(max-width:450px){[data-sublime-category]{max-width:12ch;text-align:right;}[data-sublime-eyebrow]{font-size:12px;}[data-sublime-support]{font-size:14px;}[data-slipstream-demo] [data-gp-caption]{top:calc(var(--gp-word-bottom,50%) + 76px);}}
        @container(max-height:479px){[data-sublime-header]{top:18px;}[data-sublime-support]{top:calc(var(--gp-word-bottom,50%) + 16px);}[data-slipstream-demo] [data-gp-caption]{top:calc(var(--gp-word-bottom,50%) + 60px);}[data-sublime-scroll]{display:none;}}
        [data-slipstream-demo] [data-gp-content]{padding:5rem clamp(1.25rem,5cqw,5rem) 5.5rem;font-family:inherit;}
        [data-slipstream-demo] section,[data-slipstream-demo] [data-gp-caption]{font-family:inherit;}
        [data-slipstream-copy]{display:flex;width:min(100%,80rem);margin:auto;flex-direction:column;align-items:flex-start;gap:clamp(1.5rem,4svh,2.75rem);}
        [data-slipstream-badge]{display:inline-flex;align-items:center;gap:8px;padding:4px 14px;border-radius:9999px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.22);color:#a7f3d0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;backdrop-filter:blur(4px);margin-bottom:-6px;}
        [data-slipstream-copy] h2{max-width:54rem;margin:0;color:inherit;font-size:clamp(1.75rem,1.1rem + 2.1cqw,2.35rem);font-weight:500;line-height:1.22;letter-spacing:-0.015em;text-wrap:balance;}
        [data-slipstream-subtitle]{max-width:54rem;margin:0;color:rgba(251,251,250,0.85);font-size:clamp(0.95rem,0.9rem + 0.3cqw,1.08rem);line-height:1.65;}
        [data-slipstream-features]{display:grid;width:100%;grid-template-columns:1fr;gap:1.75rem;}
        [data-slipstream-feature]{border-top:1px solid rgba(251,251,250,.22);padding-top:1.1rem;}
        [data-slipstream-feature] h3{margin:0;color:inherit;font-size:1.125rem;font-weight:500;line-height:1.2;letter-spacing:0;}
        [data-slipstream-feature] p{margin:.55rem 0 0;color:rgba(251,251,250,.85);font-size:.9375rem;line-height:1.55;}
        [data-slipstream-no]{display:inline-block;margin-right:.7rem;color:rgba(251,251,250,.85);font:500 .75rem ui-monospace,monospace;letter-spacing:.08em;transform:translateY(-.1em);}
        @container(min-width:768px){[data-slipstream-features]{grid-template-columns:repeat(3,minmax(0,1fr));gap:3rem;}}
        [data-slipstream-actions]{display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin-top:0.25rem;}
        [data-slipstream-btn-primary]{display:inline-flex;align-items:center;gap:10px;padding:0 22px;min-height:46px;border-radius:12px;background:#ffffff;color:#0b3b2a;font-size:13px;font-weight:600;text-decoration:none;box-shadow:0 6px 18px rgba(0,0,0,0.25);transition:transform 0.18s,background 0.18s,box-shadow 0.18s;cursor:pointer;}
        [data-slipstream-btn-primary]:hover{background:#ecfdf5;transform:translateY(-2px);box-shadow:0 10px 24px rgba(0,0,0,0.35);}
        [data-slipstream-btn-secondary]{display:inline-flex;align-items:center;gap:10px;padding:0 20px;min-height:46px;border-radius:12px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.25);color:#ffffff;font-size:13px;font-weight:500;text-decoration:none;transition:background 0.18s,border-color 0.18s,transform 0.18s;cursor:pointer;}
        [data-slipstream-btn-secondary]:hover{background:rgba(255,255,255,0.24);border-color:rgba(255,255,255,0.4);transform:translateY(-2px);}
        @container(max-width:640px){
          [data-slipstream-demo] [data-gp-content]{padding:clamp(2.5rem, 5svh, 3.5rem) 1.25rem clamp(2.5rem, 6svh, 4rem);}
          [data-slipstream-copy]{gap:clamp(1rem, 2.5svh, 1.5rem);}
          [data-slipstream-copy] h2{font-size:clamp(1.45rem, 5.2cqw, 1.85rem);line-height:1.22;}
          [data-slipstream-subtitle]{font-size:0.885rem;line-height:1.55;}
          [data-slipstream-features]{gap:1.15rem;}
          [data-slipstream-feature]{padding-top:0.75rem;}
          [data-slipstream-feature] h3{font-size:1rem;}
          [data-slipstream-feature] p{font-size:0.85rem;line-height:1.5;}
          [data-slipstream-actions]{width:100%;flex-direction:column;align-items:stretch;gap:10px;margin-top:0.5rem;}
          [data-slipstream-btn-primary],[data-slipstream-btn-secondary]{width:100%;justify-content:center;min-height:46px;}
        }
      `}</style>

      {/* Main Website Navigation Bar - Inside scroll container so it scrolls away naturally on section one */}
      {navbar}

      {/* Section Navbar Header - Shown if no external navbar provided */}
      {!navbar && (
        <div data-sublime-header>
          <span data-sublime-logo>{resolvedLogo}</span>
          <span data-sublime-category>{resolvedCategory}</span>
        </div>
      )}

      {face ? (
        <GlyphPortal
          word={word}
          fontFamily={face}
          fontWeight={700}
          style={{ fontFamily: face }}
          scrollLength={scrollLength}
          interactive={interactive}
          annotations={annotations}
          enterLabel={enterLabel}
          background={
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Base rich deep clinical green atmosphere */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 50% 30%, rgba(20, 87, 63, 0.9) 0%, rgba(11, 59, 42, 0.96) 50%, #041a12 100%)",
                }}
              />
              {/* Floating ambient medical emerald glow orb */}
              <motion.div
                animate={{
                  x: [0, 35, -25, 0],
                  y: [0, -30, 25, 0],
                  scale: [1, 1.12, 0.96, 1],
                  opacity: [0.35, 0.55, 0.4, 0.35],
                }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-1/4 -left-1/4 w-[75vw] h-[75vw] rounded-full blur-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(52, 211, 153, 0.45) 0%, rgba(16, 185, 129, 0.18) 45%, transparent 70%)",
                }}
              />
              {/* Secondary floating clinical cyan glow orb */}
              <motion.div
                animate={{
                  x: [0, -40, 30, 0],
                  y: [0, 35, -25, 0],
                  scale: [1, 1.15, 0.92, 1],
                  opacity: [0.3, 0.5, 0.35, 0.3],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full blur-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(45, 212, 191, 0.4) 0%, rgba(13, 148, 136, 0.15) 50%, transparent 70%)",
                }}
              />
              {/* Architectural precision grid lines */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
              />
            </div>
          }
          front={
            <>
              <motion.p
                data-sublime-eyebrow
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
                {resolvedEyebrow}
              </motion.p>
              <motion.p
                data-sublime-support
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                {resolvedSupport}
              </motion.p>
              <motion.span
                data-sublime-scroll
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 5, 0] }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.25 },
                  y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
                }}
                className="inline-flex items-center gap-1.5"
              >
                {scrollNotice}
              </motion.span>
            </>
          }
        >
          {children ?? (
            <motion.div
              data-slipstream-copy
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {resolvedBadge && (
                <motion.span
                  data-slipstream-badge
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.05 }}
                  className="transition-transform duration-200 cursor-default"
                >
                  <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
                  </span>
                  {resolvedBadge}
                </motion.span>
              )}
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {resolvedHeadline}
              </motion.h2>
              {resolvedSubtitle && (
                <motion.p
                  data-slipstream-subtitle
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  {resolvedSubtitle}
                </motion.p>
              )}
              <div data-slipstream-features>
                {resolvedFeatures.map((feat, idx) => (
                  <motion.div
                    key={feat.no}
                    data-slipstream-feature
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.55,
                      delay: 0.24 + idx * 0.09,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="group rounded-xl p-3.5 -mx-3.5 transition-all duration-300 hover:bg-white/[0.08] hover:backdrop-blur-sm border border-transparent hover:border-emerald-500/25 cursor-default"
                  >
                    <h3 className="flex items-center gap-2">
                      <span
                        data-slipstream-no
                        className="group-hover:text-emerald-300 transition-colors duration-200"
                      >
                        {feat.no}
                      </span>
                      <span className="group-hover:text-white transition-colors duration-200">
                        {feat.title}
                      </span>
                    </h3>
                    <p className="group-hover:text-white/95 transition-colors duration-200">
                      {feat.text}
                    </p>
                  </motion.div>
                ))}
              </div>
              {(resolvedPrimaryButton || resolvedSecondaryButton) && (
                <motion.div
                  data-slipstream-actions
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {resolvedPrimaryButton && (
                    <motion.a
                      data-slipstream-btn-primary
                      href={resolvedPrimaryButton.href ?? "#"}
                      onClick={resolvedPrimaryButton.onClick}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 420, damping: 22 }}
                      className="group relative overflow-hidden shadow-lg hover:shadow-emerald-950/40"
                    >
                      {/* Shimmer light sweep on hover */}
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-100/50 to-transparent pointer-events-none" />
                      <span className="relative z-10 flex items-center gap-2">
                        {resolvedPrimaryButton.label}
                      </span>
                    </motion.a>
                  )}
                  {resolvedSecondaryButton && (
                    <motion.a
                      data-slipstream-btn-secondary
                      href={resolvedSecondaryButton.href ?? "#"}
                      onClick={resolvedSecondaryButton.onClick}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 420, damping: 22 }}
                      className="group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {resolvedSecondaryButton.label}
                      </span>
                    </motion.a>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </GlyphPortal>
      ) : (
        <div
          role="status"
          style={{
            height: "100%",
            display: "grid",
            placeItems: "center",
            color: "#555",
            fontSize: 12,
          }}
        >
          Loading type…
        </div>
      )}
    </div>
  );
}

