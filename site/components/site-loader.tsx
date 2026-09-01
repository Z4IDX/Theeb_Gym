"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { src } from "@/lib/media";

const MARK_WIDTH = 288;

/** Nothing may hold the page longer than this, whatever goes wrong. */
const FAILSAFE_MS = 5000;

/**
 * The two knobs worth turning. The first run is the full intro (~2.4s end to
 * end); every route change replays the same beats at ROUTE_CHANGE_SPEED of the
 * length (~1.5s), because an intro you have already watched reads as a delay
 * the second time. Raise either to slow the animation down.
 */
const FIRST_LOAD_SPEED = 1;
const ROUTE_CHANGE_SPEED = 0.6;

/**
 * The wolf mark wipes on, a red rule draws under it, the lockup rises, and the
 * panel lifts away to reveal the page.
 *
 * It runs on first load and again on every route change. The first run is the
 * full intro; route changes get a shorter cut of the same choreography, since
 * an intro you have already sat through reads as a delay the second time.
 *
 * Three rules govern the first run, and none of them are decided here — they
 * are decided by the inline script in `app/[lang]/layout.tsx` before the
 * browser paints, which sets `data-loader="loading"` on <html> only when the
 * intro should play. The overlay is `display: none` by default, so:
 *
 *   - with JavaScript off, the intro never appears and can never strand anyone
 *     behind a panel that has no way to lift;
 *   - under `prefers-reduced-motion`, it is skipped outright rather than played
 *     faster — same call `Reveal` makes;
 *   - it plays once per tab on load, not on every back-navigation.
 *
 * The page content sits in the DOM underneath the whole time. This covers it;
 * it never gates it.
 */
export function SiteLoader({ lockup }: { lockup: string }) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLImageElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const html = document.documentElement;

    // Keyed off the pathname rather than a "has run once" flag, so that React
    // Strict Mode's mount → cleanup → mount in development is recognised as the
    // same first load rather than mistaken for a navigation.
    const isRouteChange =
      prevPathRef.current !== null && prevPathRef.current !== pathname;
    prevPathRef.current = pathname;
    const isFirstRun = !isRouteChange;

    if (isFirstRun) {
      // The pre-paint script decides. If it did not arm us, there is nothing
      // to do — the visitor has seen this already, or does not want motion.
      if (html.dataset.loader !== "loading") return;
    } else {
      // A route change. The pre-paint script has long since run, so the
      // reduced-motion check has to happen here instead.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      html.dataset.loader = "loading";
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      html.dataset.loader = "done";
      try {
        sessionStorage.setItem("theeb:intro", "seen");
      } catch {
        // Private mode / storage disabled. The intro simply replays next load.
      }
    };

    // Whatever happens above — a stalled tween, a thrown error, an image that
    // never decodes — the page is handed back within FAILSAFE_MS.
    const failsafe = window.setTimeout(finish, FAILSAFE_MS);

    let tl: gsap.core.Timeline | undefined;

    const ctx = gsap.context(() => {
      tl = gsap.timeline({ onComplete: finish });

      // Covering is done with a synchronous set, never a tween. A tween needs
      // the ticker to have run at least once, so a dropped first frame would
      // leave the panel transparent and the transition simply missing. This
      // way the cover is guaranteed and only the reveal is animated.
      gsap.set(root, { yPercent: 0, opacity: 1 });

      const scale = isFirstRun ? FIRST_LOAD_SPEED : ROUTE_CHANGE_SPEED;

      tl.fromTo(
        markRef.current,
        { clipPath: "inset(100% 0% 0% 0%)", scale: 1.06, opacity: 0.9 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          scale: 1,
          opacity: 1,
          duration: 1 * scale,
          ease: "power2.out",
        },
      )
        .fromTo(
          ruleRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.5 * scale, ease: "power2.inOut" },
          `-=${0.2 * scale}`,
        )
        .fromTo(
          wordRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6 * scale, ease: "power2.out" },
          `-=${0.3 * scale}`,
        )
        // Exit is deliberately shorter than the entrance — a panel that lingers
        // on the way out is the part that reads as "slow site".
        .to(
          root,
          { yPercent: -100, duration: 0.6 * scale, ease: "power2.inOut" },
          `+=${0.25 * scale}`,
        );
    }, rootRef);

    /**
     * The intro must never hold the page hostage. Any deliberate input — tap,
     * key, scroll — runs it out at speed instead of ignoring the visitor for
     * the remaining second. This is the difference between an intro and a wait.
     */
    const skip = () => {
      if (!tl || tl.progress() === 1) return;
      gsap.to(tl, { timeScale: 6, duration: 0.15, overwrite: true });
    };

    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    for (const type of events) {
      window.addEventListener(type, skip, { passive: true, once: true });
    }

    return () => {
      window.clearTimeout(failsafe);
      for (const type of events) window.removeEventListener(type, skip);
      ctx.revert();
      // Deliberately NOT finishing here. Under React Strict Mode this cleanup
      // runs between two mounts of the same component, and marking the intro
      // done would make the second mount skip it — which is exactly how this
      // animation ended up lasting 0.2s instead of its full length. A genuine
      // unmount is covered by the failsafe above.
    };
  }, [pathname]);

  return (
    <div ref={rootRef} className="site-loader" aria-hidden="true">
      <div className="flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={markRef}
          src={src("wolf-mark", MARK_WIDTH)}
          alt=""
          width={MARK_WIDTH}
          height={MARK_WIDTH}
          className="w-28 sm:w-36"
          fetchPriority="high"
          decoding="sync"
        />
        <span
          ref={ruleRef}
          className="mt-7 block h-px w-24 origin-center bg-blood-hot"
        />
        <span
          ref={wordRef}
          className="font-display mt-6 block text-sm text-bone-dim"
          style={{ letterSpacing: "0.42em", textIndent: "0.42em" }}
        >
          {lockup}
        </span>
      </div>
    </div>
  );
}
