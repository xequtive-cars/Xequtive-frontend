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
  const [isTranslating, setIsTranslating] = useState(false);

  // Set mounted state for hydration
  useEffect(() => {
    setMounted(true);
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem("language") as "en" | "ar" | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Robust language switching function with retry logic
  const switchLanguage = (lang: string, retryCount = 0) => {
    const maxRetries = 15;
    const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    
    if (selectEl) {
      
      // Set the value
      selectEl.value = lang;
      
      // Trigger multiple events to ensure translation
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      selectEl.dispatchEvent(new Event("input", { bubbles: true }));
      selectEl.dispatchEvent(new Event("click", { bubbles: true }));
      
      // Also try to trigger focus and blur
      selectEl.focus();
      selectEl.blur();
      
      // Verify the change was applied
      if (selectEl.value === lang) {
        return true;
      }
    }
    
    // Alternative method: try to find and click the language option directly
    if (retryCount > 5) {
      const languageOption = document.querySelector(`option[value="${lang}"]`) as HTMLOptionElement;
      if (languageOption) {
        languageOption.selected = true;
        const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement;
        if (selectEl) {
          selectEl.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    }
    
    // If not successful and we haven't exceeded max retries, try again
    if (retryCount < maxRetries) {
      setTimeout(() => {
        switchLanguage(lang, retryCount + 1);
      }, 150);
    } else {
      console.error(`Failed to switch to ${lang} after ${maxRetries} attempts`);
    }
    
    return false;
  };

  const changeLanguage = (newLanguage: "en" | "ar") => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
    setIsTranslating(true);
    
    // Apply RTL/LTR direction to document
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLanguage;
    
    // Add notranslate class to elements that shouldn't be translated
    const elementsToExclude = [
      '.location-dropdown',
      '.reference-number',
      '.price',
      '.currency',
      '.booking-reference',
      '.vehicle-id',
      '.passenger-count',
      '.luggage-count',
      '.distance',
      '.duration',
      '.fare-estimation',
      '.total-price',
      '.hourly-rate',
      '.special-conditions',
      '.airport-fee',
      '.terminal-fee',
      '.platform-selection',
      '.station-selection',
      '.airport-selection',
      '.cruise-terminal-selection',
      '.vehicle-capacity',
      '.vehicle-type',
      '.booking-id',
      '.confirmation-number',
      '.payment-method',
      '.technical-data',
      '.api-data',
      '.coordinates',
      '.postcode',
      '.phone-number',
      '.email-address',
      '.date-time',
      '.time-picker',
      '.date-picker',
      '.map-container',
      '.marker',
      '.route-info',
      '.fare-breakdown',
      '.service-fee',
      '.booking-status',
      '.vehicle-selection',
      '.location-input',
      '.search-results',
      '.dropdown-menu',
      '.popover-content',
      '.select-option',
      '.checkbox-label',
      '.radio-label',
      '.form-label',
      '.input-field',
      '.button-text',
      '.navigation-menu',
      '.footer-links',
      '.social-links',
      '.contact-info',
      '.address',
      '.postal-code',
      '.country-code',
      '.currency-symbol',
      '.decimal-separator',
      '.thousands-separator',
      '.percentage',
      '.unit-measurement',
      '.technical-specs',
      '.vehicle-details',
      '.booking-details',
      '.confirmation-details',
      '.receipt-details',
      '.invoice-details',
      '.payment-details',
      '.billing-details',
      '.shipping-details',
      '.delivery-details',
      '.pickup-details',
      '.dropoff-details',
      '.route-details',
      '.journey-details',
      '.trip-details',
      '.fare-details',
      '.pricing-details',
      '.cost-breakdown',
      '.fee-breakdown',
      '.tax-breakdown',
      '.discount-breakdown',
      '.promo-code',
      '.coupon-code',
      '.voucher-code',
      '.discount-code',
      '.promotional-code',
      '.offer-code',
      '.deal-code',
      '.special-offer',
      '.limited-time-offer',
      '.exclusive-offer',
      '.member-offer',
      '.loyalty-offer',
      '.rewards-offer',
      '.points-offer',
      '.credit-offer',
      '.gift-card',
      '.voucher',
      '.coupon',
      '.discount',
      '.promotion',
      '.deal',
      '.offer',
      '.special',
      '.exclusive',
      '.limited',
      '.member',
      '.loyalty',
      '.rewards',
      '.points',
      '.credit',
      '.gift',
      '.voucher',
      '.coupon',
      '.discount',
      '.promotion',
      '.deal',
      '.offer',
      '.special',
      '.exclusive',
      '.limited',
      '.member',
      '.loyalty',
      '.rewards',
      '.points',
      '.credit',
      '.gift'
    ];
    
    // Add notranslate class to all elements that shouldn't be translated
    elementsToExclude.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.classList.add('notranslate');
        element.setAttribute('translate', 'no');
      });
    });
    
    // Also add notranslate to specific data attributes
    const dataElements = document.querySelectorAll('[data-translate="no"], [data-notranslate="true"]');
    dataElements.forEach(element => {
      element.classList.add('notranslate');
      element.setAttribute('translate', 'no');
    });
    
    // Try immediate translation first
    switchLanguage(newLanguage);
    
    // Also try after a short delay
    setTimeout(() => {
      switchLanguage(newLanguage);
    }, 100);
    
    // And try again after a longer delay
    setTimeout(() => {
      switchLanguage(newLanguage);
    }, 500);
    
    // Hide loading after translation completes
    setTimeout(() => {
      setIsTranslating(false);
    }, 3000);
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={cn("h-9 w-20 bg-muted animate-pulse rounded", className)} />
    );
  }

  return (
    <>
      {/* Loading Screen Overlay */}
      {isTranslating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg p-6 flex flex-col items-center gap-4 shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Translating...</p>
          </div>
        </div>
      )}
      
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
                       <span className="text-sm font-medium notranslate">
                         {language === "en" ? "English" : "العربية"}
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
              <span className="text-sm notranslate">English</span>
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
              <span className="text-sm notranslate">العربية</span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      </div>
    </>
  );
}
