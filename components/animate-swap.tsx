// utils/components/AnimatedSwap.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";
import {
  fadeScaleTransition,
  fadeScaleVariants,
  MotionDivProps,
} from "../config/animation";

interface AnimatedSwapProps extends Omit<MotionDivProps, "children"> {
  activeKey: string | number;
  children: ReactNode;
}

export function AnimatedSwap({
  activeKey,
  children,
  ...rest
}: AnimatedSwapProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeScaleVariants}
        transition={fadeScaleTransition}
        {...rest}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
