'use client';

import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, rx: 0, ry: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      document.body.classList.remove('cursor-hidden');
    };

    const onDown = () => ringRef.current?.classList.add('is-click');
    const onUp = () => ringRef.current?.classList.remove('is-click');

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || !ringRef.current) return;
      const isText = !!t.closest('input, textarea, [contenteditable="true"]');
      const isHover = !isText && !!t.closest('a, button, select, [data-cursor="hover"]');
      ringRef.current.classList.toggle('is-hover', isHover);
      ringRef.current.classList.toggle('is-text', isText);
    };

    const onLeaveWindow = () => document.body.classList.add('cursor-hidden');
    const onEnterWindow = () => document.body.classList.remove('cursor-hidden');
    const onBlur = () => document.body.classList.add('cursor-hidden');

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mouseover', onOver);
    document.addEventListener('mouseleave', onLeaveWindow);
    document.addEventListener('mouseenter', onEnterWindow);
    window.addEventListener('blur', onBlur);

    let raf = 0;
    const loop = () => {
      pos.current.rx += (pos.current.x - pos.current.rx) * 0.18;
      pos.current.ry += (pos.current.y - pos.current.ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${pos.current.rx}px, ${pos.current.ry}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeaveWindow);
      document.removeEventListener('mouseenter', onEnterWindow);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  );
}
