"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RevealOnScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "fade";
  delayMs?: number;
  durationSec?: number;
  threshold?: number;
  distancePx?: number;
}

export function RevealOnScroll({
  children,
  className,
  direction = "up",
  delayMs = 0,
  durationSec = 0.8,
  threshold = 0.15,
  distancePx = 30,
  ...props
}: RevealOnScrollProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const domRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // If user prefers reduced motion, reveal immediately
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const raf = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (domRef.current) {
              observer.unobserve(domRef.current);
            }
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const currentEl = domRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [threshold]);

  const getInitialTransform = () => {
    switch (direction) {
      case "up":
        return `translate3d(0, ${distancePx}px, 0)`;
      case "down":
        return `translate3d(0, -${distancePx}px, 0)`;
      case "left":
        return `translate3d(${distancePx}px, 0, 0)`;
      case "right":
        return `translate3d(-${distancePx}px, 0, 0)`;
      case "fade":
      default:
        return "translate3d(0, 0, 0)";
    }
  };

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translate3d(0, 0, 0)" : getInitialTransform(),
    transition: `opacity ${durationSec}s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform ${durationSec}s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
    willChange: "opacity, transform",
  };

  return (
    <div ref={domRef} style={style} className={cn(className)} {...props}>
      {children}
    </div>
  );
}
