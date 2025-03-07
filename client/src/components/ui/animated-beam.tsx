import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const AnimatedBeam = ({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  endYOffset = 0,
  reverse = false,
  className = '',
  duration = 10,
}) => {
  const pathRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !fromRef.current || !toRef.current) return;

    const container = containerRef.current;
    const from = fromRef.current;
    const to = toRef.current;

    const containerRect = container.getBoundingClientRect();
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();

    const fromX = fromRect.left - containerRect.left + fromRect.width / 2;
    const fromY = fromRect.top - containerRect.top + fromRect.height / 2;
    const toX = toRect.left - containerRect.left + toRect.width / 2;
    const toY = toRect.top - containerRect.top + toRect.height / 2 + endYOffset;

    const controlX = (fromX + toX) / 2;
    const controlY = (fromY + toY) / 2 + curvature;

    const path = `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
    if (pathRef.current) {
      pathRef.current.setAttribute('d', path);
    }
  }, [containerRef, fromRef, toRef, curvature, endYOffset]);

  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      <svg className="h-full w-full">
        <motion.path
          ref={pathRef}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "linear",
          }}
          className="stroke-blue-500/50"
        />
      </svg>
    </div>
  );
}; 