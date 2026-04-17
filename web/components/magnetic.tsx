'use client';

import { ReactNode, useRef } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: 'button' | 'a' | 'div';
  href?: string;
  onClick?: () => void;
}

export function Magnetic({ children, className = '', strength = 0.35, as = 'button', href, onClick }: Props) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'translate3d(0, 0, 0)';
  };

  const handleClick = () => {
    reset();
    onClick?.();
  };

  const props = {
    ref: ref as never,
    className: `inline-block transition-transform duration-300 will-change-transform ${className}`,
    onMouseMove: onMove,
    onMouseLeave: reset,
    onClick: handleClick,
  };

  if (as === 'a') return <a href={href} {...props}>{children}</a>;
  if (as === 'div') return <div {...props}>{children}</div>;
  return <button type="button" {...props}>{children}</button>;
}
