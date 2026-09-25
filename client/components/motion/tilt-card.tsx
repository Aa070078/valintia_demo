"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number; // max tilt angle in degrees, default 10
  perspective?: number; // perspective in px, default 1000
  glareEffect?: boolean;
  scale?: number; // default 1.02
  containerClassName?: string;
}

export function TiltCard({
  children,
  className,
  maxRotation = 10,
  perspective = 1000,
  glareEffect = true,
  scale = 1.02,
  containerClassName,
  ...props
}: TiltCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = React.useState<React.CSSProperties>({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
    transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
  });
  const [glareStyle, setGlareStyle] = React.useState<React.CSSProperties>({
    opacity: 0,
  });

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles (-maxRotation to +maxRotation)
      const rotateX = ((centerY - y) / centerY) * maxRotation;
      const rotateY = ((x - centerX) / centerX) * maxRotation;

      setTransformStyle({
        transform: `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
        transition: "transform 0.12s ease-out",
        transformStyle: "preserve-3d",
      });

      if (glareEffect) {
        const glarePercentX = (x / rect.width) * 100;
        const glarePercentY = (y / rect.height) * 100;
        setGlareStyle({
          opacity: 0.35,
          background: `radial-gradient(circle at ${glarePercentX.toFixed(1)}% ${glarePercentY.toFixed(1)}%, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 80%)`,
          transition: "opacity 0.2s ease-out",
        });
      }
    },
    [maxRotation, perspective, glareEffect, scale]
  );

  const handleMouseLeave = React.useCallback(() => {
    setTransformStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
      transformStyle: "preserve-3d",
    });
    if (glareEffect) {
      setGlareStyle({
        opacity: 0,
        transition: "opacity 0.5s ease-out",
      });
    }
  }, [perspective, glareEffect]);

  return (
    <div
      className={cn("relative perspective-1000", containerClassName)}
      style={{ perspective: `${perspective}px` }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={transformStyle}
        className={cn(
          "relative will-change-transform preserve-3d transition-[box-shadow,border-color]",
          className
        )}
        {...props}
      >
        {children}

        {/* Dynamic Specular Glare Overlay */}
        {glareEffect && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden mix-blend-overlay"
            style={glareStyle}
          />
        )}
      </div>
    </div>
  );
}
