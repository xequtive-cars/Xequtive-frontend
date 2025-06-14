# Backend Changes Required for Simplified Signup Process

## Overview
We have simplified the frontend signup process from 3 steps to 2 steps to improve user experience. The signup now only requires email and password, with name and phone number being collected later through the booking form or profile page.

## Changes Needed in Backend API

### 1. Update `/api/auth/signup` Endpoint

The signup endpoint should be updated to make `fullName` and `phone` fields **optional** instead of required.

#### Current Request Body (causing 400 errors):
```json
{
  "fullName": "",  // Empty string - currently causing validation errors
  "email": "user@example.com",
  "phone": "",     // Empty string - currently causing validation errors  
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### Required Changes:
1. **Make `fullName` field optional** - allow empty string or null
2. **Make `phone` field optional** - allow empty string or null
3. **Update validation rules** to not require these fields during signup
4. **Ensure user account creation succeeds** even with empty name/phone

#### Updated Validation Rules:
```javascript
// Example validation schema changes needed
{
  fullName: { 
    type: String, 
    required: false,  // Changed from true to false
    default: ""       // Allow empty string
  },
  phone: { 
    type: String, 
    required: false,  // Changed from true to false
    default: ""       // Allow empty string
  },
  email: { 
    type: String, 
    required: true,   // Still required
    unique: true
  },
  password: { 
    type: String, 
    required: true    // Still required
  }
}
```

### 2. Add `/api/auth/update-profile` Endpoint

We need a new endpoint to handle profile updates after signup:

#### Endpoint: `PUT /api/auth/update-profile`
#### Request Body:
```json
{
  "fullName": "John Doe",           // Optional
  "phoneNumber": "+1234567890",     // Optional  
  "notifications": {                // Optional
    "email": true,
    "sms": false
  }
}
```

#### Response:
```json
{
  "success": true,
  "data": {
    "uid": "user_id",
    "email": "user@example.com", 
    "displayName": "John Doe",
    "phoneNumber": "+1234567890",
    "role": "user"
  }
}
```

### 3. Update User Profile Flow

#### Current Flow (Broken):
1. User signs up → 400 error due to empty name/phone
2. User cannot create account

#### New Flow (Required):
1. User signs up with email/password → Account created successfully
2. User can optionally update profile later via:
   - Profile page (`/dashboard/profile`)
   - Booking form (when name/phone are required for booking)

### 4. Booking Form Integration

The booking form will collect missing profile information when needed:
- If user has no name → collect in booking form
- If user has no phone → collect in booking form  
- Save this information to user profile for future use

## Benefits of This Approach

1. **Improved Conversion Rate**: Shorter signup process reduces abandonment
2. **Better UX**: Users can start using the app immediately
3. **Flexible Data Collection**: Collect information when actually needed
4. **Progressive Profiling**: Build user profile over time

## Testing

After implementing these changes, test:
1. Signup with empty name/phone should succeed
2. Profile update endpoint should work correctly
3. Booking form should collect missing information
4. Navbar notifications should disappear when profile is complete

## Priority

**HIGH PRIORITY** - This is currently blocking user signups and causing 400 errors.

Please implement these changes as soon as possible to restore signup functionality. 