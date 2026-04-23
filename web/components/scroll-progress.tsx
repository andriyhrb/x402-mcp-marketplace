'use client';

import { useEffect } from 'react';

export function ScrollProgress() {
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const h = doc.scrollHeight - doc.clientHeight;
      const p = h > 0 ? (doc.scrollTop / h) * 100 : 0;
      doc.style.setProperty('--scroll', `${p}%`);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <div className="scroll-progress" aria-hidden />;
}
