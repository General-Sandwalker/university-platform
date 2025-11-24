#!/bin/bash

set -e

echo "╔════════════════════════════════════════════════╗"
echo "║  University Platform - Complete Setup & Test  ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")/.."

# Step 1: Make scripts executable
echo "📝 Making scripts executable..."
chmod +x scripts/*.sh
chmod +x backend/scripts/*.sh
echo "✅ Scripts are now executable"
echo ""

# Step 2: Check containers
echo "🐳 Checking Docker containers..."
if ! docker ps | grep -q university_backend; then
    echo "⚠️  Backend container not running, starting services..."
    docker-compose up -d
    echo "⏳ Waiting for services to be ready..."
    sleep 10
else
    echo "✅ Backend container is running"
fi
echo ""

# Step 3: Wait for database
echo "🔍 Checking database connection..."
for i in {1..30}; do
    if docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ Database is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Database failed to start"
        exit 1
    fi
    echo -n "."
    sleep 1
done
echo ""

# Step 4: Seed database
echo "🌱 Seeding database with initial data..."
docker-compose exec -T backend npm run seed
echo ""

# Step 5: Test logins
echo "🧪 Testing all user logins..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

API_URL="http://localhost:3000/api/v1"

# Test Admin
echo -n "  Admin (ADMIN001)... "
ADMIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"cin":"ADMIN001","password":"Admin@123456"}' 2>/dev/null)

if echo "$ADMIN_RESPONSE" | grep -q '"accessToken"'; then
  echo "✅ Success"
  ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
else
  echo "❌ Failed"
fi

# Test Department Head
echo -n "  Dept Head (DHEAD001)... "
DHEAD_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"cin":"DHEAD001","password":"DeptHead@123"}' 2>/dev/null)

if echo "$DHEAD_RESPONSE" | grep -q '"accessToken"'; then
  echo "✅ Success"
else
  echo "❌ Failed"
fi

# Test Teacher
echo -n "  Teacher (TEACH001)... "
TEACHER_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"cin":"TEACH001","password":"Teacher@123"}' 2>/dev/null)

if echo "$TEACHER_RESPONSE" | grep -q '"accessToken"'; then
  echo "✅ Success"
else
  echo "❌ Failed"
fi

# Test Student
echo -n "  Student (STUD001)... "
STUDENT_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"cin":"STUD001","password":"Student@123"}' 2>/dev/null)

if echo "$STUDENT_RESPONSE" | grep -q '"accessToken"'; then
  echo "✅ Success"
else
  echo "❌ Failed"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 6: Test authenticated endpoint
if [ -n "$ADMIN_TOKEN" ]; then
  echo "🔐 Testing authenticated endpoint..."
  USERS_RESPONSE=$(curl -s "$API_URL/users?page=1&limit=10" \
    -H "Authorization: Bearer $ADMIN_TOKEN" 2>/dev/null)
  
  if echo "$USERS_RESPONSE" | grep -q '"data"'; then
    USER_COUNT=$(echo "$USERS_RESPONSE" | grep -o '"id"' | wc -l)
    echo "✅ Retrieved user list successfully (${USER_COUNT} users)"
  else
    echo "⚠️  Could not retrieve users"
  fi
fi

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║            🎉 Setup Complete! 🎉               ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "📋 Login Credentials:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Admin:          ADMIN001 / Admin@123456"
echo "  Dept Head:      DHEAD001 / DeptHead@123"
echo "  Teacher:        TEACH001 / Teacher@123"
echo "  Student:        STUD001  / Student@123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Access Points:"
echo "  • API Documentation: http://localhost:3000/api/docs"
echo "  • Health Check:      http://localhost:3000/api/health"
echo "  • API Base URL:      http://localhost:3000/api/v1"
echo ""
echo "🧪 Next Steps:"
echo "  1. Explore API docs at http://localhost:3000/api/docs"
echo "  2. Run: ./backend/scripts/test-all-endpoints.sh"
echo "  3. Run: ./backend/scripts/test-workflows.sh"
echo ""
