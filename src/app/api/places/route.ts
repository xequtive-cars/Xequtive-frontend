import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // For now, return a mock response
    // In a real implementation, you would search places using a service like Mapbox
    const mockResults = [
      {
        id: "place_1",
        name: "Sample Place 1",
        address: "123 Sample Street, London, UK",
        coordinates: {
          lat: 51.5074,
          lng: -0.1278,
        },
        types: ["establishment"],
      },
      {
        id: "place_2",
        name: "Sample Place 2",
        address: "456 Another Street, London, UK",
        coordinates: {
          lat: 51.5074,
          lng: -0.1278,
        },
        types: ["establishment"],
      },
    ];

    return NextResponse.json({ success: true, data: mockResults });
  } catch (error) {
    console.error("Error searching places:", error);
    return NextResponse.json(
      { error: "Failed to search places" },
      { status: 500 }
    );
  }
} 