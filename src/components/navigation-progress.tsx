"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
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
  let cancelled = false;
  const cancelPendingRestore = () => {
    cancelled = true;
  };

  document.addEventListener("focusin", cancelPendingRestore, { once: true });

  const restore = () => {
    if (cancelled) {
      return;
    }

    const target = getFocusables().find((element) => getSignature(element) === saved.signature);

    if (target instanceof HTMLElement) {
      document.removeEventListener("focusin", cancelPendingRestore);
      target.focus({ preventScroll: false });
      return;
    }

    attempt += 1;
    if (attempt < 80) {
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
  const [isProgressVisible, setIsProgressVisible] = useState(false);
  const [headerBottom, setHeaderBottom] = useState(0);
  const [progressValue, setProgressValue] = useState(0.08);
  const timeoutRef = useRef<number | null>(null);
  const hideProgressTimeoutRef = useRef<number | null>(null);
  const progressTimeoutRefs = useRef<number[]>([]);
  const previousRouteKeyRef = useRef<string | null>(null);
  const wasNavigatingRef = useRef(false);
  const isNavigating = isInteractionPending || activeRouteRequests > 0;
  const routeKey = `${pathname}?${searchParams.toString()}`;

  const clearProgressTimers = () => {
    progressTimeoutRefs.current.forEach((timer) => window.clearTimeout(timer));
    progressTimeoutRefs.current = [];
  };

  useEffect(() => {
    const measureHeader = () => {
      const header = document.querySelector(".site-header");
      const bottom = header instanceof HTMLElement ? header.getBoundingClientRect().bottom : 0;

      setHeaderBottom(Math.max(0, Math.round(bottom)));
    };

    measureHeader();
    window.addEventListener("resize", measureHeader);
    window.addEventListener("scroll", measureHeader, { passive: true });

    const header = document.querySelector(".site-header");
    const observer =
      header instanceof HTMLElement && "ResizeObserver" in window
        ? new ResizeObserver(measureHeader)
        : null;

    if (header instanceof HTMLElement) {
      observer?.observe(header);
    }

    return () => {
      window.removeEventListener("resize", measureHeader);
      window.removeEventListener("scroll", measureHeader);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (hideProgressTimeoutRef.current) {
      window.clearTimeout(hideProgressTimeoutRef.current);
      hideProgressTimeoutRef.current = null;
    }

    clearProgressTimers();

    const wasNavigating = wasNavigatingRef.current;
    wasNavigatingRef.current = isNavigating;

    if (isNavigating) {
      progressTimeoutRefs.current = [
        window.setTimeout(() => {
          setIsProgressVisible(true);
          setProgressValue(0.12);
        }, 0),
        window.setTimeout(() => setProgressValue(0.36), 90),
        window.setTimeout(() => setProgressValue(0.58), 360),
        window.setTimeout(() => setProgressValue(0.76), 900),
        window.setTimeout(() => setProgressValue(0.88), 1800),
      ];

      return;
    }

    if (wasNavigating || isProgressVisible) {
      progressTimeoutRefs.current = [
        window.setTimeout(() => {
          setIsProgressVisible(true);
          setProgressValue(1);
        }, 0),
      ];
      hideProgressTimeoutRef.current = window.setTimeout(() => {
        setIsProgressVisible(false);
        setProgressValue(0.08);
        hideProgressTimeoutRef.current = null;
      }, 560);
    }

    return () => {
      clearProgressTimers();
    };
  }, [isNavigating, isProgressVisible]);

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
    const previousRouteKey = previousRouteKeyRef.current;
    previousRouteKeyRef.current = routeKey;

    if (previousRouteKey === null || previousRouteKey === routeKey) {
      return;
    }

    window.requestAnimationFrame(() => {
      const hash = window.location.hash;

      if (hash) {
        const targetId = decodeURIComponent(hash.slice(1));
        const target = document.getElementById(targetId);

        if (target instanceof HTMLElement) {
          if (!target.hasAttribute("tabindex")) {
            target.setAttribute("tabindex", "-1");
          }

          target.scrollIntoView({ block: "start", inline: "nearest" });
          target.focus({ preventScroll: true });
        }

        return;
      }

      const main = document.getElementById("main-content");

      window.scrollTo({ left: 0, top: 0, behavior: "auto" });

      if (main instanceof HTMLElement) {
        main.focus({ preventScroll: true });
      }
    });
  }, [routeKey]);

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

      if (hideProgressTimeoutRef.current) {
        window.clearTimeout(hideProgressTimeoutRef.current);
      }

      clearProgressTimers();
    };
  }, []);

  const progressStyle = {
    "--navigation-progress-top": `${headerBottom}px`,
    "--navigation-progress-value": progressValue,
  } as CSSProperties;

  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className="navigation-progress"
      data-visible={isProgressVisible ? "true" : "false"}
      role="status"
      style={progressStyle}
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
