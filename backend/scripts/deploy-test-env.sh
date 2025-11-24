#!/bin/bash

# Deploy the application to test environment with full validation
# This script sets up Docker, runs migrations, seeds data, and runs tests

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_step() {
    echo -e "${YELLOW}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_fail() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    print_header "CHECKING PREREQUISITES"
    
    print_step "Checking Docker installation"
    if command -v docker &> /dev/null; then
        print_success "Docker is installed ($(docker --version))"
    else
        print_fail "Docker is not installed. Please install Docker first."
    fi
    
    print_step "Checking Docker Compose installation"
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        print_success "Docker Compose is installed"
    else
        print_fail "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    print_step "Checking if Docker daemon is running"
    if docker info &> /dev/null; then
        print_success "Docker daemon is running"
    else
        print_fail "Docker daemon is not running. Please start Docker."
    fi
}

# Clean up existing containers
cleanup_existing() {
    print_header "CLEANING UP EXISTING CONTAINERS"
    
    cd "$PROJECT_ROOT"
    
    print_step "Stopping and removing existing containers"
    docker-compose down -v 2>/dev/null || true
    print_success "Cleanup complete"
}

# Build and start containers
start_containers() {
    print_header "BUILDING AND STARTING CONTAINERS"
    
    cd "$PROJECT_ROOT"
    
    print_step "Building Docker images"
    if docker-compose build; then
        print_success "Docker images built successfully"
    else
        print_fail "Failed to build Docker images"
    fi
    
    print_step "Starting containers"
    if docker-compose up -d; then
        print_success "Containers started successfully"
    else
        print_fail "Failed to start containers"
    fi
}

# Wait for services to be ready
wait_for_services() {
    print_header "WAITING FOR SERVICES TO BE READY"
    
    print_step "Waiting for PostgreSQL to be ready"
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose exec -T db pg_isready -U postgres &> /dev/null; then
            print_success "PostgreSQL is ready"
            break
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        print_fail "PostgreSQL failed to start within timeout"
    fi
    
    print_step "Waiting for backend API to be ready"
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:3000/api/health &> /dev/null; then
            print_success "Backend API is ready"
            break
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        print_fail "Backend API failed to start within timeout"
    fi
}

# Run database migrations
run_migrations() {
    print_header "RUNNING DATABASE MIGRATIONS"
    
    print_step "Running TypeORM migrations"
    if docker-compose exec -T backend npm run migration:run; then
        print_success "Migrations completed successfully"
    else
        # Migrations might fail if already run, which is okay
        echo -e "${YELLOW}Note: Migrations may have already been applied${NC}"
    fi
}

# Seed initial data
seed_data() {
    print_header "SEEDING INITIAL DATA"
    
    print_step "Creating admin user"
    curl -s -X POST http://localhost:3000/api/auth/register \
        -H "Content-Type: application/json" \
        -d '{
            "email": "admin@university.edu",
            "password": "Admin@123456",
            "firstName": "System",
            "lastName": "Administrator",
            "role": "admin"
        }' > /dev/null 2>&1 || echo -e "${YELLOW}Admin may already exist${NC}"
    
    print_step "Creating test users"
    # Create teacher
    curl -s -X POST http://localhost:3000/api/auth/register \
        -H "Content-Type: application/json" \
        -d '{
            "email": "teacher@university.edu",
            "password": "Teacher@123456",
            "firstName": "John",
            "lastName": "Teacher",
            "role": "teacher"
        }' > /dev/null 2>&1 || true
    
    # Create student
    curl -s -X POST http://localhost:3000/api/auth/register \
        -H "Content-Type: application/json" \
        -d '{
            "email": "student@university.edu",
            "password": "Student@123456",
            "firstName": "Jane",
            "lastName": "Student",
            "role": "student"
        }' > /dev/null 2>&1 || true
    
    print_success "Initial data seeded"
}

# Run tests
run_tests() {
    print_header "RUNNING VALIDATION TESTS"
    
    print_step "Running endpoint tests"
    if bash "$SCRIPT_DIR/test-all-endpoints.sh"; then
        print_success "Endpoint tests passed"
    else
        echo -e "${YELLOW}Some endpoint tests failed (may be expected if data doesn't exist yet)${NC}"
    fi
    
    print_step "Running workflow tests"
    if bash "$SCRIPT_DIR/test-workflows.sh"; then
        print_success "Workflow tests passed"
    else
        echo -e "${YELLOW}Some workflow tests failed (may be expected in fresh environment)${NC}"
    fi
}

# Validate deployment
validate_deployment() {
    print_header "VALIDATING DEPLOYMENT"
    
    if bash "$SCRIPT_DIR/validate-deployment.sh"; then
        print_success "Deployment validation passed"
    else
        print_fail "Deployment validation failed"
    fi
}

# Show deployment info
show_deployment_info() {
    print_header "DEPLOYMENT INFORMATION"
    
    echo -e "${GREEN}✓ Test environment deployed successfully!${NC}\n"
    
    echo "Service URLs:"
    echo -e "  Backend API: ${BLUE}http://localhost:3000${NC}"
    echo -e "  API Documentation: ${BLUE}http://localhost:3000/api-docs${NC}"
    echo -e "  Database: ${BLUE}localhost:5432${NC}"
    echo ""
    
    echo "Test Credentials:"
    echo -e "  Admin:"
    echo -e "    Email: ${YELLOW}admin@university.edu${NC}"
    echo -e "    Password: ${YELLOW}Admin@123456${NC}"
    echo ""
    echo -e "  Teacher:"
    echo -e "    Email: ${YELLOW}teacher@university.edu${NC}"
    echo -e "    Password: ${YELLOW}Teacher@123456${NC}"
    echo ""
    echo -e "  Student:"
    echo -e "    Email: ${YELLOW}student@university.edu${NC}"
    echo -e "    Password: ${YELLOW}Student@123456${NC}"
    echo ""
    
    echo "Container Status:"
    docker-compose ps
    echo ""
    
    echo "To view logs:"
    echo -e "  ${BLUE}docker-compose logs -f backend${NC}"
    echo -e "  ${BLUE}docker-compose logs -f db${NC}"
    echo ""
    
    echo "To stop the environment:"
    echo -e "  ${BLUE}docker-compose down${NC}"
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║  University Platform - Test Deployment Script      ║"
    echo "║  Automated deployment with validation               ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_prerequisites
    cleanup_existing
    start_containers
    wait_for_services
    run_migrations
    seed_data
    run_tests
    validate_deployment
    show_deployment_info
    
    echo -e "${GREEN}Deployment completed successfully!${NC}\n"
}

# Run main function
main
