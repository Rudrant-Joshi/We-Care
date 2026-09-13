import InteractiveBlurReveal from "@/components/ui/interactive-blur-reveal";

export default function InteractiveBlurRevealDemo() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white">
      <InteractiveBlurReveal />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-12 md:px-16">
        <h1 className="max-w-[18ch] text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Design that feels discovered,
          <br />
          not displayed.
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
          Move your cursor across the image to reveal it &amp; the frost drifts
          back in as you go.
        </p>
      </div>
    </main>
  );
}
