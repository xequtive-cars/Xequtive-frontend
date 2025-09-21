# 📧 Contact Form Backend Integration Request

## **Overview**
We have created a new contact message form on the frontend that allows users to send messages directly to the support team. We need a backend endpoint to handle these contact form submissions.

---

## **Frontend Implementation** ✅ **COMPLETED**

### **Form Fields**
The contact form includes the following fields:

1. **First Name** (required) - Large input field with placeholder
2. **Last Name** (required) - Large input field with placeholder
3. **Email Address** (required, validated) - Large input field with email validation
4. **Phone Number** (required) - Advanced phone input with country code support
5. **Message** (required, minimum 10 characters) - Large textarea for detailed messages
6. **Terms Agreement** (required) - Custom circular checkbox with maroon theme

### **Layout & Design**
- **Responsive Layout**: 30% contact info, 70% form on desktop
- **Field Layout**: First Name, Last Name, and Phone in one row
- **Field Sizing**: Large fields (h-14) with increased text size (text-lg)
- **Theme**: Maroon color scheme (#8B0000) for buttons and links
- **Custom Checkbox**: Circular design with hover effects and glow

### **Auto-Fill Functionality**
- If user is logged in, the form automatically fills with their profile data
- Users can modify the pre-filled data if needed
- If user is not logged in, fields remain empty

### **Form Validation**
- Client-side validation using Zod schema
- Real-time error messages
- Form submission disabled until all fields are valid
- Advanced phone number validation

---

## **Required Backend Endpoint**

### **Endpoint Details**
```
POST /api/contact/message
```

### **Request Body Schema**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)", 
  "email": "string (required, email format)",
  "phone": "string (required)",
  "message": "string (required, min 10 chars)",
  "agreeToTerms": "boolean (required, must be true)"
}
```

### **Example Request**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+44 7123 456789",
  "message": "I need help with my booking #12345. The driver didn't arrive on time.",
  "agreeToTerms": true
}
```

### **Expected Response**

#### **Success Response (200)**
```json
{
  "success": true,
  "message": "Contact message sent successfully",
  "messageId": "contact_12345"
}
```

#### **Error Response (400/500)**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## **Backend Requirements**

### **1. Data Storage**
- Store contact messages in database
- Include timestamp and user ID (if logged in)
- Generate unique message ID for tracking

### **2. Email Notifications**
- Send email notification to support team
- Include all form data in email
- Use professional email template

### **3. Validation**
- Server-side validation of all fields
- Email format validation
- Phone number format validation
- Message length validation

### **4. Rate Limiting**
- Implement rate limiting to prevent spam
- Suggested: 5 messages per user per hour
- Different limits for logged-in vs anonymous users

### **5. Security**
- Sanitize all input data
- Validate against XSS attacks
- CSRF protection if needed

---

## **Database Schema Suggestion**

```sql
CREATE TABLE contact_messages (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NULL, -- NULL for anonymous users
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  agree_to_terms BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('new', 'in_progress', 'resolved') DEFAULT 'new',
  admin_notes TEXT NULL
);
```

---

## **Email Template Suggestion**

### **Subject**
```
New Contact Message from {firstName} {lastName} - {messageId}
```

### **Body**
```
A new contact message has been received:

Name: {firstName} {lastName}
Email: {email}
Phone: {phone}
Message: {message}

Message ID: {messageId}
Received: {timestamp}
User: {logged in ? "Yes" : "No"}

Please respond to this inquiry within 24 hours.
```

---

## **Testing Checklist**

- [ ] **Form Submission**: Test with valid data
- [ ] **Validation**: Test with invalid data
- [ ] **Auto-fill**: Test with logged-in user
- [ ] **Anonymous**: Test without login
- [ ] **Rate Limiting**: Test spam prevention
- [ ] **Email Notifications**: Verify emails are sent
- [ ] **Database Storage**: Verify data is stored correctly
- [ ] **Error Handling**: Test various error scenarios

---

## **Frontend Integration**

The frontend is already implemented and ready. Once the backend endpoint is available:

1. **Update API URL**: Change from placeholder to actual endpoint
2. **Test Integration**: Verify form submission works
3. **Error Handling**: Ensure proper error messages are shown
4. **Success Flow**: Verify success message and form reset

---

## **Priority**
**High** - This is a core customer support feature that users expect to work immediately.

---

## **Current Implementation Status**

### **✅ Frontend Complete**
- Contact form fully implemented and styled
- Responsive layout with 30%/70% split
- Advanced phone input integration
- Custom circular checkbox with maroon theme
- Form validation and error handling
- Auto-fill functionality for logged-in users
- Professional UI with large, accessible fields

### **🔄 Ready for Backend Integration**
- API endpoint placeholder: `POST /api/contact/message`
- Form submission logic implemented
- Error handling and success messages ready
- All validation schemas defined

### **📋 Next Steps**
1. **Backend Development**: Implement the `/api/contact/message` endpoint
2. **Database Setup**: Create contact_messages table
3. **Email Integration**: Set up email notifications
4. **Testing**: End-to-end testing of form submission
5. **Deployment**: Deploy both frontend and backend changes

---

**Date**: January 2024  
**Version**: 2.0  
**Status**: ✅ Frontend Complete - Ready for Backend Integration  
**Priority**: High - Customer Support Feature
