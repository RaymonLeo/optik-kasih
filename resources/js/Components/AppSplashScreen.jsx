// appV1.0 Rev 1 - Splash screen global untuk navigasi dan pengambilan data Inertia.

import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const MIN_VISIBLE_MS = 420;
const INITIAL_VISIBLE_MS = 520;

export default function AppSplashScreen({ children }) {
  const [visible, setVisible] = useState(true);
  const [label, setLabel] = useState('Menyiapkan sistem...');
  const shownAtRef = useRef(Date.now());
  const hideTimerRef = useRef(null);
  const fallbackTimerRef = useRef(null);

  const clearTimers = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  };

  const showSplash = (nextLabel) => {
    clearTimers();
    shownAtRef.current = Date.now();
    setLabel(nextLabel);
    setVisible(true);

    fallbackTimerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, 12000);
  };

  const hideSplash = () => {
    const elapsed = Date.now() - shownAtRef.current;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);

    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      hideTimerRef.current = null;
    }, remaining);
  };

  useEffect(() => {
    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      hideTimerRef.current = null;
    }, INITIAL_VISIBLE_MS);

    const removeStartListener = router.on('start', () => {
      showSplash('Memuat data...');
    });

    const removeFinishListener = router.on('finish', () => {
      hideSplash();
    });

    return () => {
      clearTimers();
      if (typeof removeStartListener === 'function') {
        removeStartListener();
      }

      if (typeof removeFinishListener === 'function') {
        removeFinishListener();
      }
    };
  }, []);

  return (
    <>
      {children}

      <div
        aria-live="polite"
        aria-busy={visible}
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 px-6 transition-all duration-300 ${
          visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex w-full max-w-xs flex-col items-center text-center">
          <div className="relative mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-2xl shadow-orange-500/20">
            <div className="absolute inset-[-10px] rounded-full border border-orange-300/30 ok-splash-orbit" />
            <img
              src="/images/logo-optik.png"
              alt="Optik Kasih"
              className="h-20 w-20 object-contain"
            />
          </div>

          <p className="text-base font-semibold text-white">Optik Kasih</p>
          <p className="mt-1 text-sm text-slate-300">{label}</p>

          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/5 rounded-full bg-[#E56020] ok-splash-bar" />
          </div>
        </div>
      </div>
    </>
  );
}
