"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
  completed?: boolean;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  totalSteps,
  className,
  completed = false,
}) => {
  const calculateStepPercent = useCallback(
    (step: number) => {
      if (completed) return 100;
      const basePercent = (step / totalSteps) * 100;
      return Math.min(basePercent, 100);
    },
    [totalSteps, completed]
  );

  const [progress, setProgress] = useState(0);
  const prevStepRef = useRef(currentStep);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Clean up any existing animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Don't animate on initial render
    if (prevStepRef.current === currentStep && progress === 0) {
      setProgress(calculateStepPercent(currentStep));
      prevStepRef.current = currentStep;
      return;
    }

    const targetPercent = calculateStepPercent(currentStep);
    const startPercent = progress;
    const startTime = performance.now();
    const duration = 400; // Animation duration in ms

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic easing function
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Calculate current value
      const current =
        startPercent + (targetPercent - startPercent) * easedProgress;
      setProgress(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    prevStepRef.current = currentStep;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentStep, totalSteps, progress, completed, calculateStepPercent]);

  useEffect(() => {
    const percent = calculateStepPercent(currentStep);
    setProgress(percent);
  }, [currentStep, calculateStepPercent]);

  return (
    <div className={cn("w-full fixed top-20 left-0 z-10", className)}>
      <div className="relative overflow-hidden">
        {/* Base progress bar */}
        <div className="relative">
          <Progress
            value={progress}
            className="h-1.5 rounded-none bg-muted overflow-hidden"
          />

          {/* Flame effect at the edge */}
          <motion.div
            className="absolute top-0 right-0 h-1.5 w-12 bg-gradient-to-l from-transparent via-white/70 to-white blur-[2px]"
            animate={{
              x: [-2, -5, -2],
              opacity: [0.7, 1, 0.7],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 1.0,
              repeat: Infinity,
              repeatType: "mirror",
            }}
            style={{ right: `${100 - progress}%` }}
          />

          {/* Additional glow behind the flame */}
          <motion.div
            className="absolute top-0 right-0 h-3 w-6 bg-gradient-to-l from-transparent to-white/40 blur-[3px]"
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "mirror",
            }}
            style={{ right: `${100 - progress}%` }}
          />

          {/* Subtle pulse effect along the whole filled bar */}
          <motion.div
            className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-primary/80 to-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            style={{ width: `${progress}%` }}
          >
            <motion.div
              className="absolute inset-0 bg-white/20 blur-[0.5px]"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StepProgressBar;
