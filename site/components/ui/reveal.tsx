"use client";

import { useEffect, useRef } from "react";
import type { ElementType, ReactNode, Ref } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  y?: number;
  delay?: number;
  className?: string;
};

/**
 * Small scroll-reveal wrapper used sparingly across the site. Fully honours
 * prefers-reduced-motion: when set, the content is rendered directly in its
 * final state and GSAP never runs, rather than animating a "reduced" motion.
 */
export function Reveal({ children, as: Tag = "div", y = 24, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [y, delay]);

  const Component = Tag as ElementType;
  return (
    <Component ref={ref as Ref<HTMLElement>} className={className}>
      {children}
    </Component>
  );
}
