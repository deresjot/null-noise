"use client";

import { useEffect, useRef } from "react";

export function RatingFormGuard() {
  const renderedAtRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renderedAtRef.current) {
      renderedAtRef.current.value = String(Date.now());
    }
  }, []);

  return <input ref={renderedAtRef} type="hidden" name="renderedAt" defaultValue="" />;
}
