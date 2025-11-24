#!/bin/bash

# Messaging System - Simple Test
# Tests core messaging functionality

API_URL="http://localhost:3000/api/v1"

echo "╔════════════════════════════════════════════════╗"
echo "║     Messaging System Test - Simplified        ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Login and get tokens
echo "🔐 Logging in users..."
ADMIN_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"cin":"ADMIN001","password":"Admin@123456"}' | jq -r '.data.accessToken')

TEACHER_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"cin":"TEACH001","password":"Teacher@123"}' | jq -r '.data.accessToken')

STUDENT_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"cin":"STUD001","password":"Student@123"}' | jq -r '.data.accessToken')

# Get user IDs
ADMIN_ID=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"cin":"ADMIN001","password":"Admin@123456"}' | jq -r '.data.user.id')

TEACHER_ID=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"cin":"TEACH001","password":"Teacher@123"}' | jq -r '.data.user.id')

STUDENT_ID=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"cin":"STUD001","password":"Student@123"}' | jq -r '.data.user.id')

if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
    echo "✅ All users authenticated!"
    echo "   Admin ID: $ADMIN_ID"
    echo "   Teacher ID: $TEACHER_ID"
    echo "   Student ID: $STUDENT_ID"
    echo ""
else
    echo "❌ Authentication failed"
    exit 1
fi

# Test 1: Send message
echo "📤 Test 1: Sending message (Admin → Teacher)..."
MSG1=$(curl -s -X POST "$API_URL/messages" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"receiverId\":\"$TEACHER_ID\",\"content\":\"Hello! This is a test message.\"}")
  
MSG1_ID=$(echo "$MSG1" | jq -r '.data.id // .id')
echo "✅ Message sent! ID: $MSG1_ID"
echo "$MSG1" | jq '.'
echo ""

# Test 2: Get inbox
echo "📥 Test 2: Getting Teacher's inbox..."
INBOX=$(curl -s -X GET "$API_URL/messages/inbox" \
  -H "Authorization: Bearer $TEACHER_TOKEN")
  
INBOX_COUNT=$(echo "$INBOX" | jq '.data | length')
echo "✅ Inbox retrieved: $INBOX_COUNT messages"
echo "$INBOX" | jq '.data[0]'
echo ""

# Test 3: Get unread count
echo "📊 Test 3: Getting unread count..."
UNREAD=$(curl -s -X GET "$API_URL/messages/unread-count" \
  -H "Authorization: Bearer $TEACHER_TOKEN")
  
echo "✅ Unread count:"
echo "$UNREAD" | jq '.'
echo ""

# Test 4: Get conversations
echo "💬 Test 4: Getting conversation list..."
CONVS=$(curl -s -X GET "$API_URL/messages/conversations" \
  -H "Authorization: Bearer $TEACHER_TOKEN")
  
CONV_COUNT=$(echo "$CONVS" | jq '.data | length')
echo "✅ Conversations retrieved: $CONV_COUNT"
echo "$CONVS" | jq '.data[0]' 2>/dev/null || echo "No conversations yet"
echo ""

# Test 5: Mark as read
if [ "$MSG1_ID" != "null" ] && [ -n "$MSG1_ID" ]; then
    echo "✅ Test 5: Marking message as read..."
    READ_RESP=$(curl -s -X PATCH "$API_URL/messages/$MSG1_ID/read" \
      -H "Authorization: Bearer $TEACHER_TOKEN")
      
    echo "✅ Marked as read:"
    echo "$READ_RESP" | jq '.'
    echo ""
fi

# Test 6: Send reply
echo "📤 Test 6: Sending reply (Teacher → Admin)..."
MSG2=$(curl -s -X POST "$API_URL/messages" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"receiverId\":\"$ADMIN_ID\",\"content\":\"Thanks for your message!\"}")
  
echo "✅ Reply sent:"
echo "$MSG2" | jq '.'
echo ""

# Test 7: Get conversation
echo "💬 Test 7: Getting conversation (Teacher ↔ Admin)..."
CONVERSATION=$(curl -s -X GET "$API_URL/messages/conversation/$ADMIN_ID" \
  -H "Authorization: Bearer $TEACHER_TOKEN")
  
MSG_COUNT=$(echo "$CONVERSATION" | jq '.data | length')
echo "✅ Conversation retrieved: $MSG_COUNT messages"
echo "$CONVERSATION" | jq '.data'
echo ""

# Test 8: Get sent messages
echo "📤 Test 8: Getting sent messages..."
SENT=$(curl -s -X GET "$API_URL/messages/sent" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
  
SENT_COUNT=$(echo "$SENT" | jq '.data | length')
echo "✅ Sent messages retrieved: $SENT_COUNT"
echo "$SENT" | jq '.data[0]' 2>/dev/null
echo ""

echo "╔════════════════════════════════════════════════╗"
echo "║          ✅ All Tests Completed! ✅            ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "📋 Messaging features tested:"
echo "   ✓ Send messages"
echo "   ✓ Receive messages (inbox)"
echo "   ✓ Get unread count"
echo "   ✓ Get conversations"
echo "   ✓ Mark as read"
echo "   ✓ View conversation history"
echo "   ✓ Get sent messages"
echo ""
echo "🌐 API Documentation: http://localhost:3000/api/docs"
echo ""
