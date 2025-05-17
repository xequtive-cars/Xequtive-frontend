"use client";

import React, { ReactNode, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FormTransitionProps {
  children: ReactNode;
  direction?: "forward" | "backward";
  isActive: boolean;
  animationKey?: string;
}

export const FormTransition: React.FC<FormTransitionProps> = ({
  children,
  direction = "forward",
  isActive,
  animationKey,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isActive && (
        <motion.div
          ref={nodeRef}
          key={animationKey || String(direction)}
          initial={{
            opacity: 0,
            y: direction === "forward" ? 15 : -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            position: "absolute",
            opacity: 0,
            y: direction === "forward" ? -15 : 15,
            transition: {
              duration: 0.15,
            },
          }}
          transition={{
            y: { type: "spring", stiffness: 800, damping: 35 },
            opacity: { duration: 0.15 },
          }}
          style={{
            width: "100%",
            left: 0,
            top: 0,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FormTransition;
