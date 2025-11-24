#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="http://localhost:3000/api/v1"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Complete Messaging System Test            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Login
echo -e "${GREEN}🔐 Logging in users...${NC}"
ADMIN=$(curl -s -X POST "$API_URL/auth/login" -H "Content-Type: application/json" -d '{"cin":"ADMIN001","password":"Admin@123456"}')
ADMIN_TOKEN=$(echo "$ADMIN" | jq -r '.data.accessToken')
ADMIN_ID=$(echo "$ADMIN" | jq -r '.data.user.id')

TEACHER=$(curl -s -X POST "$API_URL/auth/login" -H "Content-Type: application/json" -d '{"cin":"TEACH001","password":"Teacher@123"}')
TEACHER_TOKEN=$(echo "$TEACHER" | jq -r '.data.accessToken')
TEACHER_ID=$(echo "$TEACHER" | jq -r '.data.user.id')

echo -e "   Admin: $ADMIN_ID"
echo -e "   Teacher: $TEACHER_ID"
echo ""

# Test 1: Send message
echo -e "${BLUE}📤 Test 1: Sending message (Admin → Teacher)...${NC}"
MSG1=$(curl -s -X POST "$API_URL/messages/send" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"receiverId\":\"$TEACHER_ID\",\"content\":\"Hello Teacher! How are you?\"}")
MSG1_ID=$(echo "$MSG1" | jq -r '.id')
echo "$MSG1" | jq '{id, content, status, sender: .sender.cin, receiver: .receiver.cin}'
echo ""

# Test 2: Check inbox
echo -e "${BLUE}📥 Test 2: Checking Teacher's inbox...${NC}"
INBOX=$(curl -s -X GET "$API_URL/messages/inbox" \
  -H "Authorization: Bearer $TEACHER_TOKEN")
echo "$INBOX" | jq 'length as $count | "Received \($count) message(s)"'
echo "$INBOX" | jq '.[0] | {id, content, status, from: .sender.cin}'
echo ""

# Test 3: Check unread count
echo -e "${BLUE}📊 Test 3: Checking unread count...${NC}"
UNREAD=$(curl -s -X GET "$API_URL/messages/unread-count" \
  -H "Authorization: Bearer $TEACHER_TOKEN")
echo "$UNREAD" | jq
echo ""

# Test 4: Mark as read
echo -e "${BLUE}✓ Test 4: Marking message as read...${NC}"
curl -s -X PUT "$API_URL/messages/$MSG1_ID/read" \
  -H "Authorization: Bearer $TEACHER_TOKEN" | jq '{id, status, readAt}'
echo ""

# Test 5: Check unread count again
echo -e "${BLUE}📊 Test 5: Checking unread count after marking as read...${NC}"
curl -s -X GET "$API_URL/messages/unread-count" \
  -H "Authorization: Bearer $TEACHER_TOKEN" | jq
echo ""

# Test 6: Send reply
echo -e "${BLUE}📤 Test 6: Sending reply (Teacher → Admin)...${NC}"
MSG2=$(curl -s -X POST "$API_URL/messages/send" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"receiverId\":\"$ADMIN_ID\",\"content\":\"Hi Admin! I'm doing great, thanks!\"}")
echo "$MSG2" | jq '{id, content, status, sender: .sender.cin, receiver: .receiver.cin}'
echo ""

# Test 7: Get conversation
echo -e "${BLUE}💬 Test 7: Getting conversation (Teacher ↔ Admin)...${NC}"
CONV=$(curl -s -X GET "$API_URL/messages/conversation/$ADMIN_ID" \
  -H "Authorization: Bearer $TEACHER_TOKEN")
echo "$CONV" | jq 'length as $count | "Conversation has \($count) message(s)"'
echo "$CONV" | jq '.[] | {from: .sender.cin, to: .receiver.cin, content, status}'
echo ""

# Test 8: Get conversation list
echo -e "${BLUE}💬 Test 8: Getting conversation list...${NC}"
CONVS=$(curl -s -X GET "$API_URL/messages/conversations" \
  -H "Authorization: Bearer $TEACHER_TOKEN")
echo "$CONVS" | jq 'length as $count | "You have \($count) conversation(s)"'
echo "$CONVS" | jq '.[] | {with: .user.cin, lastMessage: .lastMessage.content, unreadCount}'
echo ""

# Test 9: Get sent messages
echo -e "${BLUE}📤 Test 9: Getting sent messages...${NC}"
SENT=$(curl -s -X GET "$API_URL/messages/sent" \
  -H "Authorization: Bearer $TEACHER_TOKEN")
echo "$SENT" | jq 'length as $count | "Sent \($count) message(s)"'
echo "$SENT" | jq '.[0] | {id, to: .receiver.cin, content, status}'
echo ""

# Test 10: Mark all as read
echo -e "${BLUE}✓ Test 10: Admin marking all messages as read...${NC}"
curl -s -X PUT "$API_URL/messages/mark-all-read" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✅ All Tests Completed! ✅            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
