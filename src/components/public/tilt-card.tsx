'use client';

import {useEffect, useRef, type PointerEvent, type ReactNode} from 'react';

export function TiltCard({children, className = ''}: {children: ReactNode; className?: string}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function reset() {
    cancelAnimationFrame(frame.current);
    ref.current?.style.setProperty('--tilt-x', '0deg');
    ref.current?.style.setProperty('--tilt-y', '0deg');
  }
  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const element = event.currentTarget;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      element.style.setProperty('--tilt-x', `${(-y * 6).toFixed(2)}deg`);
      element.style.setProperty('--tilt-y', `${(x * 6).toFixed(2)}deg`);
    });
  }
  return <div ref={ref} className={`tilt-surface ${className}`} onPointerMove={tilt} onPointerLeave={reset} onPointerCancel={reset}>{children}</div>;
}
