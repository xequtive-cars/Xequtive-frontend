# Backend Update Request: Return Type Simplification

## Overview
We have simplified the return booking system by removing the return type selection (wait-and-return vs later-date) and now only accept return date and time directly.

## Changes Made

### Frontend Changes
1. **Removed Return Type Selection**: Eliminated the "Wait & Return" and "Later Date" buttons
2. **Simplified UI**: Now shows only "Return Date" title with date and time pickers
3. **Updated Validation**: Return bookings now only require return date and time (no return type)
4. **Cleaned Up Code**: Removed all `returnType` and `waitDuration` related code

### API Changes Required

#### Before (Old Structure)
```json
{
  "bookingType": "return",
  "returnType": "wait-and-return" | "later-date",
  "waitDuration": 12,  // Only for wait-and-return
  "returnDate": "2024-01-15",  // Only for later-date
  "returnTime": "14:30"  // Only for later-date
}
```

#### After (New Structure)
```json
{
  "bookingType": "return",
  "returnDate": "2024-01-15",  // Always required for return bookings
  "returnTime": "14:30"  // Always required for return bookings
}
```

## Backend Updates Needed

### 1. Remove Return Type Field
- Remove `returnType` field from booking models/schemas
- Remove `waitDuration` field from booking models/schemas
- Update database migrations if needed

### 2. Update Validation
- Return bookings now only require `returnDate` and `returnTime`
- Remove validation for `returnType` and `waitDuration`
- Ensure `returnDate` and `returnTime` are always required for return bookings

### 3. Update Business Logic
- Remove any logic that differentiates between "wait-and-return" and "later-date"
- All return bookings should be treated the same way
- Remove any wait duration calculations or logic

### 4. Update API Endpoints
- Update booking creation endpoints to only accept `returnDate` and `returnTime`
- Update booking update endpoints accordingly
- Update any booking retrieval endpoints to not include `returnType` or `waitDuration`

### 5. Update Documentation
- Update API documentation to reflect the simplified structure
- Update any internal documentation about return booking types

## Migration Strategy

### Database Migration
If you have existing bookings with `returnType` and `waitDuration` fields:
1. Create a migration to remove these columns
2. Ensure existing return bookings still work with just `returnDate` and `returnTime`

### API Versioning
Consider if you need to maintain backward compatibility:
- If yes: Keep old fields as optional for a transition period
- If no: Remove fields immediately and update frontend accordingly

## Testing Checklist

- [ ] Return bookings can be created with only `returnDate` and `returnTime`
- [ ] Return bookings validation works correctly
- [ ] Existing return bookings still function properly
- [ ] API documentation is updated
- [ ] Database migrations run successfully

## Contact
If you have any questions about these changes, please contact the frontend team.

---
**Date**: January 2024  
**Version**: 1.0  
**Status**: Ready for Implementation