"use client";

import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '~/lib/utils';

type GlowingEffectProps = {
    children: React.ReactNode;
    className?: string;
    blur?: number;
    inactiveZone?: number;
    proximity?: number;
    spread?: number;
    variant?: "default" | "white";
    glow?: boolean;
    disabled?: boolean;
    movementDuration?: number;
    borderWidth?: number;
};

export const GlowingEffect = ({
    children,
    className,
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = "default",
    glow = false,
    disabled = false,
    movementDuration = 2,
    borderWidth = 1,
}: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!containerRef.current || disabled) return;

            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            setMousePosition({ x, y });
            setIsHovered(true);
        },
        [disabled]
    );

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [handleMouseMove, handleMouseLeave]);

    const gradientColors =
        variant === "white"
            ? "rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05), transparent"
            : "rgba(147, 51, 234, 0.4), rgba(124, 58, 237, 0.3), rgba(99, 102, 241, 0.2), transparent";

    const shouldShowGlow = glow || (isHovered && !disabled);

    const containerWidth = containerRef.current?.offsetWidth || 0;
    const containerHeight = containerRef.current?.offsetHeight || 0;
    const radius = Math.max(containerWidth, containerHeight) * inactiveZone;

    return (
        <div
            ref={containerRef}
            className={cn("relative", className)}
        >
            {children}
            {shouldShowGlow && (
                <motion.div
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: movementDuration }}
                    style={{
                        background: `radial-gradient(${spread * 2}px ${spread * 2}px at ${mousePosition.x}px ${mousePosition.y}px, ${gradientColors})`,
                        filter: blur > 0 ? `blur(${blur}px)` : "none",
                        maskImage: `radial-gradient(${radius}px ${radius}px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, transparent ${inactiveZone * 50}%, black ${inactiveZone * 100}%)`,
                        WebkitMaskImage: `radial-gradient(${radius}px ${radius}px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, transparent ${inactiveZone * 50}%, black ${inactiveZone * 100}%)`,
                        border: `${borderWidth}px solid transparent`,
                    }}
                />
            )}
        </div>
    );
};

