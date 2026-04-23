'use client';

import { ReactNode, useEffect, useRef } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'article';
}

export function Reveal({ children, className = '', delay = 0, as = 'div' }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            window.setTimeout(() => el.classList.add('visible'), delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const cls = `reveal ${className}`;
  const refSet = (el: HTMLElement | null) => {
    ref.current = el;
  };

  if (as === 'section') return <section ref={refSet} className={cls}>{children}</section>;
  if (as === 'article') return <article ref={refSet} className={cls}>{children}</article>;
  return <div ref={refSet} className={cls}>{children}</div>;
}
