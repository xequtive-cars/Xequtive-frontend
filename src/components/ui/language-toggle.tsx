"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Languages, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [mounted, setMounted] = useState(false);

  // Set mounted state for hydration
  useEffect(() => {
    setMounted(true);
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem("language") as "en" | "ar" | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // No need to load Google Translate script here since it's loaded globally in layout.tsx

  const changeLanguage = (newLanguage: "en" | "ar") => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
    
    // Apply RTL/LTR direction to document
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLanguage;
    
    // Trigger Google Translate with proper method
    setTimeout(() => {
      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (select) {
        select.value = newLanguage;
        select.dispatchEvent(new Event("change"));
      } else {
        // Fallback: try to trigger translation directly
        const googleTranslateFrame = document.querySelector(".goog-te-banner-frame") as HTMLIFrameElement;
        if (googleTranslateFrame) {
          googleTranslateFrame.contentWindow?.postMessage({
            type: "translate",
            language: newLanguage
          }, "*");
        }
      }
    }, 100);
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={cn("h-9 w-20 bg-muted animate-pulse rounded", className)} />
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Language Popover Button */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 px-3 gap-2",
              "hover:bg-muted/80",
              "focus:ring-2 focus:ring-primary/20"
            )}
          >
            <Languages className="h-4 w-4" />
            <span className="text-sm font-medium">
              {language === "en" ? "EN" : "عربي"}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-32 p-1">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeLanguage("en")}
              className={cn(
                "w-full justify-start h-8 px-2",
                language === "en" && "bg-primary/10 text-primary font-medium"
              )}
            >
              <span className="text-sm">English</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeLanguage("ar")}
              className={cn(
                "w-full justify-start h-8 px-2",
                language === "ar" && "bg-primary/10 text-primary font-medium"
              )}
            >
              <span className="text-sm">عربي</span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Declare global types
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}
