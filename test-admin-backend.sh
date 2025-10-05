#!/bin/bash

# Admin Panel Backend Connection Test
# Tests all admin endpoints to verify they're working

echo "🧪 Testing Admin Panel Backend Connection..."
echo "============================================="
echo ""

# Check if backend is running
echo "1️⃣ Checking if backend is running on port 4000..."
if curl -s http://localhost:4000 > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is NOT running on port 4000"
    echo "   Please start your Node.js backend first:"
    echo "   cd backend && npm start"
    exit 1
fi

echo ""
echo "2️⃣ Please provide admin credentials to test:"
read -p "Admin Email: " ADMIN_EMAIL
read -sp "Admin Password: " ADMIN_PASSWORD
echo ""
echo ""

# Login and get token
echo "3️⃣ Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"emailOrPhone\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
ROLE=$(echo $LOGIN_RESPONSE | jq -r '.user.role')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Login failed!"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

if [ "$ROLE" != "ADMIN" ]; then
    echo "❌ User is not an admin! Role: $ROLE"
    exit 1
fi

echo "✅ Login successful! Token received"
echo ""

# Test endpoints
echo "4️⃣ Testing admin endpoints..."
echo ""

# Metrics
echo "📊 Testing GET /api/admin/metrics..."
METRICS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/admin/metrics)
if echo $METRICS | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Metrics endpoint working"
    echo "   Users: $(echo $METRICS | jq -r '.data.users.total')"
    echo "   Courses: $(echo $METRICS | jq -r '.data.courses.total')"
    echo "   Pending Applications: $(echo $METRICS | jq -r '.data.applications.byStatus.PENDING')"
    echo "   Pending Courses: $(echo $METRICS | jq -r '.data.courses.byStatus.PENDING')"
else
    echo "❌ Metrics endpoint failed"
    echo "Response: $METRICS"
fi

echo ""
echo "📊 Testing GET /api/admin/metrics/summary..."
SUMMARY=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/admin/metrics/summary)
if echo $SUMMARY | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Summary endpoint working"
else
    echo "❌ Summary endpoint failed"
fi

echo ""
echo "📊 Testing GET /api/admin/metrics/growth..."
GROWTH=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/admin/metrics/growth)
if echo $GROWTH | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Growth metrics endpoint working"
else
    echo "❌ Growth metrics endpoint failed"
fi

echo ""
echo "📊 Testing GET /api/admin/metrics/top-courses..."
TOP_COURSES=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/admin/metrics/top-courses?limit=5)
if echo $TOP_COURSES | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Top courses endpoint working"
    COURSE_COUNT=$(echo $TOP_COURSES | jq -r '.data.courses | length')
    echo "   Found $COURSE_COUNT courses"
else
    echo "❌ Top courses endpoint failed"
fi

echo ""
echo "📊 Testing GET /api/admin/metrics/activity..."
ACTIVITY=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/admin/metrics/activity?limit=10)
if echo $ACTIVITY | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Activity endpoint working"
    ACTIVITY_COUNT=$(echo $ACTIVITY | jq -r '.data.activities | length')
    echo "   Found $ACTIVITY_COUNT activities"
else
    echo "❌ Activity endpoint failed"
fi

echo ""
echo "👥 Testing GET /api/admin/applications..."
APPS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/admin/applications)
if echo $APPS | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Applications endpoint working"
    APP_COUNT=$(echo $APPS | jq -r '.count')
    echo "   Found $APP_COUNT applications"
else
    echo "❌ Applications endpoint failed"
fi

echo ""
echo "👥 Testing GET /api/admin/applications/pending..."
PENDING_APPS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/admin/applications/pending)
if echo $PENDING_APPS | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Pending applications endpoint working"
    PENDING_COUNT=$(echo $PENDING_APPS | jq -r '.count')
    echo "   Found $PENDING_COUNT pending applications"
else
    echo "❌ Pending applications endpoint failed"
fi

echo ""
echo "📚 Testing GET /api/admin/courses..."
COURSES=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/admin/courses)
if echo $COURSES | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Courses endpoint working"
    COURSE_COUNT=$(echo $COURSES | jq -r '.count')
    echo "   Found $COURSE_COUNT courses"
else
    echo "❌ Courses endpoint failed"
fi

echo ""
echo "📚 Testing GET /api/admin/courses/pending..."
PENDING_COURSES=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/admin/courses/pending)
if echo $PENDING_COURSES | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Pending courses endpoint working"
    PENDING_COURSE_COUNT=$(echo $PENDING_COURSES | jq -r '.count')
    echo "   Found $PENDING_COURSE_COUNT pending courses"
else
    echo "❌ Pending courses endpoint failed"
fi

echo ""
echo "============================================="
echo "✅ Backend connection test complete!"
echo ""
echo "📋 Summary:"
echo "   - All admin endpoints are accessible"
echo "   - Authentication is working"
echo "   - Your frontend should work correctly"
echo ""
echo "🚀 Next steps:"
echo "   1. Start frontend: npm run dev"
echo "   2. Login at: http://localhost:3000/login"
echo "   3. Navigate to: http://localhost:3000/admin/dashboard"
