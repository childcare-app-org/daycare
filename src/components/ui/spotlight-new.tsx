"use client";

import { motion } from 'framer-motion';
import React from 'react';
import { cn } from '~/lib/utils';

type SpotlightNewProps = {
    children: React.ReactNode;
    className?: string;
    gradientFirst?: string;
    gradientSecond?: string;
    gradientThird?: string;
    translateY?: number;
    width?: number;
    height?: number;
    smallWidth?: number;
    duration?: number;
    xOffset?: number;
};

export const SpotlightNew = ({
    children,
    className,
    gradientFirst = "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 85%, .08) 0, hsla(210, 100%, 55%, .02) 50%, hsla(210, 100%, 45%, 0) 80%)",
    gradientSecond = "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .06) 0, hsla(210, 100%, 55%, .02) 80%, transparent 100%)",
    gradientThird = "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .04) 0, hsla(210, 100%, 45%, .02) 80%, transparent 100%)",
    translateY = -350,
    width = 560,
    height = 1380,
    smallWidth = 240,
    duration = 7,
    xOffset = 100,
}: SpotlightNewProps) => {
    return (
        <div
            className={cn(
                "relative flex h-full w-full items-center justify-center overflow-hidden rounded-md bg-white dark:bg-black",
                className
            )}
        >
            {/* Main spotlight - left */}
            <motion.div
                className="pointer-events-none absolute -z-10"
                initial={{ x: -xOffset, y: translateY }}
                animate={{
                    x: [null, xOffset, -xOffset],
                    y: translateY,
                }}
                transition={{
                    duration,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    background: gradientFirst,
                }}
            />

            {/* Secondary spotlight - right */}
            <motion.div
                className="pointer-events-none absolute -z-10"
                initial={{ x: xOffset, y: translateY }}
                animate={{
                    x: [null, -xOffset, xOffset],
                    y: translateY,
                }}
                transition={{
                    duration,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    background: gradientSecond,
                }}
            />

            {/* Small spotlight - center left */}
            <motion.div
                className="pointer-events-none absolute -z-10"
                initial={{ x: -xOffset / 2, y: translateY }}
                animate={{
                    x: [null, xOffset / 2, -xOffset / 2],
                    y: translateY,
                }}
                transition={{
                    duration: duration * 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
                style={{
                    width: `${smallWidth}px`,
                    height: `${height}px`,
                    background: gradientThird,
                }}
            />

            {/* Small spotlight - center right */}
            <motion.div
                className="pointer-events-none absolute -z-10"
                initial={{ x: xOffset / 2, y: translateY }}
                animate={{
                    x: [null, -xOffset / 2, xOffset / 2],
                    y: translateY,
                }}
                transition={{
                    duration: duration * 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
                style={{
                    width: `${smallWidth}px`,
                    height: `${height}px`,
                    background: gradientThird,
                }}
            />

            {children}
        </div>
    );
};

