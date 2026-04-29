"use client";

import { motion, type MotionProps } from "motion/react";

import { cn } from "@/lib/utils";

const spring = {
  type: "spring" as const,
  stiffness: 680,
  damping: 54,
  mass: 0.72,
};

export function KineticPage({
  className,
  ...props
}: React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.016, delayChildren: 0.005 },
        },
      }}
      className={cn("space-y-7 motion-reduce:transform-none", className)}
      {...props}
    />
  );
}

export function KineticCard({
  className,
  whileTap,
  transition,
  ...props
}: React.ComponentProps<typeof motion.div> & MotionProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 4 },
        show: { opacity: 1, y: 0, transition: spring },
      }}
      whileTap={whileTap ?? { scale: 0.985 }}
      transition={transition ?? spring}
      className={cn("motion-reduce:transform-none", className)}
      {...props}
    />
  );
}

export function KineticPress({
  className,
  whileTap,
  transition,
  ...props
}: React.ComponentProps<typeof motion.div> & MotionProps) {
  return (
    <motion.div
      whileTap={whileTap ?? { scale: 0.985 }}
      transition={transition ?? spring}
      className={cn("motion-reduce:transform-none", className)}
      {...props}
    />
  );
}
