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
      className="fixed top-0 left-0 right-0 h-[3px] bg-blue-600 origin-left z-50 shadow-[0_1px_8px_rgba(37,99,235,0.45)] pointer-events-none transform-gpu will-change-transform"
      style={{ scaleX }}
    />
  );
};

export default TopScrollProgress;
