"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";

interface TourState {
  isRunning: boolean;
  stepIndex: number;
  isNavigating: boolean;
}

interface TourContextType {
  isTourRunning: boolean;
  tourStepIndex: number;
  isTourNavigating: boolean;
  startTour: () => void;
  stopTour: () => void;
  setTourStepIndex: (index: number) => void;
  setTourNavigating: (isNavigating: boolean) => void;
  setStepIndexAndNavigating: (index: number, isNavigating: boolean) => void;
  checkAutoStart: (pageKey: string) => void;
}

let state: TourState = {
  isRunning: false,
  stepIndex: 0,
  isNavigating: false,
};

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
  getSnapshot(): TourState {
    return state;
  },
  getServerSnapshot(): TourState {
    return { isRunning: false, stepIndex: 0, isNavigating: false };
  },
  startTour() {
    state = { isRunning: true, stepIndex: 0, isNavigating: false };
    emitChange();
  },
  stopTour() {
    state = { isRunning: false, stepIndex: 0, isNavigating: false };
    emitChange();
  },
  setStepIndex(index: number) {
    state = { ...state, stepIndex: index };
    emitChange();
  },
  setNavigating(isNavigating: boolean) {
    state = { ...state, isNavigating };
    emitChange();
  },
  setStepIndexAndNavigating(index: number, isNavigating: boolean) {
    state = { ...state, stepIndex: index, isNavigating };
    emitChange();
  },
  checkAutoStart(pageKey: string) {
    if (typeof window === "undefined" || !pageKey) return;
    const storageKey = `lfp_guide_seen_${pageKey}`;
    try {
      const alreadySeen = localStorage.getItem(storageKey);
      if (
        !alreadySeen &&
        (pageKey === "formation" || pageKey === "cyclers" || pageKey === "btms")
      ) {
        localStorage.setItem(storageKey, "true");
        state = { isRunning: true, stepIndex: 0, isNavigating: false };
        emitChange();
      }
    } catch {
      // In private browsing or storage disabled, proceed gracefully
    }
  },
};

const TourContext = React.createContext<TourContextType | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const tourState = useSyncExternalStore(
    tourStore.subscribe,
    tourStore.getSnapshot,
    tourStore.getServerSnapshot
  );

  const value = React.useMemo<TourContextType>(
    () => ({
      isTourRunning: tourState.isRunning,
      tourStepIndex: tourState.stepIndex,
      isTourNavigating: tourState.isNavigating,
      startTour: tourStore.startTour,
      stopTour: tourStore.stopTour,
      setTourStepIndex: tourStore.setStepIndex,
      setTourNavigating: tourStore.setNavigating,
      setStepIndexAndNavigating: tourStore.setStepIndexAndNavigating,
      checkAutoStart: tourStore.checkAutoStart,
    }),
    [tourState]
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
