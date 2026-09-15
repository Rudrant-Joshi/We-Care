"use client";

import { useEffect, useState, type ReactNode } from "react";
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

  return (
    <div
      data-demo-scroll
      data-slipstream-demo
      tabIndex={0}
      role="region"
      aria-label={`${word}. Scroll to step inside.`}
      style={{
        width: "100%",
        height: "min(720px, 100svh)",
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
        [data-sublime-header]{position:absolute;inset:clamp(24px,4.5cqw,48px) clamp(24px,5cqw,64px) auto;display:flex;align-items:center;justify-content:space-between;gap:20px;}
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
          [data-slipstream-actions]{width:100%;flex-direction:column;align-items:stretch;gap:10px;}
          [data-slipstream-btn-primary],[data-slipstream-btn-secondary]{width:100%;justify-content:center;}
        }
      `}</style>
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
          front={
            <>
              <div data-sublime-header>
                <span data-sublime-logo>{resolvedLogo}</span>
                <span data-sublime-category>{resolvedCategory}</span>
              </div>
              <p data-sublime-eyebrow>{resolvedEyebrow}</p>
              <p data-sublime-support>{resolvedSupport}</p>
              <span data-sublime-scroll>{scrollNotice}</span>
            </>
          }
        >
          {children ?? (
            <div data-slipstream-copy>
              {resolvedBadge && <span data-slipstream-badge>{resolvedBadge}</span>}
              <h2>{resolvedHeadline}</h2>
              {resolvedSubtitle && (
                <p data-slipstream-subtitle>{resolvedSubtitle}</p>
              )}
              <div data-slipstream-features>
                {resolvedFeatures.map((feat) => (
                  <div key={feat.no} data-slipstream-feature>
                    <h3>
                      <span data-slipstream-no>{feat.no}</span>
                      {feat.title}
                    </h3>
                    <p>{feat.text}</p>
                  </div>
                ))}
              </div>
              {(resolvedPrimaryButton || resolvedSecondaryButton) && (
                <div data-slipstream-actions>
                  {resolvedPrimaryButton && (
                    <a
                      data-slipstream-btn-primary
                      href={resolvedPrimaryButton.href ?? "#"}
                      onClick={resolvedPrimaryButton.onClick}
                    >
                      <span>{resolvedPrimaryButton.label}</span>
                    </a>
                  )}
                  {resolvedSecondaryButton && (
                    <a
                      data-slipstream-btn-secondary
                      href={resolvedSecondaryButton.href ?? "#"}
                      onClick={resolvedSecondaryButton.onClick}
                    >
                      <span>{resolvedSecondaryButton.label}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
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

