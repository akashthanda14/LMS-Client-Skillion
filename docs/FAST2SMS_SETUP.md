# Fast2SMS Integration Guide

## Overview

This LMS uses **Fast2SMS** for sending OTP SMS messages to users for phone verification, password reset, and other authentication purposes.

## Configuration

### 1. Get Fast2SMS API Key

1. Sign up at [Fast2SMS](https://www.fast2sms.com/)
2. Navigate to your dashboard
3. Go to **API** section
4. Copy your **API Key**

### 2. Environment Variables

Add the following to your `.env` file:

```env
# Fast2SMS Configuration
FAST2SMS_API_KEY=your_api_key_here
```

### 3. Installation

The SMS service uses `axios` for HTTP requests. Make sure it's installed:

```bash
npm install axios
```

## API Routes Used

### OTP Route (Recommended for OTP)
- **Endpoint**: `https://www.fast2sms.com/dev/bulkV2`
- **Method**: POST
- **Route Type**: `otp`
- **Message Format**: "Your OTP: {otp_value}"
- **Use Case**: Registration, login, password reset OTPs

### Quick Route (For Custom Messages)
- **Endpoint**: `https://www.fast2sms.com/dev/bulkV2`
- **Method**: POST
- **Route Type**: `q`
- **Message Format**: Custom message text
- **Use Case**: Notifications, alerts, custom messages

## Usage Examples

### Send OTP

```javascript
import { sendOTP } from './services/smsService.js';

// Send OTP for registration
const result = await sendOTP('9876543210', '123456', 'registration');

// Response
{
  success: true,
  requestId: 'lwdtp7cjyqxvfe9',
  message: 'Message sent successfully'
}
```

### Send Custom SMS

```javascript
import { sendSMS } from './services/smsService.js';

// Send custom notification
const result = await sendSMS(
  '9876543210', 
  'Welcome to our LMS! Your account has been activated.'
);

// Response
{
  success: true,
  requestId: 'abc123xyz',
  message: 'SMS sent successfully'
}
```

### Send Flash SMS

```javascript
import { sendFlashSMS } from './services/smsService.js';

// Send flash SMS (appears directly on screen)
const result = await sendFlashSMS(
  '9876543210', 
  'Urgent: Your session will expire in 5 minutes!'
);
```

## Phone Number Format

Fast2SMS accepts Indian mobile numbers (10 digits):

- ✅ **Correct**: `9876543210`
- ✅ **Auto-cleaned**: `+919876543210` → `9876543210`
- ✅ **Auto-cleaned**: `+91-9876543210` → `9876543210`
- ❌ **Invalid**: `12345` (less than 10 digits)

The service automatically:
1. Removes all non-numeric characters
2. Takes the last 10 digits
3. Validates the format

## Development Mode

If `FAST2SMS_API_KEY` is not configured:

```javascript
// Console output in development
⚠️  Fast2SMS not configured. Would send OTP 123456 to 9876543210
📱 [DEV MODE] SMS OTP for 9876543210: 123456
```

If SMS fails in development mode (`NODE_ENV=development`):

```javascript
// Fallback to console logging
📱 [DEV MODE FALLBACK] SMS OTP for 9876543210: 123456
```

## Error Handling

### Common Errors

1. **Invalid API Key**
   ```json
   {
     "success": false,
     "error": "Invalid authorization key"
   }
   ```

2. **Invalid Phone Number**
   ```json
   {
     "success": false,
     "error": "Invalid phone number format"
   }
   ```

3. **Insufficient Balance**
   ```json
   {
     "success": false,
     "error": "Insufficient balance"
   }
   ```

### Error Response Structure

```javascript
{
  success: false,
  error: 'Error message from Fast2SMS or network error'
}
```

## Fast2SMS API Parameters

### OTP Route Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `authorization` | Yes | Your Fast2SMS API Key |
| `variables_values` | Yes | OTP value (numeric, max 8 digits) |
| `route` | Yes | Use `"otp"` for OTP messages |
| `numbers` | Yes | Phone number(s), comma-separated |
| `flash` | No | Set to `"1"` for flash message (default: `"0"`) |

### Quick Route Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `authorization` | Yes | Your Fast2SMS API Key |
| `message` | Yes | Message text to send |
| `language` | No | Default: `"english"` (auto-detects unicode) |
| `route` | Yes | Use `"q"` for quick messages |
| `numbers` | Yes | Phone number(s), comma-separated |
| `flash` | No | Set to `"1"` for flash message (default: `"0"`) |
| `schedule_time` | No | Future date/time in `YYYY-MM-DD-HH-MM` format |

## Success Response

```json
{
  "return": true,
  "request_id": "lwdtp7cjyqxvfe9",
  "message": [
    "Message sent successfully"
  ]
}
```

## Features

✅ **OTP Route**: Optimized for OTP delivery  
✅ **Quick Route**: Custom message delivery  
✅ **Flash SMS**: Urgent messages (appears on screen)  
✅ **Bulk SMS**: Multiple numbers in single request  
✅ **Auto Phone Cleanup**: Handles country codes automatically  
✅ **Dev Mode Fallback**: Console logging when not configured  
✅ **Error Handling**: Comprehensive error messages  
✅ **Request Tracking**: Returns request ID for each SMS  

## Testing

### Test OTP Sending

```bash
# Create a test script
node -e "
import('./services/smsService.js').then(sms => {
  sms.sendOTP('9876543210', '123456', 'registration')
    .then(result => console.log('Result:', result))
    .catch(err => console.error('Error:', err));
});
"
```

### Test Custom SMS

```bash
node -e "
import('./services/smsService.js').then(sms => {
  sms.sendSMS('9876543210', 'Test message from LMS')
    .then(result => console.log('Result:', result))
    .catch(err => console.error('Error:', err));
});
"
```

## Migration from Twilio

If you're migrating from Twilio:

1. **Remove Twilio Dependencies**
   ```bash
   npm uninstall twilio
   ```

2. **Update Environment Variables**
   ```env
   # Remove these
   # TWILIO_ACCOUNT_SID=xxx
   # TWILIO_AUTH_TOKEN=xxx
   # TWILIO_PHONE_NUMBER=xxx
   
   # Add this
   FAST2SMS_API_KEY=your_api_key_here
   ```

3. **API Compatibility**
   - The `sendOTP()` and `sendSMS()` function signatures remain the same
   - No code changes needed in controllers or routes
   - Drop-in replacement for Twilio

## Cost Comparison

### Fast2SMS Advantages
- ✅ Lower cost per SMS (₹0.15 - ₹0.25 per SMS)
- ✅ No monthly subscription required
- ✅ Indian numbers optimized
- ✅ Faster delivery in India
- ✅ No credit card required for signup

### Twilio Advantages
- ✅ Global coverage
- ✅ More features (voice, video, etc.)
- ✅ Better for international SMS

## Rate Limits

Fast2SMS rate limits depend on your account type:
- **Free accounts**: Limited daily SMS
- **Paid accounts**: Higher limits based on plan
- **Check your dashboard** for current limits

## Support

- **Fast2SMS Dashboard**: https://www.fast2sms.com/dashboard
- **API Documentation**: https://docs.fast2sms.com/
- **Support Email**: Available in dashboard

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for API keys
3. **Rotate API keys** periodically
4. **Monitor usage** in Fast2SMS dashboard
5. **Enable IP whitelisting** if available
6. **Set up alerts** for unusual activity

## Troubleshooting

### SMS not received?

1. Check API key is correct
2. Verify phone number format (10 digits)
3. Check Fast2SMS dashboard for delivery status
4. Ensure sufficient balance
5. Check if number is DND (Do Not Disturb)

### Console shows dev mode?

```bash
# Make sure API key is set
echo $FAST2SMS_API_KEY

# If empty, add to .env
echo "FAST2SMS_API_KEY=your_key_here" >> .env

# Restart server
npm run dev
```

### Error: "Invalid authorization key"?

- Double-check your API key in Fast2SMS dashboard
- Ensure no extra spaces in `.env` file
- Restart your server after updating `.env`

## Environment Example

```env
# Fast2SMS Configuration
FAST2SMS_API_KEY=abcdefghijklmnopqrstuvwxyz1234567890

# Optional: Development mode
NODE_ENV=development
```

## Summary

Fast2SMS is now configured as the SMS provider for this LMS. It provides:
- ✅ Reliable OTP delivery for authentication
- ✅ Custom SMS notifications
- ✅ Cost-effective solution for Indian users
- ✅ Easy integration with existing code
- ✅ Development mode with console fallback
