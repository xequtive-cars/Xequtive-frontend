"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Loading3DProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  showMessage?: boolean;
}

export function Loading3D({ 
  className, 
  size = "md", 
  message = "Loading...", 
  showMessage = true 
}: Loading3DProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3", 
    xl: "w-4 h-4"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      {/* 3D Rotating Cube */}
      <div className="relative">
        <motion.div
          className={cn("relative", sizeClasses[size])}
          animate={{ 
            rotateX: [0, 360],
            rotateY: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            transformStyle: "preserve-3d",
            perspective: "1000px"
          }}
        >
          {/* Cube faces */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-lg shadow-lg transform translate-z-6" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40 rounded-lg shadow-lg transform rotate-y-90 translate-z-6" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-primary/20 rounded-lg shadow-lg transform rotate-x-90 translate-z-6" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-primary/10 rounded-lg shadow-lg transform rotate-y-180 translate-z-6" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg shadow-lg transform rotate-y-270 translate-z-6" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-lg shadow-lg transform rotate-x-270 translate-z-6" />
        </motion.div>

        {/* Orbiting dots */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn(
                "absolute rounded-full bg-primary/60",
                dotSizes[size]
              )}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              style={{
                transformOrigin: `${size === 'xl' ? '48px' : size === 'lg' ? '32px' : size === 'md' ? '24px' : '16px'} center`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Pulsing rings */}
      <div className="absolute">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute border-2 border-primary/20 rounded-full"
            style={{
              width: size === 'xl' ? '120px' : size === 'lg' ? '80px' : size === 'md' ? '60px' : '40px',
              height: size === 'xl' ? '120px' : size === 'lg' ? '80px' : size === 'md' ? '60px' : '40px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Loading message */}
      {showMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <motion.p
            className="text-lg font-medium text-foreground"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {message}
          </motion.p>
          <motion.div
            className="flex justify-center space-x-1 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// Full screen loading overlay
export function Loading3DOverlay({ 
  message = "Signing you in...",
  className 
}: { 
  message?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-background/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-border/50"
      >
        <Loading3D size="lg" message={message} />
      </motion.div>
    </motion.div>
  );
}

// New unified auth loading component with smooth transitions
interface UnifiedAuthLoadingProps {
  stage: "checking" | "redirecting" | "loading-dashboard" | "complete";
  className?: string;
}

export function UnifiedAuthLoading({ 
  stage, 
  className 
}: UnifiedAuthLoadingProps) {
  const [currentMessage, setCurrentMessage] = useState("");

  const messages = {
    checking: "Checking authentication...",
    redirecting: "Signing you in...",
    "loading-dashboard": "Loading dashboard...",
    complete: "Welcome back!"
  };

  useEffect(() => {
    setCurrentMessage(messages[stage]);
  }, [stage]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Beautiful 3D Loading Animation */}
        <Loading3D size="lg" message="" showMessage={false} />

        {/* Smooth message transitions */}
        <div className="h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="text-lg font-medium text-foreground"
            >
              {currentMessage}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress indicator */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ 
              width: stage === "checking" ? "25%" : 
                     stage === "redirecting" ? "50%" : 
                     stage === "loading-dashboard" ? "75%" : "100%" 
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
} 