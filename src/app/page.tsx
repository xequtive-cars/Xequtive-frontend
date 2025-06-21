"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  ChevronRight,
  Shield,
  Clock,
  Map,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { HeroSection } from "@/components/home/HeroSection";
import { AuthAwareNavigation } from "@/components/auth/AuthAwareNavigation";

function HomeContent() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Set mounted state for hydration
  useEffect(() => {
    setMounted(true);
  }, [pathname]);

  // Render immediately - no more blocking on auth state!
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 md:h-16 items-center justify-between px-4">
          <div className="flex items-center gap-1 md:gap-2">
            <Link href="/" className="flex items-center space-x-1 md:space-x-2 pt-6">
              {/* <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <span className="font-bold text-sm md:text-lg">X</span>
              </div>
              <span className="font-bold text-lg md:text-2xl tracking-tight">
                XEQUTIVE
              </span> */}
              <Image src="/xeq-logo.png" alt="XEQUTIVE" width={120} height={120} />
            </Link>
          </div>
          {/* Only the navigation is auth-aware, everything else renders immediately */}
          <AuthAwareNavigation />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section with Quick Booking Form */}
        <HeroSection isAuthenticated={isAuthenticated} />

        {/* Features Section */}
        <section className="py-20 md:py-28 bg-muted/40 relative">
          <div className="container">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="w-16 h-1 bg-primary mb-6 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Why Choose XEQUTIVE
              </h2>
              <p className="text-xl text-muted-foreground max-w-[600px] leading-relaxed">
                Premium service designed for executives and luxury travelers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  icon: <Shield className="h-8 w-8" />,
                  title: "Transparent Pricing",
                  description:
                    "No hidden fees. Our price calculator ensures you know the exact cost before booking.",
                },
                {
                  icon: <CheckCircle2 className="h-8 w-8" />,
                  title: "Premium Vehicles",
                  description:
                    "Choose from a range of luxury vehicles maintained to the highest standards.",
                },
                {
                  icon: <Clock className="h-8 w-8" />,
                  title: "Professional Drivers",
                  description:
                    "Experienced, professional drivers ensuring a comfortable and safe journey.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-8 bg-background rounded-xl shadow-sm border border-border/40 hover:shadow-md transition-all duration-300"
                >
                  <div className="mb-5 p-4 rounded-full bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vehicle Types Section */}
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="w-16 h-1 bg-primary mb-6 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Our Fleet
              </h2>
              <p className="text-xl text-muted-foreground max-w-[600px] leading-relaxed">
                Choose the perfect vehicle for your needs
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 p-0">
              {[
                {
                  name: "Standard Saloon",
                  image:
                    "/images/front-vehicles/standard-saloon.jpeg",
                  description:
                    "Comfortable transportation with professional service for daily needs.",
                },
                {
                  name: "Executive Saloon",
                  image:
                    "/images/front-vehicles/saloon-mpvs-xeq.jpeg",
                  description:
                    "Premium transportation with enhanced comfort and amenities.",
                },
                {
                  name: "Executive MPV",
                  image:
                    "/images/front-vehicles/saloon-mpvs-xeq.jpeg",
                  description:
                    "Spacious transport for groups with premium service and comfort.",
                },
                {
                  name: "Luxury Vehicle",
                  image:
                    "/images/front-vehicles/vip-luxury.jpeg",
                  description:
                    "Elite transportation experience with the highest level of luxury.",
                },
              ].map((vehicle) => (
                <Card
                  key={vehicle.name}
                  className="overflow-hidden border border-border/40 hover:shadow-lg transition-all duration-500 rounded-xl group"
                >
                  <div className="relative -mt-6 h-42 overflow-hidden">
                    <Image
                      src={vehicle.image}
                      alt={vehicle.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <CardHeader className="p-2 px-5">
                    <CardTitle className="text-xl font-semibold">
                      {vehicle.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-0">
                    <CardDescription className="text-sm leading-relaxed">
                      {vehicle.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="p-2 px-5">
                    <Button
                      variant="outline"
                      className="w-full rounded-md flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300"
                    >
                      Learn More <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-muted/40 relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-5">
            <Image
              src="https://images.unsplash.com/photo-1462396881884-de2c07cb95ed?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Luxury pattern"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="container flex flex-col items-center text-center space-y-8 relative z-10">
            <div className="w-16 h-1 bg-primary mb-2 rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to experience premium travel?
            </h2>
            <p className="text-xl max-w-[600px] text-muted-foreground leading-relaxed">
              Book your first ride today and enjoy the XEQUTIVE difference.
            </p>
            {/* CTA button redirects to appropriate location based on auth state */}
            <Link
              href={isAuthenticated ? "/dashboard/new-booking" : "/auth/signin"}
            >
              <Button
                size="lg"
                className="mt-4 rounded-md px-10 py-6 text-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {isAuthenticated ? "Book a Ride" : "Get Started"}{" "}
                <Map className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/20">
        <div className="container py-12 md:py-16">
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center gap-2">
              {/* <div className="relative w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <span className="font-bold">X</span>
              </div>
              <span className="font-bold text-2xl tracking-tight">
                XEQUTIVE
              </span> */}
              <Image src="/xeq-logo.png" alt="XEQUTIVE" width={120} height={120} />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div>
              <h3 className="text-lg font-semibold mb-5">XEQUTIVE</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-5">Services</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Airport Transfers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Corporate Travel
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Event Transportation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-5">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-5">Contact</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Email Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    +44 78 3105 4649
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} XEQUTIVE. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-background">
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 md:h-16 items-center justify-between px-4">
              <div className="flex items-center gap-1 md:gap-2">
                <Link href="/" className="flex items-center space-x-1 md:space-x-2">
                  {/* <div className="relative w-6 h-6 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <span className="font-bold text-xs md:text-lg">X</span>
                  </div>
                  <span className="font-bold text-base md:text-2xl tracking-tight">
                    XEQUTIVE
                  </span> */}
                  <Image src="/xeq-logo.png" alt="XEQUTIVE" width={120} height={120} />
                </Link>
              </div>
              <nav className="flex items-center gap-5">
                <div className="w-12 h-4 bg-muted animate-pulse rounded"></div>
                <div className="w-16 h-10 bg-muted animate-pulse rounded"></div>
              </nav>
            </div>
          </header>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
