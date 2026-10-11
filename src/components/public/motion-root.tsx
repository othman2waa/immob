'use client';

import {useEffect, useRef, type ReactNode} from 'react';

export function MotionRoot({children}: {children: ReactNode}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let cleanup = () => {};

    function configure() {
      cleanup();
      if (!element || preference.matches) return;
      const reveals = [...element.querySelectorAll<HTMLElement>('[data-reveal]')];
      const parallax = [...element.querySelectorAll<HTMLElement>('[data-parallax]')];
      let observer: IntersectionObserver | undefined;
      let frame = 0;

      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.remove('reveal-pending');
            observer?.unobserve(entry.target);
          }
        }, {threshold: 0.08, rootMargin: '0px 0px -24px 0px'});
        // Only enhance off-screen content; SSR and no-JS content stay visible.
        for (const target of reveals) {
          if (target.getBoundingClientRect().top > innerHeight * 0.9) {
            target.classList.add('reveal-pending');
            observer.observe(target);
          }
        }
      }

      function update() {
        frame = 0;
        if (!element) return;
        const range = document.documentElement.scrollHeight - innerHeight;
        element.style.setProperty('--scroll-progress', String(range > 0 ? scrollY / range : 0));
        for (const target of parallax) {
          const bounds = target.getBoundingClientRect();
          if (bounds.bottom < 0 || bounds.top > innerHeight) continue;
          const offset = Math.max(-28, Math.min(28, (innerHeight / 2 - bounds.top - bounds.height / 2) * 0.06));
          target.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
        }
      }
      function queueUpdate() {
        if (!frame) frame = requestAnimationFrame(update);
      }
      function exposeFocus(event: FocusEvent) {
        if (event.target instanceof HTMLElement) event.target.closest('.reveal-pending')?.classList.remove('reveal-pending');
      }
      window.addEventListener('scroll', queueUpdate, {passive: true});
      window.addEventListener('resize', queueUpdate, {passive: true});
      element.addEventListener('focusin', exposeFocus);
      update();
      cleanup = () => {
        observer?.disconnect();
        cancelAnimationFrame(frame);
        window.removeEventListener('scroll', queueUpdate);
        window.removeEventListener('resize', queueUpdate);
        element.removeEventListener('focusin', exposeFocus);
        reveals.forEach((target) => target.classList.remove('reveal-pending'));
        parallax.forEach((target) => target.style.removeProperty('--parallax-y'));
      };
    }
    configure();
    preference.addEventListener('change', configure);
    return () => {cleanup(); preference.removeEventListener('change', configure);};
  }, []);

  return <div className="home-shell" ref={root}>{children}</div>;
}
