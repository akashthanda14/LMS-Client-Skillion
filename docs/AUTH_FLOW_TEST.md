# Authentication Flow Test Script

This script provides an automated way to test the secure authentication flow implemented in the LMS system.

## Purpose

- Verify the security improvements to the authentication flow
- Test the profile completion flow with secure tokens
- Confirm token-based authorization works correctly
- Validate proper error handling

## Prerequisites

- Node.js installed (v14+)
- npm or yarn
- LMS backend server running locally

## Setup Instructions

1. Install dependencies:

```bash
npm install node-fetch readline chalk
```

2. Run the script:

```bash
node scripts/test-secure-auth-flow.js
```

## What the Script Tests

1. **Registration**: Registers a test user with email
2. **OTP Verification**: Validates the OTP verification flow
3. **Profile Completion**: Tests the secure profile completion with tokens
4. **Login**: Tests the login flow for existing users
5. **Token Refresh**: Verifies the token refresh functionality

## Handling Test Results

The script provides color-coded output to clearly indicate success or failure at each step.

- 🟢 Green text: Successful operations
- 🔵 Blue text: Process steps
- 🟡 Yellow text: Warnings
- 🔴 Red text: Errors

## Troubleshooting

If you encounter errors:

1. Verify the backend server is running
2. Check API endpoint paths match your local setup
3. Confirm the OTP functionality is properly configured
4. Ensure you're using the latest version of the script

## Example Usage

```bash
# Clone the repo and navigate to the project
cd /path/to/lms

# Run the test script
node scripts/test-secure-auth-flow.js

# Follow the interactive prompts to complete the test
```
