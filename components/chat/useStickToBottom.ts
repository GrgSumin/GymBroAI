"use client";

import { useEffect, useRef } from "react";

/** How far from the bottom (px) still counts as "the user is at the bottom". */
const PIN_THRESHOLD_PX = 80;

function findScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;

  while (current) {
    const { overflowY } = window.getComputedStyle(current);

    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

function prefersReducedMotion() {
  return typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

/**
 * Keeps the scroll container pinned to the bottom as `revision` changes, but
 * only while the user has not scrolled away — scrolling up to read backwards
 * must not be undone by the next streamed token.
 *
 * The scroll container is owned by the page (`<main class="overflow-y-auto">`),
 * so it is resolved from the sentinel ref instead of being created here.
 */
export function useStickToBottom(revision: unknown, enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const pinnedRef = useRef(true);

  useEffect(() => {
    if (!enabled) {
      scrollerRef.current = null;
      return;
    }

    const scroller = findScrollParent(sentinelRef.current);
    scrollerRef.current = scroller;

    if (!scroller) {
      return;
    }

    function handleScroll() {
      if (!scroller) {
        return;
      }

      const distanceFromBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
      pinnedRef.current = distanceFromBottom <= PIN_THRESHOLD_PX;
    }

    handleScroll();
    scroller.addEventListener("scroll", handleScroll, { passive: true });

    return () => scroller.removeEventListener("scroll", handleScroll);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !pinnedRef.current) {
      return;
    }

    const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
    const scroller = scrollerRef.current;

    if (scroller) {
      scroller.scrollTo?.({ top: scroller.scrollHeight, behavior });
      return;
    }

    sentinelRef.current?.scrollIntoView?.({ behavior, block: "end" });
  }, [enabled, revision]);

  return sentinelRef;
}
