"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Extend Window interface to include Tawk.to global object
declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}

export default function TawkToChat() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Tawk.to
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Configure Tawk.to with dark maroon theme
    window.Tawk_API.customStyle = {
      zIndex: 1000,
      visibility: {
        desktop: {
          position: "br", // bottom right
          xOffset: 20,
          yOffset: 20
        },
        mobile: {
          position: "br", // bottom right
          xOffset: 10,
          yOffset: 10
        }
      }
    };

    // Set custom colors for dark maroon theme
    window.Tawk_API.setAttributes = {
      'customColor': '#8B0000', // Dark maroon
      'customBackground': '#8B0000', // Dark maroon background
      'customText': '#FFFFFF', // White text
      'customButton': '#A52A2A', // Lighter maroon for buttons
      'customButtonText': '#FFFFFF' // White button text
    };

    // Customize the chatbot behavior
    window.Tawk_API.onLoad = function() {
      // Remove the default "Here!" message
      window.Tawk_API.setAttributes({
        'customColor': '#8B0000',
        'customBackground': '#8B0000',
        'customText': '#FFFFFF',
        'customButton': '#A52A2A',
        'customButtonText': '#FFFFFF'
      });
      
    };

    // Add the script to document head instead of body
    const script = document.createElement("script");
    script.async = true;
    script.src = 'https://embed.tawk.to/68eceb687f39a0194e38253d/1j7enf526';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    // Add to head instead of body
    document.head.appendChild(script);

    // Add CSS for dark maroon theme (no attention grabber hiding needed)
    const style = document.createElement('style');
    style.textContent = `
      /* Dark maroon theme for Tawk.to */
      #tawk-bubble-container {
        background-color: #8B0000 !important;
      }
      
      .tawk-chat-bubble {
        background-color: #8B0000 !important;
        color: #FFFFFF !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup: Remove Tawk.to script and custom styles
      const tawkScript = document.querySelector('script[src*="embed.tawk.to"]');
      if (tawkScript) {
        tawkScript.remove();
      }
      
      // Remove custom styles
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Effect to show/hide chat widget based on current page
  useEffect(() => {
    // Use CSS to hide/show the widget instead of API methods
    const handleVisibility = () => {
      const tawkWidget = document.querySelector('#tawk-widget') || document.querySelector('.tawk-widget');
      if (tawkWidget) {
        if (pathname === "/dashboard/new-booking") {
          (tawkWidget as HTMLElement).style.display = 'none';
        } else {
          (tawkWidget as HTMLElement).style.display = 'block';
        }
      }
    };

    // Try immediately
    handleVisibility();
    
    // Also try after delays to ensure Tawk.to is fully loaded
    const timeoutId1 = setTimeout(handleVisibility, 1000);
    const timeoutId2 = setTimeout(handleVisibility, 3000);
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, [pathname]);

  return null;
}
