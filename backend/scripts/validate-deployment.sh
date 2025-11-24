#!/bin/bash

# Validate that the deployment is healthy and all services are working

set -e

BASE_URL="${API_BASE_URL:-http://localhost:3000}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_FAILED=0

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_check() {
    echo -e "${YELLOW}Checking:${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓ PASSED:${NC} $1"
    ((CHECKS_PASSED++))
}

print_fail() {
    echo -e "${RED}✗ FAILED:${NC} $1"
    ((CHECKS_FAILED++))
}

# Check API health endpoint
check_api_health() {
    print_header "API HEALTH CHECKS"
    
    print_check "Health endpoint responds"
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
    
    if [ "$response" = "200" ]; then
        print_success "Health endpoint is responding (HTTP 200)"
    else
        print_fail "Health endpoint returned HTTP $response"
    fi
    
    print_check "API returns valid JSON"
    response=$(curl -s "$BASE_URL/api/health")
    
    if echo "$response" | jq . > /dev/null 2>&1; then
        print_success "API returns valid JSON"
    else
        print_fail "API response is not valid JSON"
    fi
}

# Check database connectivity
check_database() {
    print_header "DATABASE CHECKS"
    
    print_check "Database container is running"
    if docker ps | grep -q "university-platform.*db"; then
        print_success "Database container is running"
    else
        print_fail "Database container is not running"
    fi
    
    print_check "Database accepts connections"
    if docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; then
        print_success "Database accepts connections"
    else
        print_fail "Cannot connect to database"
    fi
    
    print_check "Database has tables"
    table_count=$(docker-compose exec -T db psql -U postgres -d university_platform -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    
    if [ "$table_count" -gt 0 ] 2>/dev/null; then
        print_success "Database has $table_count tables"
    else
        print_fail "Database has no tables or cannot query"
    fi
}

# Check Docker containers
check_containers() {
    print_header "CONTAINER CHECKS"
    
    print_check "Backend container is running"
    if docker ps | grep -q "university-platform.*backend"; then
        print_success "Backend container is running"
    else
        print_fail "Backend container is not running"
    fi
    
    print_check "No containers are in restart loop"
    restarting=$(docker ps --filter "status=restarting" --format "{{.Names}}" | wc -l)
    
    if [ "$restarting" -eq 0 ]; then
        print_success "No containers are restarting"
    else
        print_fail "$restarting container(s) in restart loop"
    fi
}

# Check API endpoints
check_api_endpoints() {
    print_header "API ENDPOINT CHECKS"
    
    # Test login endpoint
    print_check "Login endpoint exists"
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"test"}')
    
    # Should return 401 (unauthorized) but endpoint exists
    if [ "$response" = "401" ] || [ "$response" = "400" ]; then
        print_success "Login endpoint is accessible"
    else
        print_fail "Login endpoint returned unexpected HTTP $response"
    fi
    
    # Test protected endpoint without auth
    print_check "Protected endpoints require authentication"
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users")
    
    if [ "$response" = "401" ]; then
        print_success "Protected endpoints require authentication"
    else
        print_fail "Protected endpoints returned HTTP $response (expected 401)"
    fi
}

# Check logs for errors
check_logs() {
    print_header "LOG CHECKS"
    
    print_check "Backend logs for critical errors"
    error_count=$(docker-compose logs backend | grep -i "error" | grep -v "401\|403\|404" | wc -l)
    
    if [ "$error_count" -lt 5 ]; then
        print_success "No critical errors in backend logs"
    else
        print_fail "$error_count errors found in backend logs"
    fi
    
    print_check "Database logs for errors"
    db_error_count=$(docker-compose logs db | grep -i "error\|fatal" | wc -l)
    
    if [ "$db_error_count" -lt 5 ]; then
        print_success "No critical errors in database logs"
    else
        print_fail "$db_error_count errors found in database logs"
    fi
}

# Check file system
check_filesystem() {
    print_header "FILE SYSTEM CHECKS"
    
    print_check "Required directories exist"
    required_dirs=("src" "dist" "scripts")
    missing_dirs=0
    
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            ((missing_dirs++))
        fi
    done
    
    if [ "$missing_dirs" -eq 0 ]; then
        print_success "All required directories exist"
    else
        print_fail "$missing_dirs required directory(ies) missing"
    fi
    
    print_check "Upload directories exist"
    if docker-compose exec -T backend test -d /app/uploads; then
        print_success "Upload directories exist"
    else
        print_fail "Upload directories missing"
    fi
}

# Check environment variables
check_environment() {
    print_header "ENVIRONMENT CHECKS"
    
    print_check "Backend has required environment variables"
    required_vars=("DATABASE_HOST" "JWT_SECRET")
    missing_vars=0
    
    for var in "${required_vars[@]}"; do
        if ! docker-compose exec -T backend printenv | grep -q "^$var="; then
            ((missing_vars++))
        fi
    done
    
    if [ "$missing_vars" -eq 0 ]; then
        print_success "All required environment variables are set"
    else
        print_fail "$missing_vars required environment variable(s) missing"
    fi
}

# Check API documentation
check_documentation() {
    print_header "DOCUMENTATION CHECKS"
    
    print_check "Swagger documentation is accessible"
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api-docs/")
    
    if [ "$response" = "200" ] || [ "$response" = "301" ]; then
        print_success "Swagger documentation is accessible"
    else
        print_fail "Swagger documentation returned HTTP $response"
    fi
}

# Print summary
print_summary() {
    print_header "VALIDATION SUMMARY"
    
    total=$((CHECKS_PASSED + CHECKS_FAILED))
    echo -e "Total Checks: ${BLUE}$total${NC}"
    echo -e "Passed: ${GREEN}$CHECKS_PASSED${NC}"
    echo -e "Failed: ${RED}$CHECKS_FAILED${NC}"
    
    if [ $CHECKS_FAILED -eq 0 ]; then
        echo -e "\n${GREEN}✓ All validation checks passed!${NC}\n"
        exit 0
    else
        echo -e "\n${RED}✗ Some validation checks failed!${NC}\n"
        exit 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║  University Platform - Deployment Validation       ║"
    echo "║  Checking system health and configuration          ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_api_health
    check_database
    check_containers
    check_api_endpoints
    check_logs
    check_filesystem
    check_environment
    check_documentation
    
    print_summary
}

# Run main function
main
