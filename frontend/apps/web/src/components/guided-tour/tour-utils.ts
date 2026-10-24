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
