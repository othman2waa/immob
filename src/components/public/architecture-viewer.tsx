'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import {useEffect, useRef, useState} from 'react';
import {useReducedMotion} from '@/lib/motion/reduced-motion';

export type ViewerLabels = {
  loading: string; description: string; fallback: string; inspiration: string;
  rotateLeft: string; rotateRight: string; zoomIn: string; zoomOut: string;
  reset: string; pause: string; play: string; instructions: string; noScript: string;
};
const Scene = dynamic(() => import('./architecture-scene'), {
  ssr: false,
  loading: () => <div className="viewer-loading-mark" aria-hidden="true"><span /><span /><span /></div>
});

export function ArchitectureViewer({labels}: {labels: ViewerLabels}) {
  const container = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const target = container.current;
    if (!target) return;
    if (!('IntersectionObserver' in window)) {
      const frame = requestAnimationFrame(() => setNearViewport(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {setNearViewport(true); observer.disconnect();}
    }, {rootMargin: '240px'});
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return <div className="architecture-viewer" ref={container} data-testid="architecture-viewer">
    <div className="viewer-placeholder">
      <Image src="/images/hero-villa.webp" alt="" fill sizes="(min-width: 1100px) 1100px, 100vw" />
      <span>{labels.loading}</span>
    </div>
    {nearViewport && <Scene labels={labels} reducedMotion={reducedMotion} />}
    <noscript><p className="viewer-no-script">{labels.noScript}</p></noscript>
    <div className="viewer-caption"><span className="viewer-dot" /><span>{labels.inspiration}</span></div>
  </div>;
}
