import Image from "next/image";
import QuickBookingForm from "@/components/home/QuickBookingForm";
import { DashboardForm } from "@/components/home/DashboardForm";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="pt-20 pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20 px-4 md:px-6 space-y-8 md:space-y-12 flex flex-col items-center bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-5"></div>
      <div className="text-center space-y-4 max-w-[800px] z-10">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          Premium Executive Transport
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          Premium Car Booking Service
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mx-auto max-w-[600px] leading-relaxed">
        Experience reliable, comfort transportation with premium vehicle options.
        </p>
      </div>

      {/* Forms Container */}
      <div className="w-full max-w-5xl mx-auto z-10">
        {isAuthenticated ? (
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <QuickBookingForm isAuthenticated={isAuthenticated} />
            <DashboardForm />
          </div>
        ) : (
          <div className="flex justify-center">
            <QuickBookingForm isAuthenticated={isAuthenticated} />
          </div>
        )}
      </div>

      <div className="relative mt-24 md:mt-32 lg:mt-40 w-full max-w-5xl mx-auto aspect-[16/9] rounded-xl border shadow-md overflow-hidden z-0">
        <Image
          src="https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Luxury executive car"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
          <div className="text-white text-xl font-medium">
            Premium Transportation Experience
          </div>
        </div>
      </div>
    </section>
  );
}
