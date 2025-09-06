import { NextRequest, NextResponse } from "next/server";
import { ukLocationSearchService } from "@/lib/uk-location-search";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("input") || searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'input' or 'q' is required" },
        { status: 400 }
      );
    }

    // Use the enhanced UK location search service
    const searchResponse = await ukLocationSearchService.enhancedSearch(query);

    if (searchResponse.success && searchResponse.data) {
      return NextResponse.json({ 
        success: true, 
        suggestions: searchResponse.data 
      });
    } else {
      return NextResponse.json(
        { error: "Failed to search places", details: searchResponse.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error searching places:", error);
    return NextResponse.json(
      { error: "Failed to search places" },
      { status: 500 }
    );
  }
} 