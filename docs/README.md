# Xequtive Transportation Booking Platform Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Application Structure](#application-structure)
5. [Authentication System](#authentication-system)
6. [Booking Flow](#booking-flow)
   - [Step 1: Journey Details](#step-1-journey-details)
   - [Step 2: Passengers & Luggage](#step-2-passengers--luggage)
   - [Step 3: Vehicle Selection](#step-3-vehicle-selection)
   - [Step 4: Contact Information](#step-4-contact-information)
7. [Maps Integration](#maps-integration)
8. [Form Components](#form-components)
9. [State Management](#state-management)
10. [Styling and UI](#styling-and-ui)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

## Introduction

Xequtive is a premium transportation booking platform designed to provide users with a seamless experience when booking executive and luxury vehicles. The platform offers a streamlined booking process, interactive maps for location selection, dynamic vehicle options, and fare calculation.

This documentation provides a comprehensive guide to the frontend application, explaining its architecture, components, and workflows.

## System Architecture

The Xequtive frontend is built as a client-side rendered Next.js application using the App Router architecture. It communicates with backend services via a RESTful API. The application follows a component-based architecture with state management handled through Redux.

```
Client (Next.js) ↔ API Gateway ↔ Backend Services ↔ Database
```

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **UI Components**: Shadcn UI
- **Maps Integration**: Mapbox
- **Authentication**: Firebase Auth
- **Form Management**: Custom hooks and validation

## Application Structure

The application follows a structured organization:

```
src/
├── app/                  # Next.js app router pages
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # User dashboard pages
│   │   └── new-booking/  # Booking flow
│   └── api/              # API endpoints
├── components/           # React components
│   ├── booking/          # Booking-specific components
│   │   └── common/       # Shared types and utilities
│   ├── map/              # Map-related components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── contexts/             # React contexts (Auth, etc.)
├── lib/                  # Utility libraries
├── store/                # Redux store
│   ├── slices/           # Redux slices
│   └── middleware/       # Redux middleware
├── styles/               # Global styles
└── utils/                # Utility functions
    └── services/         # Service modules for API communication
```

## Authentication System

Xequtive uses Firebase Authentication for user management, with the following features:

- Email/password authentication
- Social authentication (Google)
- Password reset functionality
- User profile management
- Protected routes requiring authentication

The authentication state is managed through a React context provider (`AuthProvider`) that wraps the application and provides authentication methods and state to components.

## Booking Flow

The booking process consists of a four-step workflow, designed to guide users through a seamless booking experience.

### Step 1: Journey Details

The first step in the booking process allows users to enter their journey details.

**Component**: `BookingForm.tsx`

**Features**:

- Pickup location selection with address autocompletion
- Dropoff location selection with address autocompletion
- Multiple stops management (add, remove, reorder)
- Date selection with calendar interface
- Time selection with time picker
- Live map display showing selected locations
- Input validation and error handling

**User Experience**:

1. User enters pickup location (with option to use current location)
2. User enters dropoff location
3. User can add additional stops if needed
4. User selects date and time for the journey
5. User proceeds to the next step

### Step 2: Passengers & Luggage

The second step allows users to specify the number of passengers and luggage items.

**Component**: `PassengerLuggageForm.tsx`

**Features**:

- Passenger count selection (1-8 passengers)
- Checked luggage selection (large bags)
- Hand luggage selection (small bags)
- Visual feedback on selections
- Validation against vehicle capacity

**User Experience**:

1. User selects the number of passengers
2. User specifies the number of large bags (checked luggage)
3. User specifies the number of small bags (hand luggage)
4. User proceeds to the next step

### Step 3: Vehicle Selection

The third step presents users with available vehicle options based on their journey details.

**Component**: `VehicleSelectionContainer.tsx` and `vehicle-selection.tsx`

**Features**:

- Dynamic vehicle options based on journey requirements
- Detailed vehicle information (capacity, features, price)
- Visual indicators for capacity constraints
- Multiple view options (grid or list layout)
- Sorting by price, capacity, or vehicle type
- Estimated arrival time display
- Fare calculation based on distance, time, and vehicle type

**User Experience**:

1. User views available vehicle options with details
2. Vehicles that don't meet capacity requirements are indicated
3. User can see the fare estimate for each vehicle
4. User selects a vehicle
5. User proceeds to the final step

### Step 4: Contact Information

The final step allows users to enter their contact details to complete the booking.

**Component**: `personal-details-form.tsx`

**Features**:

- Contact information form (name, email, phone)
- Special requests field
- Booking summary display
- Terms and conditions agreement
- Form validation with visual feedback
- Booking submission handling

**User Experience**:

1. User reviews the journey details
2. User enters personal information
3. User provides any special requests
4. User agrees to terms and conditions
5. User submits the booking
6. User receives confirmation of booking success

**Note**: The booking confirmation includes vehicle details with images of the vehicle selected, but doesn't include a separate confirmation flow. The booking is completed when the user submits the contact information form.

## Maps Integration

Xequtive integrates with Mapbox for interactive map functionality.

**Component**: `MapComponent.tsx`

**Features**:

- Interactive map display
- Location markers for pickup, dropoff, and stops
- Route visualization between locations
- Distance and duration calculations
- Address geocoding and reverse geocoding
- Mobile-responsive design

**Implementation Details**:

- Uses Mapbox GL JS for map rendering
- Custom markers for different location types
- Optimized route plotting with multiple waypoints
- Automatic map centering and zooming
- Location search with address autocompletion

## Form Components

Xequtive uses a collection of custom form components built on top of Shadcn UI.

### Location Input

**Component**: `UkLocationInput.tsx`

**Features**:

- UK address autocompletion
- Geolocation support
- Custom styling and validation
- Integration with map component

### Date and Time Pickers

**Components**: `DatePicker.tsx` and `TimePicker.tsx`

**Features**:

- Calendar interface for date selection
- Time selection with preset options
- Validation for future dates/times
- Custom styling

### Passenger and Luggage Selection

**Component**: `PassengerLuggageForm.tsx`

**Features**:

- Increment/decrement controls
- Visual feedback
- Validation against vehicle capacity

## State Management

Xequtive uses Redux Toolkit for state management, organizing state into several slices:

### Booking Slice

Manages the core booking data:

- Locations (pickup, dropoff, stops)
- Date and time
- Passenger and luggage counts
- Selected vehicle

### UI Slice

Manages the UI state:

- Current booking step
- Visibility states (map, vehicle options, details form)
- Modal states (success, error)

### API Slice

Manages API interactions:

- Fare calculation requests
- Booking submission
- Loading states and errors

### Hooks

Custom hooks provide a simplified interface to the Redux store:

- `useBooking`: Comprehensive hook for booking-related state and actions
- `useBookingValidation`: Hook for form validation

## Styling and UI

Xequtive uses a consistent styling approach:

### Design System

- **Framework**: Tailwind CSS
- **Component Library**: Shadcn UI
- **Theme**: Custom theme with light and dark mode support
- **Typography**: Geist font family
- **Colors**: Primary brand color with semantic colors for UI elements
- **Spacing**: Consistent spacing system
- **Borders and Shadows**: Subtle shadows and borders for depth

### Responsive Design

- Mobile-first approach
- Layout adjustments for different screen sizes
- Touch-friendly controls for mobile users
- Optimized map experience on smaller screens

## Deployment

The Xequtive frontend is designed for deployment on modern cloud platforms.

### Prerequisites

- Node.js 18+
- Firebase project for authentication
- Mapbox API key

### Environment Variables

Required environment variables:

- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: Mapbox API key
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID
- `NEXT_PUBLIC_API_URL`: Backend API URL

### Build and Deployment

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

### Common Issues

1. **Map Not Loading**

   - Check Mapbox API key
   - Verify network connectivity
   - Check browser console for errors

2. **Authentication Issues**

   - Verify Firebase configuration
   - Check user permissions
   - Clear browser cache and cookies

3. **Form Validation Errors**

   - Ensure all required fields are completed
   - Check format of phone number and email
   - Verify date and time are in the future

4. **Booking Submission Failures**
   - Check network connectivity
   - Verify backend API status
   - Check payload format

### Support

For additional support, contact:

- Technical support: tech@xequtive.com
- Customer service: support@xequtive.com
