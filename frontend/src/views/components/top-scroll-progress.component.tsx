import { motion, useScroll, useSpring } from 'motion/react';

export const TopScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 25,
    restDelta: 0.001,
  });

  return (
    <motion.div
      id="top-scroll-progress-bar"
      className="fixed top-0 left-0 right-0 h-[3px] bg-[#135940] origin-left z-50 shadow-[0_1px_10px_rgba(19,89,64,0.6)] pointer-events-none transform-gpu will-change-transform"
      style={{ scaleX }}
    />
  );
};

export default TopScrollProgress;
