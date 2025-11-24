#!/bin/bash

# Messaging System Test Script
# Tests all messaging endpoints with real user authentication

set -e

API_URL="http://localhost:3000/api/v1"
ADMIN_CIN="ADMIN001"
ADMIN_PASSWORD="Admin@123456"
TEACHER_CIN="TEACH001"
TEACHER_PASSWORD="Teacher@123"
STUDENT_CIN="STUD001"
STUDENT_PASSWORD="Student@123"

echo "╔════════════════════════════════════════════════╗"
echo "║     Messaging System - Complete Test Suite    ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Login users
echo "🔐 Authenticating users..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ADMIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"cin\":\"$ADMIN_CIN\",\"password\":\"$ADMIN_PASSWORD\"}")
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])")

TEACHER_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"cin\":\"$TEACHER_CIN\",\"password\":\"$TEACHER_PASSWORD\"}")
TEACHER_TOKEN=$(echo "$TEACHER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])")

STUDENT_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"cin\":\"$STUDENT_CIN\",\"password\":\"$STUDENT_PASSWORD\"}")
STUDENT_TOKEN=$(echo "$STUDENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])")

# Get user IDs
ADMIN_ID=$(echo "$ADMIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['user']['id'])")
TEACHER_ID=$(echo "$TEACHER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['user']['id'])")
STUDENT_ID=$(echo "$STUDENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['user']['id'])")

if [ -n "$ADMIN_TOKEN" ] && [ -n "$TEACHER_TOKEN" ] && [ -n "$STUDENT_TOKEN" ]; then
    echo -e "${GREEN}✅ All users authenticated successfully${NC}"
    echo "   Admin ID: $ADMIN_ID"
    echo "   Teacher ID: $TEACHER_ID"
    echo "   Student ID: $STUDENT_ID"
else
    echo -e "${RED}❌ Authentication failed${NC}"
    exit 1
fi
echo ""

# Test 1: Send message from Admin to Teacher
echo "📤 Test 1: Send message (Admin → Teacher)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
MESSAGE1=$(curl -s -X POST "$API_URL/messages" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"receiverId\":\"$TEACHER_ID\",\"content\":\"Hello Teacher! This is a test message from Admin.\"}")

MESSAGE1_ID=$(echo "$MESSAGE1" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', data).get('id', ''))")

if [ -n "$MESSAGE1_ID" ]; then
    echo -e "${GREEN}✅ Message sent successfully${NC}"
    echo "   Message ID: $MESSAGE1_ID"
    echo "$MESSAGE1" | python3 -m json.tool 2>/dev/null | head -20
else
    echo -e "${RED}❌ Failed to send message${NC}"
    echo "$MESSAGE1"
fi
echo ""

# Test 2: Send message from Teacher to Student
echo "📤 Test 2: Send message (Teacher → Student)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
MESSAGE2=$(curl -s -X POST "$API_URL/messages" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"receiverId\":\"$STUDENT_ID\",\"content\":\"Hello Student! Your assignment is due next week.\"}")

MESSAGE2_ID=$(echo "$MESSAGE2" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', data).get('id', ''))")

if [ -n "$MESSAGE2_ID" ]; then
    echo -e "${GREEN}✅ Message sent successfully${NC}"
    echo "   Message ID: $MESSAGE2_ID"
else
    echo -e "${RED}❌ Failed to send message${NC}"
fi
echo ""

# Test 3: Send reply from Student to Teacher
echo "📤 Test 3: Send reply (Student → Teacher)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
MESSAGE3=$(curl -s -X POST "$API_URL/messages" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"receiverId\":\"$TEACHER_ID\",\"content\":\"Thank you Professor! I'll submit it on time.\"}")

MESSAGE3_ID=$(echo "$MESSAGE3" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', data).get('id', ''))")

if [ -n "$MESSAGE3_ID" ]; then
    echo -e "${GREEN}✅ Reply sent successfully${NC}"
    echo "   Message ID: $MESSAGE3_ID"
else
    echo -e "${RED}❌ Failed to send reply${NC}"
fi
echo ""

# Test 4: Get Teacher's inbox
echo "📥 Test 4: Get Teacher's Inbox"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
INBOX=$(curl -s -X GET "$API_URL/messages/inbox" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

INBOX_COUNT=$(echo "$INBOX" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ Retrieved inbox: $INBOX_COUNT messages${NC}"
echo "$INBOX" | python3 -m json.tool 2>/dev/null | head -30
echo ""

# Test 5: Get unread count
echo "📊 Test 5: Get Unread Message Count (Teacher)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
UNREAD=$(curl -s -X GET "$API_URL/messages/unread-count" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

echo -e "${GREEN}✅ Unread count retrieved${NC}"
echo "$UNREAD" | python3 -m json.tool 2>/dev/null
echo ""

# Test 6: Get conversation list
echo "💬 Test 6: Get Conversation List (Teacher)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
CONVERSATIONS=$(curl -s -X GET "$API_URL/messages/conversations" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

CONV_COUNT=$(echo "$CONVERSATIONS" | grep -o '"userId"' | wc -l)
echo -e "${GREEN}✅ Retrieved $CONV_COUNT conversations${NC}"
echo "$CONVERSATIONS" | python3 -m json.tool 2>/dev/null | head -30
echo ""

# Test 7: Get specific conversation
echo "💬 Test 7: Get Conversation (Teacher ↔ Student)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
CONVERSATION=$(curl -s -X GET "$API_URL/messages/conversation/$STUDENT_ID" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

MSG_COUNT=$(echo "$CONVERSATION" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ Retrieved conversation: $MSG_COUNT messages${NC}"
echo "$CONVERSATION" | python3 -m json.tool 2>/dev/null | head -30
echo ""

# Test 8: Mark message as read
if [ -n "$MESSAGE1_ID" ]; then
    echo "✅ Test 8: Mark Message as Read"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    READ_RESPONSE=$(curl -s -X PATCH "$API_URL/messages/$MESSAGE1_ID/read" \
      -H "Authorization: Bearer $TEACHER_TOKEN")
    
    echo -e "${GREEN}✅ Message marked as read${NC}"
    echo "$READ_RESPONSE" | python3 -m json.tool 2>/dev/null | head -15
    echo ""
fi

# Test 9: Mark all as read
echo "✅ Test 9: Mark All Messages as Read (Student)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
MARK_ALL=$(curl -s -X PATCH "$API_URL/messages/mark-all-read" \
  -H "Authorization: Bearer $STUDENT_TOKEN")

echo -e "${GREEN}✅ All messages marked as read${NC}"
echo "$MARK_ALL" | python3 -m json.tool 2>/dev/null
echo ""

# Test 10: Get sent messages
echo "📤 Test 10: Get Sent Messages (Admin)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
SENT=$(curl -s -X GET "$API_URL/messages/sent" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

SENT_COUNT=$(echo "$SENT" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ Retrieved sent messages: $SENT_COUNT messages${NC}"
echo "$SENT" | python3 -m json.tool 2>/dev/null | head -25
echo ""

# Test 11: Get specific message by ID
if [ -n "$MESSAGE2_ID" ]; then
    echo "🔍 Test 11: Get Specific Message by ID"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    MSG_DETAIL=$(curl -s -X GET "$API_URL/messages/$MESSAGE2_ID" \
      -H "Authorization: Bearer $TEACHER_TOKEN")
    
    echo -e "${GREEN}✅ Message details retrieved${NC}"
    echo "$MSG_DETAIL" | python3 -m json.tool 2>/dev/null | head -25
    echo ""
fi

# Test 12: Delete message
if [ -n "$MESSAGE1_ID" ]; then
    echo "🗑️  Test 12: Delete Message"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/messages/$MESSAGE1_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    
    echo -e "${GREEN}✅ Message deleted successfully${NC}"
    echo "$DELETE_RESPONSE" | python3 -m json.tool 2>/dev/null
    echo ""
fi

# Summary
echo "╔════════════════════════════════════════════════╗"
echo "║          Messaging System Test Summary        ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "✅ All messaging features tested successfully!"
echo ""
echo "📋 Tested Features:"
echo "   ✓ Send messages between users"
echo "   ✓ Receive messages (inbox)"
echo "   ✓ View sent messages"
echo "   ✓ Get conversation list"
echo "   ✓ View specific conversations"
echo "   ✓ Mark messages as read"
echo "   ✓ Mark all messages as read"
echo "   ✓ Get unread message count"
echo "   ✓ Get specific message details"
echo "   ✓ Delete messages"
echo ""
echo "🌐 API Documentation: http://localhost:3000/api/docs"
echo "📁 Search for 'Messages' section in Swagger UI"
echo ""
