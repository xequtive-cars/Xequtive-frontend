"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Crisp } from "crisp-sdk-web";

// Extend Window interface to include Crisp global object
declare global {
  interface Window {
    $crisp: {
      push: (command: string[]) => void;
    };
  }
}

export default function CrispChatWrapper() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const pathname = usePathname();

  useEffect(() => {
    // Function to determine current theme
    const updateTheme = () => {
      const htmlElement = document.documentElement;
      const currentTheme = htmlElement.classList.contains("dark")
        ? "dark"
        : "light";
      setTheme(currentTheme);
    };

    // Initial theme check
    updateTheme();

    // Configure Crisp with the website ID
    Crisp.configure("697afbaf-af11-43ef-8da5-fb149c3769ee");

    // Optional: Set initial user properties
    // Uncomment and modify as needed
    // Crisp.user.setEmail("user@example.com");
    // Crisp.user.setNickname("User Name");

    // Observe theme changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          updateTheme();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      // Cleanup observer
      observer.disconnect();

      // Optional cleanup
      try {
        if (window.$crisp) {
          window.$crisp.push(["do", "chat:close"]);
        }
      } catch (error) {
        // Silently handle cleanup error
      }
    };
  }, []);

  // Effect to show/hide chat widget based on current page
  useEffect(() => {
    if (window.$crisp) {
      // Hide chat widget on new-booking page
      if (pathname === "/dashboard/new-booking") {
        window.$crisp.push(["do", "chat:hide"]);
      } else {
        window.$crisp.push(["do", "chat:show"]);
      }
    }
  }, [pathname]);

  // Separate effect for theme changes
  useEffect(() => {
    if (window.$crisp) {
      // Remove the invalid color:text configuration
      // window.$crisp.push(["config", "color:text", "#FFFFFF"]);

      // Ensure valid configuration commands are used
      window.$crisp.push(["config", "color:theme", ["#000000", "#333333"]]);
      // Remove the invalid color:base configuration
      // window.$crisp.push(["config", "color:base", "#000000"]);
    }
  }, [theme]);

  return null;
}
