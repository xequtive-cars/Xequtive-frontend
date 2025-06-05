"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export default function CrispChat() {
  useEffect(() => {
    // Configure Crisp with the website ID
    Crisp.configure("697afbaf-af11-43ef-8da5-fb149c3769ee");

    // Optional: Customize Crisp chat settings
    // Note: Removed color theme setting due to type issues

    // Optional: Set user information if available
    // Crisp.user.setEmail("user@example.com");
    // Crisp.user.setNickname("User Name");

    return () => {
      // Removed Crisp.reset() as it's not a standard method
      // Crisp chat will automatically handle cleanup
    };
  }, []);

  return null;
}
