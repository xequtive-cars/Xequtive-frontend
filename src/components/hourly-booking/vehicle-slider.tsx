"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Users, Briefcase, Clock, Star } from 'lucide-react';
import { HourlyVehicleOption } from '@/types/hourlyBooking';
import { cn } from '@/lib/utils';

interface VehicleSliderProps {
  vehicles: HourlyVehicleOption[];
  selectedVehicle: HourlyVehicleOption | null;
  onVehicleSelect: (vehicle: HourlyVehicleOption) => void;
  className?: string;
}

export function VehicleSlider({ 
  vehicles, 
  selectedVehicle, 
  onVehicleSelect, 
  className 
}: VehicleSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % vehicles.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!vehicles.length) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No vehicles available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentVehicle = vehicles[currentIndex];

  return (
    <div className={cn("w-full", className)}>
      {/* Vehicle Display */}
      <Card className="overflow-hidden border-2 transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-0">
          {/* Vehicle Image */}
          <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="absolute inset-0 bg-black/5" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🚗</div>
                <p className="text-sm text-muted-foreground">Vehicle Image</p>
              </div>
            </div>
            
            {/* Price Badge */}
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-white/90 text-black font-bold">
                £{currentVehicle.price.amount}
              </Badge>
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Vehicle Details */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">{currentVehicle.name}</h3>
                <p className="text-sm text-muted-foreground">{currentVehicle.description}</p>
              </div>
              <Button
                variant={selectedVehicle?.id === currentVehicle.id ? "default" : "outline"}
                size="sm"
                onClick={() => onVehicleSelect(currentVehicle)}
                className="ml-4"
              >
                {selectedVehicle?.id === currentVehicle.id ? "Selected" : "Select"}
              </Button>
            </div>

            {/* Capacity Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{currentVehicle.capacity.passengers} Passengers</p>
                  <p className="text-xs text-muted-foreground">Maximum capacity</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{currentVehicle.capacity.luggage} Luggage</p>
                  <p className="text-xs text-muted-foreground">Large bags</p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Base Fare:</span>
                <span className="font-medium">£{currentVehicle.price.breakdown?.baseFare}/hour</span>
              </div>
              {currentVehicle.price.breakdown?.timeSurcharge && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Time Surcharge:</span>
                  <span className="font-medium text-amber-600">+£{currentVehicle.price.breakdown.timeSurcharge}</span>
                </div>
              )}
              {currentVehicle.price.breakdown?.equipmentFees && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Equipment Fees:</span>
                  <span className="font-medium text-blue-600">+£{currentVehicle.price.breakdown.equipmentFees}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-lg font-bold">£{currentVehicle.price.amount}</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            {currentVehicle.price.messages && currentVehicle.price.messages.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="space-y-1">
                  {currentVehicle.price.messages.map((message, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-amber-500" />
                      <span className="text-xs text-muted-foreground">{message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dots Indicator */}
      {vehicles.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {vehicles.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentIndex 
                  ? "bg-primary scale-125" 
                  : "bg-muted hover:bg-muted-foreground"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
} 