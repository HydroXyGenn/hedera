import React from 'react';

export const AmbientPorcelainCanvas: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      style={{
        background: `
          radial-gradient(740px 520px at 10% 8%, rgba(224, 242, 254, 0.92), transparent 72%),
          radial-gradient(660px 480px at 90% 14%, rgba(238, 242, 255, 0.85), transparent 72%),
          radial-gradient(680px 520px at 86% 84%, rgba(236, 253, 245, 0.92), transparent 72%),
          radial-gradient(540px 420px at 14% 86%, rgba(224, 242, 254, 0.58), transparent 72%),
          #F8FAFC
        `,
      }}
    />
  );
};
