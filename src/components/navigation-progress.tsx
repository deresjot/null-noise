"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isModifiedClick(event: MouseEvent): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function isSameDocumentNavigation(targetUrl: URL, currentUrl: URL): boolean {
  return (
    targetUrl.origin === currentUrl.origin &&
    targetUrl.pathname === currentUrl.pathname &&
    targetUrl.search === currentUrl.search &&
    targetUrl.hash !== currentUrl.hash
  );
}

function shouldTrackUrl(targetUrl: URL): boolean {
  const currentUrl = new URL(window.location.href);

  return (
    targetUrl.origin === currentUrl.origin &&
    !isSameDocumentNavigation(targetUrl, currentUrl) &&
    (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search)
  );
}

function restoreReloadFocusAfterHydration() {
  const navigation = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  const isReload = navigation ? navigation.type === "reload" : performance.navigation?.type === 1;

  if (!isReload) {
    return;
  }

  const storageKey = `null-noise:last-focus:${window.location.pathname}${window.location.search}${window.location.hash}`;
  let saved: { signature?: string } | null = null;

  try {
    saved = JSON.parse(window.sessionStorage.getItem(storageKey) || "null");
  } catch {
    saved = null;
  }

  if (!saved?.signature) {
    return;
  }

  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "summary",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  const getSignature = (element: HTMLElement) =>
    [
      element.tagName,
      element.getAttribute("href") || "",
      element.getAttribute("name") || "",
      element.getAttribute("type") || "",
      element.textContent ? element.textContent.trim().replace(/\s+/g, " ").slice(0, 80) : "",
    ].join("|");
  const getFocusables = (): HTMLElement[] =>
    Array.from(document.querySelectorAll(focusableSelector)).filter((element): element is HTMLElement => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }

      return !element.hidden && !element.closest("[hidden]") && element.tabIndex >= 0;
    });

  let attempt = 0;
  const restore = () => {
    const target = getFocusables().find((element) => getSignature(element) === saved.signature);

    if (target instanceof HTMLElement) {
      target.focus({ preventScroll: false });
    }

    attempt += 1;
    if (attempt < 12) {
      window.setTimeout(restore, 100);
    }
  };

  window.setTimeout(restore, 100);
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isInteractionPending, setIsInteractionPending] = useState(false);
  const [activeRouteRequests, setActiveRouteRequests] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const isNavigating = isInteractionPending || activeRouteRequests > 0;

  useEffect(() => {
    window.queueMicrotask(() => {
      setIsInteractionPending(false);
    });

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    document.documentElement.dataset.navigationProgressReady = "true";
    restoreReloadFocusAfterHydration();

    const start = () => {
      setIsInteractionPending(true);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setIsInteractionPending(false);
        timeoutRef.current = null;
      }, 8000);
    };

    const shouldTrackRouteRequest = (input: RequestInfo | URL): boolean => {
      const rawUrl =
        input instanceof Request
          ? input.url
          : input instanceof URL
            ? input.toString()
            : typeof input === "string"
              ? input
              : "";

      if (!rawUrl) {
        return false;
      }

      const requestUrl = new URL(rawUrl, window.location.href);

      return requestUrl.origin === window.location.origin && requestUrl.searchParams.has("_rsc");
    };

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init) => {
      const shouldTrack = shouldTrackRouteRequest(input);

      if (shouldTrack) {
        setActiveRouteRequests((current) => current + 1);
      }

      try {
        return await originalFetch(input, init);
      } finally {
        if (shouldTrack) {
          setActiveRouteRequests((current) => Math.max(0, current - 1));
        }
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) {
        return;
      }

      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;

      if (!(target instanceof HTMLAnchorElement) || target.target || target.download) {
        return;
      }

      const targetUrl = new URL(target.href, window.location.href);

      if (shouldTrackUrl(targetUrl)) {
        start();
      }
    };

    const handleSubmit = (event: SubmitEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      const form = event.target;

      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      const method = (form.method || "get").toLowerCase();
      const targetUrl = new URL(form.action || window.location.href, window.location.href);

      if (method === "get" && shouldTrackUrl(targetUrl)) {
        start();
      }
    };

    const handlePopState = () => {
      start();
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      window.removeEventListener("popstate", handlePopState);
      window.fetch = originalFetch;
      delete document.documentElement.dataset.navigationProgressReady;

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className="navigation-progress"
      data-visible={isNavigating ? "true" : "false"}
      role="status"
    >
      <span className="sr-only">{isNavigating ? "Seite wird geladen." : ""}</span>
      <span className="navigation-progress-box" aria-hidden="true">
        <span className="navigation-progress-track">
          <span className="navigation-progress-bar" />
        </span>
        <span className="navigation-progress-label">Seite lädt …</span>
      </span>
    </div>
  );
}
