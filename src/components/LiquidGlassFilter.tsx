import React from 'react';

interface LiquidGlassFilterProps {
  turbulenceFreq?: number;
  displacementScale?: number;
}

export const LiquidGlassFilter: React.FC<LiquidGlassFilterProps> = ({
  turbulenceFreq = 0.012,
  displacementScale = 14,
}) => {
  return (
    <svg className="hidden pointer-events-none absolute" width="0" height="0" aria-hidden="true">
      <defs>
        {/* Optical Liquid Glass Refraction Filter */}
        <filter id="liquid-glass-refraction" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={turbulenceFreq}
            numOctaves="3"
            seed="42"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={displacementScale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="0.4" result="blurred" />
          <feMerge>
            <feMergeNode in="blurred" />
            <feMergeNode in="SourceGraphic" opacity="0.3" />
          </feMerge>
        </filter>

        {/* Chromatic Aberration Glass Filter */}
        <filter id="liquid-chromatic">
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="red"
          />
          <feOffset dx="-2" dy="0" in="red" result="red-shifted" />

          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="green"
          />

          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
            result="blue"
          />
          <feOffset dx="2" dy="0" in="blue" result="blue-shifted" />

          <feBlend mode="screen" in="red-shifted" in2="green" result="rg" />
          <feBlend mode="screen" in="rg" in2="blue-shifted" />
        </filter>
      </defs>
    </svg>
  );
};
