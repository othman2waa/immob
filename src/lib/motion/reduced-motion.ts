'use client';

import {useSyncExternalStore} from 'react';
function subscribe(callback: () => void) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  preference.addEventListener('change', callback);
  return () => preference.removeEventListener('change', callback);
}
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => matchMedia('(prefers-reduced-motion: reduce)').matches, () => true);
}
