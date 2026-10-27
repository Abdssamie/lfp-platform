/**
 * Utility helper to activate Radix UI tabs reliably during guided tours.
 * Radix TabsTrigger listens to mousedown (button 0) rather than standard click.
 */
export function activateTourTab(selector: string): Promise<boolean> {
  if (typeof document === "undefined") return Promise.resolve(false);

  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return Promise.resolve(false);

  if (el.getAttribute("data-state") === "active") {
    return Promise.resolve(true);
  }

  // Dispatch full pointer/mouse sequence for Radix UI
  el.focus();
  el.dispatchEvent(
    new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
    })
  );
  el.dispatchEvent(
    new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
    })
  );
  el.click();

  // Return promise that resolves when DOM confirms activation
  return new Promise((resolve) => {
    let attempts = 0;
    const checkActive = () => {
      attempts++;
      if (el.getAttribute("data-state") === "active" || attempts >= 8) {
        resolve(true);
      } else {
        setTimeout(checkActive, 25);
      }
    };
    setTimeout(checkActive, 25);
  });
}

/**
 * Utility helper to ensure the sidebar is expanded so sidebar targets are spotlighted accurately.
 */
export function ensureSidebarOpen(): Promise<boolean> {
  if (typeof document === "undefined") return Promise.resolve(false);

  const target = document.querySelector<HTMLElement>('[data-tour="sidebar-next-workstations"]');
  if (target && target.getBoundingClientRect().width > 0 && target.getBoundingClientRect().height > 0) {
    return Promise.resolve(true);
  }

  // If sidebar is collapsed or on mobile, find trigger and click it
  const trigger = document.querySelector<HTMLButtonElement>(
    '[data-sidebar="trigger"], [data-slot="sidebar-trigger"]'
  );
  if (trigger) {
    trigger.click();
  }

  return new Promise((resolve) => {
    let attempts = 0;
    const checkTarget = () => {
      attempts++;
      const el = document.querySelector<HTMLElement>('[data-tour="sidebar-next-workstations"]');
      if ((el && el.getBoundingClientRect().width > 0) || attempts >= 8) {
        resolve(true);
      } else {
        setTimeout(checkTarget, 30);
      }
    };
    setTimeout(checkTarget, 30);
  });
}
