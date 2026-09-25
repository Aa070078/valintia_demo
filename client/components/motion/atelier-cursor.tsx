"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AtelierCursorProps {
  className?: string;
}

const emptySubscribe = () => () => {};

function useIsSupportedPointer() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => {
      if (typeof window === "undefined") return false;
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      return !isTouch && !prefersReducedMotion;
    },
    () => false
  );
}

export function AtelierCursor({ className }: AtelierCursorProps) {
  const isSupported = useIsSupportedPointer();
  const [isVisible, setIsVisible] = React.useState(false);
  const [isPointer, setIsPointer] = React.useState(false);
  const [cursorText, setCursorText] = React.useState<string | null>(null);
  const [isClicking, setIsClicking] = React.useState(false);

  // Position references for smooth trailing animation
  const mousePos = React.useRef({ x: -100, y: -100 });
  const trailPos = React.useRef({ x: -100, y: -100 });
  const dotRef = React.useRef<HTMLDivElement>(null);
  const ringRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isSupported) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);

      // Inspect hover target
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest("button, a, input, select, textarea, [role='button'], [data-cursor]");
        if (interactive) {
          setIsPointer(true);
          const customText = interactive.getAttribute("data-cursor-text");
          setCursorText(customText || null);
        } else {
          setIsPointer(false);
          setCursorText(null);
        }
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // RAF Loop for silky smooth trailing ring physics
    let rafId: number;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const updateCursor = () => {
      // Crisp instantaneous dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Smooth damped trailing ring
      trailPos.current.x = lerp(trailPos.current.x, mousePos.current.x, 0.18);
      trailPos.current.y = lerp(trailPos.current.y, mousePos.current.y, 0.18);

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${trailPos.current.x}px, ${trailPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(updateCursor);
    };

    rafId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [isSupported]);

  if (!isSupported) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      aria-hidden="true"
    >
      {/* Precision Inner Dot */}
      <div
        ref={dotRef}
        className={cn(
          "fixed top-0 left-0 w-2 h-2 rounded-full bg-[#1C1917] transition-all duration-150 ease-out",
          isPointer && "scale-50 bg-[#B88460]",
          isClicking && "scale-75 bg-[#503C2C]"
        )}
      />

      {/* Luxury Trailing Halo / Morphing Ring */}
      <div
        ref={ringRef}
        className={cn(
          "fixed top-0 left-0 rounded-full flex items-center justify-center transition-all duration-200 ease-out border border-[#B88460]/40",
          // Default Idle state
          !isPointer && "w-9 h-9 bg-[#B88460]/[0.03]",
          // Hover state on links & buttons
          isPointer && !cursorText && "w-14 h-14 border-[#B88460] bg-[#FAF7F2]/30 backdrop-blur-[2px] shadow-sm",
          // Hover state with bespoke text badge (e.g., "VIEW", "INSPECT")
          cursorText && "w-20 h-20 border-[#1C1917] bg-[#1C1917]/90 text-[#FAF7F2] backdrop-blur-md shadow-lg",
          // Active click state
          isClicking && "scale-90 border-[#503C2C]"
        )}
      >
        {cursorText && (
          <span className="text-[9px] font-mono tracking-widest uppercase font-semibold text-center select-none animate-in fade-in zoom-in-95 duration-150">
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
}
