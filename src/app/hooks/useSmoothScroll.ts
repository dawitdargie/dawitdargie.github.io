"use client";

import { useCallback, useEffect, useRef } from "react";
import Lenis from "lenis";

export type ScrollTarget = HTMLElement | string | number;

type ScrollOptions = {
  offset?: number;
};

export function useSmoothScroll(enabled: boolean) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const lenis = new Lenis({
      autoRaf: false,
      autoResize: true,
      smoothWheel: true,
      lerp: 0.09,
      anchors: false,
      syncTouch: false,
    });

    lenisRef.current = lenis;
    let frameId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(raf);
    };

    frameId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  const scrollTo = useCallback((target: ScrollTarget, options: ScrollOptions = {}) => {
    const offset = options.offset ?? -24;
    const lenis = lenisRef.current;

    if (lenis) {
      lenis.scrollTo(target, {
        offset,
        duration: 1.1,
        lock: false,
      });
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = reduceMotion ? "auto" : "smooth";

    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior });
      return;
    }

    const element = typeof target === "string" ? document.querySelector(target) : target;
    element?.scrollIntoView({ behavior, block: "start" });
  }, []);

  return scrollTo;
}
