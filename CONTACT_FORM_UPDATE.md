# 📧 Frontend Update: Contact Form Inquiry Type Dropdown

## **Overview**
The contact form has been updated with a new inquiry type dropdown to better categorize customer inquiries and improve support efficiency.

---

## **New Inquiry Type Options**

The contact form now includes the following inquiry type options:

### **Dropdown Options:**
1. **Bookings** - General booking inquiries and modifications
2. **Payments** - Payment-related questions and issues
3. **Business Account** - Corporate account setup and management
4. **Event Bookings** - Special event transportation requests
5. **Lost Property** - Lost items and property recovery
6. **Other** - Miscellaneous inquiries not covered above

---

## **Backend Updates Required**

### **1. API Endpoint Update**
The contact form now sends an `inquiryType` field in the request payload:

```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@example.com",
  "inquiryType": "bookings", // NEW FIELD
  "phone": "+447831054649",
  "message": "I need to modify my booking",
  "agreeToTerms": true
}
```

### **2. Database Schema Update**
Add `inquiry_type` column to the contact messages table:

```sql
ALTER TABLE contact_messages 
ADD COLUMN inquiry_type VARCHAR(50) NOT NULL DEFAULT 'other';
```

### **3. Validation Rules**
Update backend validation to accept these inquiry types:

```javascript
const validInquiryTypes = [
  'bookings',
  'payments', 
  'business-account',
  'event-bookings',
  'lost-property',
  'other'
];
```

### **4. Admin Dashboard Updates**
Update the admin dashboard to:
- Display inquiry type in message listings
- Filter messages by inquiry type
- Show inquiry type statistics
- Route messages to appropriate departments

---

## **Frontend Changes Made**

### **Files Updated:**
- `src/components/forms/ContactMessageForm.tsx` - Added dropdown with new options

### **Form Schema Updated:**
```typescript
const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  inquiryType: z.string().min(1, "Please select an inquiry type"), // NEW
  phone: z.string().min(1, "Phone number is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms of service"),
});
```

---

## **Benefits**

### **For Customers:**
- ✅ **Better categorization** of their inquiry
- ✅ **Faster response times** with proper routing
- ✅ **More relevant support** based on inquiry type

### **For Support Team:**
- ✅ **Automatic routing** to appropriate departments
- ✅ **Better organization** of incoming messages
- ✅ **Improved analytics** on inquiry types
- ✅ **Faster response** with pre-categorized messages

---

## **Testing Checklist**

- [ ] **Frontend**: Test all dropdown options work correctly
- [ ] **API**: Verify `inquiryType` field is received by backend
- [ ] **Database**: Confirm new column is created and populated
- [ ] **Validation**: Test backend accepts all valid inquiry types
- [ ] **Admin Dashboard**: Verify inquiry type is displayed and filterable
- [ ] **Email Notifications**: Update email templates to include inquiry type

---

## **Migration Notes**

- **No Breaking Changes**: Existing contact messages will default to 'other' inquiry type
- **Backward Compatible**: Old API calls without `inquiryType` will still work
- **Gradual Rollout**: Can be deployed incrementally

---

## **Example API Response**

```json
{
  "success": true,
  "data": {
    "messageId": "msg_123456789",
    "inquiryType": "bookings",
    "status": "received",
    "estimatedResponseTime": "2-4 hours"
  }
}
```

---

**Date**: January 2024  
**Version**: 1.0  
**Status**: ✅ Ready for Backend Implementation  
**Priority**: Medium - Customer Experience Enhancement
