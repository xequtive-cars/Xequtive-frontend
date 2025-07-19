import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");

    if (!placeId) {
      return NextResponse.json(
        { error: "Place ID is required" },
        { status: 400 }
      );
    }

    // For now, return a mock response
    // In a real implementation, you would fetch place details from a service
    const placeDetails = {
      id: placeId,
      name: "Sample Place",
      address: "123 Sample Street, London, UK",
      coordinates: {
        lat: 51.5074,
        lng: -0.1278,
      },
      types: ["establishment"],
      rating: 4.5,
      reviews: 150,
      openingHours: {
        open: true,
        periods: [
          {
            open: { day: 1, time: "0900" },
            close: { day: 1, time: "1700" },
          },
        ],
      },
    };

    return NextResponse.json({ success: true, data: placeDetails });
  } catch (error) {
    console.error("Error fetching place details:", error);
    return NextResponse.json(
      { error: "Failed to fetch place details" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 