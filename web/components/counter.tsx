'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function Counter({ to, decimals = 0, prefix = '', suffix = '', duration = 1800, className = '' }: Props) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const rafRef = useRef(0);
  const ioRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    let startedForThisTarget = false;

    const start = (targetVal: number) => {
      if (startedForThisTarget) return;
      startedForThisTarget = true;
      const t0 = performance.now();
      const from = 0;
      const tick = (now: number) => {
        if (cancelled) return;
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(from + (targetVal - from) * eased);
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
        else setVal(targetVal);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    ioRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) start(to);
        });
      },
      { threshold: 0.3 }
    );
    ioRef.current.observe(el);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      ioRef.current?.disconnect();
    };
  }, [to, duration]);

  const safeVal = Number.isFinite(val) ? val : 0;
  const formatted = safeVal.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
