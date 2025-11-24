#!/bin/bash

# Test complete user workflows end-to-end
# This script simulates real user journeys through the system

set -e

BASE_URL="${API_BASE_URL:-http://localhost:3000/api}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
WORKFLOW_COUNT=0
SUCCESS_COUNT=0
FAIL_COUNT=0

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_step() {
    echo -e "${YELLOW}Step $1:${NC} $2"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_fail() {
    echo -e "${RED}✗${NC} $1"
}

# Student Workflow
test_student_workflow() {
    print_header "STUDENT WORKFLOW"
    ((WORKFLOW_COUNT++))
    
    print_step "1" "Student logs in"
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"student@university.edu","password":"Student@123456"}')
    
    STUDENT_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$STUDENT_TOKEN" ]; then
        print_success "Student logged in successfully"
    else
        print_fail "Student login failed"
        ((FAIL_COUNT++))
        return
    fi
    
    print_step "2" "Student views their schedule"
    SCHEDULE_RESPONSE=$(curl -s -X GET "$BASE_URL/timetable/my-schedule" \
        -H "Authorization: Bearer $STUDENT_TOKEN")
    
    if echo $SCHEDULE_RESPONSE | grep -q '"id"'; then
        print_success "Schedule retrieved successfully"
    else
        print_fail "Failed to retrieve schedule"
    fi
    
    print_step "3" "Student checks their absences"
    ABSENCES_RESPONSE=$(curl -s -X GET "$BASE_URL/absences/my-absences" \
        -H "Authorization: Bearer $STUDENT_TOKEN")
    
    if echo $ABSENCES_RESPONSE | grep -q 'total'; then
        print_success "Absences retrieved successfully"
    else
        print_fail "Failed to retrieve absences"
    fi
    
    print_step "4" "Student views their performance"
    PERFORMANCE_RESPONSE=$(curl -s -X GET "$BASE_URL/analytics/my-performance" \
        -H "Authorization: Bearer $STUDENT_TOKEN")
    
    if echo $PERFORMANCE_RESPONSE | grep -q 'attendanceRate'; then
        print_success "Performance data retrieved successfully"
    else
        print_fail "Failed to retrieve performance"
    fi
    
    print_step "5" "Student checks messages"
    MESSAGES_RESPONSE=$(curl -s -X GET "$BASE_URL/messages/inbox" \
        -H "Authorization: Bearer $STUDENT_TOKEN")
    
    if [ -n "$MESSAGES_RESPONSE" ]; then
        print_success "Messages retrieved successfully"
    else
        print_fail "Failed to retrieve messages"
    fi
    
    print_step "6" "Student checks notifications"
    NOTIFICATIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/notifications/me" \
        -H "Authorization: Bearer $STUDENT_TOKEN")
    
    if [ -n "$NOTIFICATIONS_RESPONSE" ]; then
        print_success "Notifications retrieved successfully"
        ((SUCCESS_COUNT++))
    else
        print_fail "Failed to retrieve notifications"
        ((FAIL_COUNT++))
    fi
}

# Teacher Workflow
test_teacher_workflow() {
    print_header "TEACHER WORKFLOW"
    ((WORKFLOW_COUNT++))
    
    print_step "1" "Teacher logs in"
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"teacher@university.edu","password":"Teacher@123456"}')
    
    TEACHER_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TEACHER_TOKEN" ]; then
        print_success "Teacher logged in successfully"
    else
        print_fail "Teacher login failed"
        ((FAIL_COUNT++))
        return
    fi
    
    print_step "2" "Teacher views their schedule"
    SCHEDULE_RESPONSE=$(curl -s -X GET "$BASE_URL/timetable/my-schedule" \
        -H "Authorization: Bearer $TEACHER_TOKEN")
    
    if echo $SCHEDULE_RESPONSE | grep -q '"id"'; then
        print_success "Schedule retrieved successfully"
    else
        print_fail "Failed to retrieve schedule"
    fi
    
    print_step "3" "Teacher views students in their group"
    # Get first group ID
    GROUPS_RESPONSE=$(curl -s -X GET "$BASE_URL/groups" \
        -H "Authorization: Bearer $TEACHER_TOKEN")
    
    GROUP_ID=$(echo $GROUPS_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$GROUP_ID" ]; then
        STUDENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/groups/$GROUP_ID" \
            -H "Authorization: Bearer $TEACHER_TOKEN")
        print_success "Group students retrieved successfully"
    else
        print_fail "Failed to retrieve students"
    fi
    
    print_step "4" "Teacher records an absence"
    # Get a student ID from the group
    STUDENT_ID=$(echo $STUDENTS_RESPONSE | grep -o '"id":"[^"]*"' | head -2 | tail -1 | cut -d'"' -f4)
    SUBJECT_ID=$(curl -s -X GET "$BASE_URL/subjects" -H "Authorization: Bearer $TEACHER_TOKEN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$STUDENT_ID" ] && [ -n "$SUBJECT_ID" ]; then
        ABSENCE_RESPONSE=$(curl -s -X POST "$BASE_URL/absences" \
            -H "Authorization: Bearer $TEACHER_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"studentId\":\"$STUDENT_ID\",\"subjectId\":\"$SUBJECT_ID\",\"date\":\"$(date -I)\",\"session\":\"morning\"}")
        
        if echo $ABSENCE_RESPONSE | grep -q '"id"'; then
            print_success "Absence recorded successfully"
        else
            print_fail "Failed to record absence"
        fi
    else
        print_fail "Missing student or subject ID"
    fi
    
    print_step "5" "Teacher reviews excuse requests"
    EXCUSES_RESPONSE=$(curl -s -X GET "$BASE_URL/absences?status=pending" \
        -H "Authorization: Bearer $TEACHER_TOKEN")
    
    if [ -n "$EXCUSES_RESPONSE" ]; then
        print_success "Excuse requests retrieved successfully"
    else
        print_fail "Failed to retrieve excuse requests"
    fi
    
    print_step "6" "Teacher sends a message to student"
    if [ -n "$STUDENT_ID" ]; then
        MESSAGE_RESPONSE=$(curl -s -X POST "$BASE_URL/messages/send" \
            -H "Authorization: Bearer $TEACHER_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"receiverId\":\"$STUDENT_ID\",\"content\":\"Please review the course materials.\"}")
        
        if echo $MESSAGE_RESPONSE | grep -q '"id"'; then
            print_success "Message sent successfully"
            ((SUCCESS_COUNT++))
        else
            print_fail "Failed to send message"
            ((FAIL_COUNT++))
        fi
    fi
}

# Admin Workflow
test_admin_workflow() {
    print_header "ADMIN WORKFLOW"
    ((WORKFLOW_COUNT++))
    
    print_step "1" "Admin logs in"
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@university.edu","password":"Admin@123456"}')
    
    ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$ADMIN_TOKEN" ]; then
        print_success "Admin logged in successfully"
    else
        print_fail "Admin login failed"
        ((FAIL_COUNT++))
        return
    fi
    
    print_step "2" "Admin creates a new user"
    USER_RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"newuser_$(date +%s)@university.edu\",\"password\":\"Test@123456\",\"firstName\":\"New\",\"lastName\":\"User\",\"role\":\"student\",\"status\":\"active\"}")
    
    NEW_USER_ID=$(echo $USER_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$NEW_USER_ID" ]; then
        print_success "User created successfully"
    else
        print_fail "Failed to create user"
    fi
    
    print_step "3" "Admin creates a group"
    LEVEL_ID=$(curl -s -X GET "$BASE_URL/levels" -H "Authorization: Bearer $ADMIN_TOKEN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    SPECIALTY_ID=$(curl -s -X GET "$BASE_URL/specialties" -H "Authorization: Bearer $ADMIN_TOKEN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$LEVEL_ID" ] && [ -n "$SPECIALTY_ID" ]; then
        GROUP_RESPONSE=$(curl -s -X POST "$BASE_URL/groups" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"name\":\"Test Group $(date +%s)\",\"code\":\"TG$(date +%s)\",\"levelId\":\"$LEVEL_ID\",\"specialtyId\":\"$SPECIALTY_ID\",\"capacity\":30,\"currentSize\":0}")
        
        NEW_GROUP_ID=$(echo $GROUP_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        
        if [ -n "$NEW_GROUP_ID" ]; then
            print_success "Group created successfully"
        else
            print_fail "Failed to create group"
        fi
    else
        print_fail "Missing level or specialty"
    fi
    
    print_step "4" "Admin assigns student to group"
    if [ -n "$NEW_USER_ID" ] && [ -n "$NEW_GROUP_ID" ]; then
        ASSIGN_RESPONSE=$(curl -s -X POST "$BASE_URL/groups/$NEW_GROUP_ID/students/$NEW_USER_ID" \
            -H "Authorization: Bearer $ADMIN_TOKEN")
        
        if echo $ASSIGN_RESPONSE | grep -q '"id"'; then
            print_success "Student assigned to group successfully"
        else
            print_fail "Failed to assign student to group"
        fi
    fi
    
    print_step "5" "Admin views analytics"
    ANALYTICS_RESPONSE=$(curl -s -X GET "$BASE_URL/analytics/absence-analytics" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    if echo $ANALYTICS_RESPONSE | grep -q 'totalAbsences'; then
        print_success "Analytics retrieved successfully"
    else
        print_fail "Failed to retrieve analytics"
    fi
    
    print_step "6" "Admin sends announcement to all users"
    # Get all student IDs
    USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/users?role=student" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    # Create a notification for multiple users (simplified)
    NOTIF_RESPONSE=$(curl -s -X POST "$BASE_URL/notifications" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"userId\":\"$NEW_USER_ID\",\"type\":\"announcement\",\"title\":\"System Maintenance\",\"message\":\"The system will be under maintenance this weekend.\"}")
    
    if echo $NOTIF_RESPONSE | grep -q '"id"'; then
        print_success "Announcement sent successfully"
        ((SUCCESS_COUNT++))
    else
        print_fail "Failed to send announcement"
        ((FAIL_COUNT++))
    fi
}

# Print summary
print_summary() {
    print_header "WORKFLOW TEST SUMMARY"
    echo -e "Total Workflows: ${BLUE}$WORKFLOW_COUNT${NC}"
    echo -e "Successful: ${GREEN}$SUCCESS_COUNT${NC}"
    echo -e "Failed: ${RED}$FAIL_COUNT${NC}"
    
    if [ $FAIL_COUNT -eq 0 ]; then
        echo -e "\n${GREEN}All workflows completed successfully!${NC}\n"
        exit 0
    else
        echo -e "\n${RED}Some workflows failed!${NC}\n"
        exit 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║  University Platform - Workflow Testing Script     ║"
    echo "║  Testing end-to-end user journeys                   ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "API Base URL: ${GREEN}$BASE_URL${NC}\n"
    
    # Run workflow tests
    test_student_workflow
    test_teacher_workflow
    test_admin_workflow
    
    # Print summary
    print_summary
}

# Run main function
main
