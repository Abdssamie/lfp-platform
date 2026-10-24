"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";

interface TourContextType {
  isTourRunning: boolean;
  startTour: () => void;
  stopTour: () => void;
  checkAutoStart: (pageKey: string) => void;
}

let isRunning = false;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export const tourStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot(): boolean {
    return isRunning;
  },
  getServerSnapshot(): boolean {
    return false;
  },
  startTour() {
    isRunning = true;
    emitChange();
  },
  stopTour() {
    isRunning = false;
    emitChange();
  },
  checkAutoStart(pageKey: string) {
    if (typeof window === "undefined" || !pageKey) return;
    const storageKey = `lfp_tour_seen_${pageKey}`;
    try {
      const alreadySeen = localStorage.getItem(storageKey);
      if (!alreadySeen) {
        localStorage.setItem(storageKey, "true");
        isRunning = true;
        emitChange();
      }
    } catch {
      // In private browsing or storage disabled, proceed gracefully
    }
  },
};

const TourContext = React.createContext<TourContextType | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const isTourRunning = useSyncExternalStore(
    tourStore.subscribe,
    tourStore.getSnapshot,
    tourStore.getServerSnapshot
  );

  const value = React.useMemo<TourContextType>(
    () => ({
      isTourRunning,
      startTour: tourStore.startTour,
      stopTour: tourStore.stopTour,
      checkAutoStart: tourStore.checkAutoStart,
    }),
    [isTourRunning]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextType {
  const context = React.useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}
