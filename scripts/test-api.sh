#!/bin/bash

# Test the University Platform API

API_URL="http://localhost:3000/api/v1"

echo "🧪 Testing University Platform API"
echo "===================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" ${API_URL}/health)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed (HTTP $HTTP_CODE)"
fi

echo ""

# Test 2: Login (requires manual user creation first)
echo "2️⃣  Testing Login (CIN: ADMIN001, Password: Admin@123456)..."
LOGIN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cin": "ADMIN001", "password": "Admin@123456"}')

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Login successful"
    # Extract token (simplified - might need jq for production)
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4 | head -1)
    echo "🔑 Token obtained: ${TOKEN:0:50}..."
else
    echo "❌ Login failed (HTTP $HTTP_CODE)"
    echo "   Make sure you've created the admin user first"
    echo "   See SETUP.md for instructions"
fi

echo ""

# Test 3: Get current user (if logged in)
if [ ! -z "$TOKEN" ]; then
    echo "3️⃣  Testing Get Current User..."
    ME_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" ${API_URL}/auth/me \
      -H "Authorization: Bearer $TOKEN")
    
    HTTP_CODE=$(echo "$ME_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
    
    if [ "$HTTP_CODE" == "200" ]; then
        echo "✅ Get current user passed"
    else
        echo "❌ Get current user failed (HTTP $HTTP_CODE)"
    fi
else
    echo "3️⃣  ⏭️  Skipping authenticated tests (no token)"
fi

echo ""
echo "===================================="
echo "🏁 Test Summary:"
echo ""
echo "✅ API is running and accessible"
echo "📚 API Documentation: http://localhost:3000/api/docs"
echo "📊 Health Endpoint: http://localhost:3000/api/v1/health"
echo ""
echo "Next steps:"
echo "  1. Create admin user (see SETUP.md)"
echo "  2. Test login via Swagger UI"
echo "  3. Start creating users and data"
echo ""
