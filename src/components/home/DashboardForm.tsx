"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function DashboardForm() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  return (
    <div className="w-full max-w-md bg-background rounded-xl border shadow-md overflow-hidden">
      <div className="p-6 relative">
        {/* Vertical connecting line */}
        <div className="absolute left-8 top-16 bottom-16 border-l-2 border-primary/30 z-0"></div>

        <div className="space-y-6">
          {/* Active Bookings button */}
          <div className="relative flex items-start z-10">
            <div className="absolute left-0 top-3 w-6 h-6 rounded-full bg-primary"></div>
            <div className="pl-12 w-full">
              <Button
                variant={activeTab === "active" ? "default" : "outline"}
                className="w-full h-12 rounded-md"
                onClick={() => setActiveTab("active")}
              >
                Active Bookings
              </Button>
            </div>
          </div>

          {/* History button */}
          <div className="relative flex items-start z-10">
            <div className="absolute left-0 top-3 w-6 h-6 rounded-full bg-red-500"></div>
            <div className="pl-12 w-full">
              <Button
                variant={activeTab === "history" ? "default" : "outline"}
                className="w-full h-12 rounded-md"
                onClick={() => setActiveTab("history")}
              >
                History
              </Button>
            </div>
          </div>

          {/* Dashboard button */}
          <div className="pt-2">
            <Link href="/dashboard" className="w-full block">
              <Button
                size="lg"
                className="w-full rounded-md shadow-sm font-medium h-12"
              >
                Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
