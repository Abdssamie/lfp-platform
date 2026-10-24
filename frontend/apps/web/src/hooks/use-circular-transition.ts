"use client";

import { useRef, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";

interface CircularTransitionHook {
  startTransition: (coords: { x: number; y: number }, callback: () => void) => void;
  toggleTheme: (event: React.MouseEvent) => void;
  isTransitioning: () => boolean;
}

export function useCircularTransition(): CircularTransitionHook {
  const { resolvedTheme, setTheme } = useTheme();
  const isTransitioningRef = useRef(false);

  const startTransition = useCallback((coords: { x: number; y: number }, callback: () => void) => {
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;

    // Set CSS variables for the circular reveal animation.
    const x = (coords.x / window.innerWidth) * 100;
    const y = (coords.y / window.innerHeight) * 100;

    // Set the CSS variables on document element
    document.documentElement.style.setProperty("--x", `${x}%`);
    document.documentElement.style.setProperty("--y", `${y}%`);

    // Check if View Transitions API is supported
    if ("startViewTransition" in document) {
      const transition = (
        document as Document & {
          startViewTransition: (callback: () => void) => { finished: Promise<void> };
        }
      ).startViewTransition(() => {
        callback();
      });

      transition.finished.finally(() => {
        isTransitioningRef.current = false;
      });
    } else {
      // Fallback for browsers without View Transitions API
      callback();
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 400);
    }
  }, []);

  const toggleTheme = useCallback(
    (event: React.MouseEvent) => {
      // Use the click location as the reveal origin.
      const coords = {
        x: event.clientX,
        y: event.clientY,
      };

      startTransition(coords, () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      });
    },
    [resolvedTheme, setTheme, startTransition],
  );

  const isTransitioning = useCallback(() => {
    return isTransitioningRef.current;
  }, []);

  return {
    startTransition,
    toggleTheme,
    isTransitioning,
  };
}
