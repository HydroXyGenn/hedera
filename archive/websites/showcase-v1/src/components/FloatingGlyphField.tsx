import React from 'react';

interface GlyphPoint {
  x: number;
  y: number;
  opacity: number;
  delay: number;
  duration: number;
  variant: 'four' | 'dot' | 'spark';
}

const GLYPH_POINTS: GlyphPoint[] = [
  { x: 4, y: 12, opacity: 0.72, delay: 0, duration: 9, variant: 'four' },
  { x: 11, y: 7, opacity: 0.55, delay: 1.4, duration: 11, variant: 'four' },
  { x: 18, y: 22, opacity: 0.64, delay: 0.6, duration: 10, variant: 'four' },
  { x: 27, y: 8, opacity: 0.5, delay: 2.1, duration: 12, variant: 'four' },
  { x: 38, y: 5, opacity: 0.78, delay: 0.3, duration: 8.5, variant: 'four' },
  { x: 52, y: 6, opacity: 0.62, delay: 1.8, duration: 10.5, variant: 'four' },
  { x: 66, y: 11, opacity: 0.7, delay: 0.9, duration: 9.5, variant: 'four' },
  { x: 84, y: 7, opacity: 0.52, delay: 2.6, duration: 11.5, variant: 'four' },
  { x: 92, y: 18, opacity: 0.65, delay: 1.1, duration: 9, variant: 'four' },
  { x: 6, y: 38, opacity: 0.68, delay: 1.9, duration: 10.2, variant: 'four' },
  { x: 16, y: 56, opacity: 0.58, delay: 0.4, duration: 11, variant: 'four' },
  { x: 8, y: 78, opacity: 0.74, delay: 2.3, duration: 9.2, variant: 'four' },
  { x: 24, y: 84, opacity: 0.64, delay: 1.2, duration: 10.8, variant: 'four' },
  { x: 39, y: 76, opacity: 0.55, delay: 0.7, duration: 11.4, variant: 'four' },
  { x: 56, y: 88, opacity: 0.68, delay: 2.0, duration: 9.8, variant: 'four' },
  { x: 74, y: 74, opacity: 0.6, delay: 0.5, duration: 10.1, variant: 'four' },
  { x: 89, y: 64, opacity: 0.72, delay: 1.7, duration: 9.4, variant: 'four' },
  { x: 94, y: 86, opacity: 0.64, delay: 2.4, duration: 11.2, variant: 'four' },
  { x: 22, y: 42, opacity: 0.45, delay: 0.2, duration: 8, variant: 'dot' },
  { x: 77, y: 36, opacity: 0.5, delay: 1.5, duration: 8.8, variant: 'spark' },
  { x: 46, y: 20, opacity: 0.4, delay: 2.2, duration: 9.6, variant: 'dot' },
  { x: 63, y: 52, opacity: 0.48, delay: 0.8, duration: 10.4, variant: 'spark' },
];

export const FloatingGlyphField: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Top-right sunlit ice halo matching reference gradient */}
      <div
        className="absolute -top-32 -right-32 h-[620px] w-[620px] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(242, 250, 255, 0.92) 0%, rgba(169, 222, 255, 0.42) 45%, transparent 74%)',
        }}
      />

      {GLYPH_POINTS.map((pt, idx) => (
        <span
          key={idx}
          style={{
            left: `${pt.x}%`,
            top: `${pt.y}%`,
            opacity: pt.opacity,
            animation: `floatSlow ${pt.duration}s ease-in-out ${pt.delay}s infinite`,
          }}
          className="absolute font-mono-tabular text-[10px] font-semibold tracking-tight text-white/85 drop-shadow-[0_0_6px_rgba(186,230,253,0.75)]"
        >
          {pt.variant === 'four' && '4'}
          {pt.variant === 'dot' && (
            <span className="inline-block h-1 w-1 rounded-full bg-cyan-100/80" />
          )}
          {pt.variant === 'spark' && '✦'}
        </span>
      ))}
    </div>
  );
};
