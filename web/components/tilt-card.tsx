'use client';

import { ReactNode, useEffect, useRef } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  max?: number;
  onClick?: () => void;
}

// Module-level: when the page is actively scrolling, tilt is suppressed
let scrollingUntil = 0;
let scrollListenerAttached = false;

function ensureScrollListener() {
  if (scrollListenerAttached || typeof window === 'undefined') return;
  scrollListenerAttached = true;
  window.addEventListener(
    'scroll',
    () => {
      scrollingUntil = performance.now() + 140;
    },
    { passive: true }
  );
}

export function TiltCard({ children, className = '', max = 8, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    ensureScrollListener();
  }, []);

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
  };

  const onMove = (e: React.MouseEvent) => {
    if (performance.now() < scrollingUntil) return reset();
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * max;
    const ry = (px - 0.5) * max;
    // Lift the card 4px on hover — subtle z-axis cue that pairs with the tilt
    // and matches the "interactive surface" feel the rest of the marketplace uses.
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty('--sx', `${px * 100}%`);
      el.style.setProperty('--sy', `${py * 100}%`);
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
    });
  };

  useEffect(() => {
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      onClick={onClick}
      className={`tilt ${className}`}
    >
      {children}
      <div className="tilt-spot" aria-hidden />
    </div>
  );
}
