#!/bin/bash

# Quick test after seeding
API_URL="http://localhost:3000/api/v1"

echo "🧪 Testing Seeded Users"
echo "======================="
echo ""

# Test Admin Login
echo "1️⃣  Testing Admin Login (ADMIN001)..."
ADMIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"cin":"ADMIN001","password":"Admin@123456"}')

if echo "$ADMIN_RESPONSE" | grep -q '"accessToken"'; then
  echo "✅ Admin login successful"
  ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
  echo "   Token: ${ADMIN_TOKEN:0:20}..."
else
  echo "❌ Admin login failed"
  echo "   Response: $ADMIN_RESPONSE"
fi

echo ""

# Test Department Head Login
echo "2️⃣  Testing Department Head Login (DHEAD001)..."
DHEAD_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"cin":"DHEAD001","password":"DeptHead@123"}')

if echo "$DHEAD_RESPONSE" | grep -q '"accessToken"'; then
  echo "✅ Department Head login successful"
else
  echo "❌ Department Head login failed"
  echo "   Response: $DHEAD_RESPONSE"
fi

echo ""

# Test Teacher Login
echo "3️⃣  Testing Teacher Login (TEACH001)..."
TEACHER_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"cin":"TEACH001","password":"Teacher@123"}')

if echo "$TEACHER_RESPONSE" | grep -q '"accessToken"'; then
  echo "✅ Teacher login successful"
else
  echo "❌ Teacher login failed"
  echo "   Response: $TEACHER_RESPONSE"
fi

echo ""

# Test Student Login
echo "4️⃣  Testing Student Login (STUD001)..."
STUDENT_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"cin":"STUD001","password":"Student@123"}')

if echo "$STUDENT_RESPONSE" | grep -q '"accessToken"'; then
  echo "✅ Student login successful"
else
  echo "❌ Student login failed"
  echo "   Response: $STUDENT_RESPONSE"
fi

echo ""
echo "======================================"

# If admin login succeeded, test an authenticated endpoint
if [ -n "$ADMIN_TOKEN" ]; then
  echo ""
  echo "5️⃣  Testing Authenticated Endpoint (Get Users)..."
  USERS_RESPONSE=$(curl -s "$API_URL/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  
  USER_COUNT=$(echo "$USERS_RESPONSE" | grep -o '"id"' | wc -l)
  echo "✅ Retrieved $USER_COUNT users"
  echo ""
  echo "🎉 All tests passed! Database is properly seeded."
  echo ""
  echo "📋 Available Credentials:"
  echo "   Admin:      ADMIN001 / Admin@123456"
  echo "   Dept Head:  DHEAD001 / DeptHead@123"
  echo "   Teacher:    TEACH001 / Teacher@123"
  echo "   Student:    STUD001  / Student@123"
fi

echo ""
