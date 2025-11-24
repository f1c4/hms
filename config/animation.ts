// utils/components/animation.ts
import { HTMLMotionProps } from "framer-motion";

export const fadeScaleTransition = {
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export const fadeScaleVariants = {
    initial: { opacity: 0, scale: 0.99 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.99 },
};

export type MotionDivProps = HTMLMotionProps<"div">;
