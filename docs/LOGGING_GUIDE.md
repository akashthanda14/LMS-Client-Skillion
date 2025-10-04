# 📝 Logging Guide

## Overview

This application uses **Winston** for comprehensive logging with daily log rotation, multiple log levels, and structured logging capabilities.

## Log Levels

The application uses the following log levels (in order of severity):

1. **error** (0) - Error messages (critical issues)
2. **warn** (1) - Warning messages (potential issues)
3. **info** (2) - General information (important events)
4. **http** (3) - HTTP request/response logs
5. **debug** (4) - Detailed debugging information

### Environment-Based Levels

- **Development**: Shows all levels including `debug`
- **Production**: Shows `info`, `warn`, and `error` only

## Log Files

Logs are stored in the `logs/` directory with daily rotation:

```
logs/
├── combined-2025-10-04.log    # All logs
├── error-2025-10-04.log       # Error logs only
└── http-2025-10-04.log        # HTTP request logs
```

### Rotation Policy

- **Max Size**: 20MB per file
- **Retention**:
  - Combined logs: 14 days
  - Error logs: 14 days
  - HTTP logs: 7 days

## Usage

### Import the Logger

```javascript
import logger from './config/logger.js';
```

### Basic Logging

```javascript
// Error logging
logger.error('Database connection failed', { error: err.message });

// Warning logging
logger.warn('Rate limit approaching', { userId: user.id, attempts: 4 });

// Info logging
logger.info('User registered successfully', { userId: user.id, email: user.email });

// HTTP logging
logger.http('GET /api/users', { statusCode: 200, duration: '45ms' });

// Debug logging
logger.debug('Cache hit', { key: 'user:123', ttl: 3600 });
```

### Structured Logging

Always include relevant metadata:

```javascript
logger.info('Order created', {
  orderId: order.id,
  userId: user.id,
  amount: order.amount,
  items: order.items.length,
});
```

### Helper Methods

#### Log Requests
```javascript
logger.logRequest(req, 'Processing payment');
// Logs: method, url, ip, userAgent
```

#### Log Responses
```javascript
const duration = Date.now() - startTime;
logger.logResponse(req, res, duration);
// Logs: method, url, statusCode, duration, ip
```

#### Log Errors
```javascript
try {
  // ... code
} catch (error) {
  logger.logError(error, req);
  // Logs: message, stack, method, url, ip
}
```

#### Log Authentication Events
```javascript
logger.logAuth('login_success', user.id, {
  email: user.email,
  ip: req.ip,
});
```

#### Log Database Operations
```javascript
logger.logDatabase('create', 'User', {
  userId: newUser.id,
  operation: 'insert',
});
```

## Controller Integration

### Example: User Controller

```javascript
import logger from '../config/logger.js';

export const registerUser = async (req, res) => {
  try {
    const { email } = req.body;
    
    logger.info('User registration initiated', { email });
    
    const user = await createUser({ email });
    
    logger.logAuth('registration_success', user.id, {
      email: user.email,
      method: 'email',
    });
    
    res.json({ success: true, userId: user.id });
  } catch (error) {
    logger.logError(error, req);
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Example: Service Layer

```javascript
import logger from '../config/logger.js';

export const createUser = async (userData) => {
  try {
    logger.debug('Creating user', { email: userData.email });
    
    const user = await prisma.user.create({
      data: userData,
    });
    
    logger.logDatabase('create', 'User', {
      userId: user.id,
      email: user.email,
    });
    
    return user;
  } catch (error) {
    logger.error('Failed to create user', {
      error: error.message,
      email: userData.email,
    });
    throw error;
  }
};
```

## Best Practices

### 1. Always Include Context

❌ **Bad:**
```javascript
logger.error('Operation failed');
```

✅ **Good:**
```javascript
logger.error('Payment processing failed', {
  orderId: order.id,
  userId: user.id,
  amount: payment.amount,
  error: err.message,
});
```

### 2. Use Appropriate Log Levels

```javascript
// Error - Something went wrong
logger.error('Database query failed', { error: err.message });

// Warn - Potential issue
logger.warn('API rate limit reached', { userId: user.id });

// Info - Important events
logger.info('User logged in', { userId: user.id });

// HTTP - Request/response
logger.http('POST /api/login', { statusCode: 200 });

// Debug - Detailed information
logger.debug('Cache lookup', { key: cacheKey, hit: true });
```

### 3. Sensitive Data

Never log sensitive information:

❌ **Bad:**
```javascript
logger.info('User login', {
  email: user.email,
  password: user.password, // NEVER!
  creditCard: card.number,  // NEVER!
});
```

✅ **Good:**
```javascript
logger.info('User login', {
  userId: user.id,
  email: user.email,
  last4: card.last4, // Only last 4 digits
});
```

### 4. Error Logging

Always include stack traces for errors:

```javascript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', {
    message: error.message,
    stack: error.stack,
    context: { userId, orderId },
  });
}
```

## HTTP Request Logging

All HTTP requests are automatically logged by the `requestLogger` middleware:

```
2025-10-04 10:30:45 [http]: POST /api/user-auth/login 200
{
  "method": "POST",
  "url": "/api/user-auth/login",
  "statusCode": 200,
  "duration": "145ms",
  "ip": "192.168.1.1"
}
```

## Viewing Logs

### In Development

Logs are displayed in the console with colors:
- 🔴 Red: Errors
- 🟡 Yellow: Warnings
- 🟢 Green: Info
- 🟣 Magenta: HTTP
- 🔵 Blue: Debug

### In Production

Logs are written to files in JSON format for easier parsing:

```bash
# View all logs
tail -f logs/combined-2025-10-04.log

# View errors only
tail -f logs/error-2025-10-04.log

# View HTTP requests
tail -f logs/http-2025-10-04.log

# Search for specific user
grep "userId.*123" logs/combined-2025-10-04.log

# View logs in real-time with formatting
tail -f logs/combined-2025-10-04.log | jq '.'
```

## Log Analysis

### Using jq (JSON processor)

```bash
# Filter by level
cat logs/combined-2025-10-04.log | jq 'select(.level == "error")'

# Filter by timestamp
cat logs/combined-2025-10-04.log | jq 'select(.timestamp > "2025-10-04 10:00:00")'

# Extract specific fields
cat logs/combined-2025-10-04.log | jq '{timestamp, level, message, userId}'

# Count errors by type
cat logs/error-2025-10-04.log | jq -r '.message' | sort | uniq -c
```

## Monitoring Integration

### ELK Stack (Elasticsearch, Logstash, Kibana)

The JSON format makes logs compatible with ELK stack:

1. **Logstash** can read the log files
2. **Elasticsearch** indexes the logs
3. **Kibana** provides visualization

### CloudWatch / Splunk

Logs can be forwarded to cloud logging services:

```javascript
// Add to config/logger.js
import CloudWatchTransport from 'winston-cloudwatch';

transports.push(
  new CloudWatchTransport({
    logGroupName: 'lms-api',
    logStreamName: 'production',
    awsRegion: 'us-east-1',
  })
);
```

## Debugging

### Enable Debug Logs

```bash
# In .env
NODE_ENV=development

# Or temporarily
LOG_LEVEL=debug npm start
```

### Debug Specific Modules

```javascript
// In your code
if (process.env.DEBUG_AUTH) {
  logger.debug('Auth middleware', {
    userId: req.user?.id,
    token: req.headers.authorization?.substring(0, 20) + '...',
  });
}
```

## Performance Considerations

1. **Async Writes**: Winston writes asynchronously to avoid blocking
2. **Log Levels**: Use appropriate levels to reduce I/O in production
3. **Rotation**: Daily rotation prevents large file sizes
4. **Structured Data**: JSON format is efficient for parsing

## Troubleshooting

### Logs Not Appearing

1. Check if `logs/` directory exists
2. Verify file permissions
3. Check disk space
4. Ensure LOG_LEVEL is appropriate

### Console Not Showing Logs

Check `NODE_ENV` in `.env`:
- Development: Shows all logs in console
- Production: Only errors in console

### Log Files Too Large

Adjust rotation settings in `config/logger.js`:
```javascript
maxSize: '10m',  // Reduce from 20m
maxFiles: '7d',  // Reduce retention
```

## Examples

### Authentication Flow

```javascript
// Login attempt
logger.info('Login attempt', { email: user.email, ip: req.ip });

// Success
logger.logAuth('login_success', user.id, {
  email: user.email,
  method: 'password',
});

// Failure
logger.warn('Login failed', {
  email: attemptEmail,
  reason: 'invalid_password',
  ip: req.ip,
});
```

### Database Operations

```javascript
// Query start
logger.debug('Executing query', {
  model: 'User',
  operation: 'findMany',
  filters: { isActive: true },
});

// Query complete
logger.logDatabase('findMany', 'User', {
  count: users.length,
  duration: '25ms',
});
```

### API Integration

```javascript
// External API call
logger.info('Calling payment gateway', {
  orderId: order.id,
  amount: payment.amount,
});

// Response
logger.info('Payment gateway response', {
  orderId: order.id,
  status: response.status,
  duration: '1.2s',
});
```

---

**Related Documentation:**
- [Server Setup](./SETUP.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Architecture](./ARCHITECTURE.md)

**Last Updated**: October 4, 2025
