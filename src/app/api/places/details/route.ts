import { NextRequest, NextResponse } from 'next/server';

// Validate environment variables
const googlePlacesApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

if (!googlePlacesApiKey) {
  console.error('CRITICAL: Google Places API key is not set');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('place_id');
  const sessionToken = searchParams.get('sessiontoken');

  if (!placeId) {
    return NextResponse.json({
      success: false,
      error: { message: 'Missing place_id parameter' }
    }, { status: 400 });
  }

  try {
    // Use Google Places Details API to get full place information including coordinates
    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    detailsUrl.searchParams.set('place_id', placeId);
    detailsUrl.searchParams.set('key', googlePlacesApiKey || '');
    detailsUrl.searchParams.set('sessiontoken', sessionToken || '');
    detailsUrl.searchParams.set('fields', 'place_id,name,formatted_address,geometry,types,address_components');

    const detailsResponse = await fetch(detailsUrl.toString());

    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.error('Google Places Details API error:', errorText);
      return NextResponse.json({
        success: false,
        error: { message: 'Failed to fetch place details', details: errorText }
      }, { status: detailsResponse.status });
    }

    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK') {
      return NextResponse.json({
        success: false,
        error: { message: `API Error: ${detailsData.status}`, details: detailsData.error_message }
      }, { status: 400 });
    }

    const place = detailsData.result;
    
    // Extract postcode from address components
    const postcodeComponent = place.address_components?.find((component: any) => 
      component.types.includes('postal_code')
    );
    
    // Extract city from address components
    const cityComponent = place.address_components?.find((component: any) => 
      component.types.includes('locality') || component.types.includes('postal_town')
    );

    // Extract region from address components
    const regionComponent = place.address_components?.find((component: any) => 
      component.types.includes('administrative_area_level_1')
    );

    const placeDetails = {
      id: place.place_id,
      address: place.formatted_address,
      mainText: place.name || place.formatted_address,
      secondaryText: place.formatted_address,
      name: place.name,
      latitude: place.geometry?.location?.lat,
      longitude: place.geometry?.location?.lng,
      coordinates: {
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng
      },
      metadata: {
        primaryType: place.types?.[0],
        placeId: place.place_id,
        postcode: postcodeComponent?.long_name,
        city: cityComponent?.long_name,
        region: regionComponent?.long_name || 'UK'
      }
    };

    return NextResponse.json({
      success: true,
      data: placeDetails
    });

  } catch (error) {
    console.error('Unexpected error in place details fetch:', error);
    return NextResponse.json({
      success: false,
      error: { message: 'Unexpected error fetching place details' }
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 