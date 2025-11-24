# Testing and Deployment Scripts

This directory contains comprehensive testing and deployment scripts for the University Management Platform.

## Overview

The platform now includes **80+ API endpoints** across the following modules:
- **Authentication** (6 endpoints): Login, register, profile, password reset, token refresh
- **User Management** (7 endpoints): CRUD operations, CSV import, role-based filtering
- **Department Management** (5 endpoints): CRUD operations
- **Room Management** (5 endpoints): CRUD operations, availability checking
- **Specialty Management** (5 endpoints): CRUD operations
- **Level Management** (5 endpoints): CRUD operations, ordering
- **Group Management** (7 endpoints): CRUD, student assignment/removal
- **Subject Management** (7 endpoints): CRUD, teacher assignment, filtering
- **Timetable Management** (8 endpoints): CRUD, conflict detection, schedule retrieval
- **Absence Management** (9 endpoints): CRUD, excuse workflow, statistics
- **Message System** (10 endpoints): Messaging, conversations, read status
- **Notification System** (10 endpoints): Multi-type notifications, bulk operations
- **Analytics & Reporting** (13 endpoints): Performance, occupancy, PDF/CSV export

## Available Scripts

### 1. `deploy-test-env.sh`
**Comprehensive deployment script** that:
- Checks prerequisites (Docker, Docker Compose)
- Cleans up existing containers
- Builds and starts Docker containers
- Waits for services to be ready (PostgreSQL, Backend API)
- Runs database migrations
- Seeds initial test data (admin, teacher, student accounts)
- Runs validation tests
- Displays deployment information and credentials

**Usage:**
```bash
./scripts/deploy-test-env.sh
```

**Features:**
- Automated health checks with retry logic
- Color-coded output for easy monitoring
- Creates test users with known credentials
- Validates deployment automatically
- Shows service URLs and container status

### 2. `validate-deployment.sh`
**Deployment validation script** that checks:
- API health endpoint
- Database connectivity and table count
- Docker container status
- API endpoint accessibility
- Authentication requirements
- Log files for errors
- Required directories and file system
- Environment variables
- Swagger documentation accessibility

**Usage:**
```bash
./scripts/validate-deployment.sh
```

**Checks Performed:**
- ✓ Health endpoint responds (HTTP 200)
- ✓ API returns valid JSON
- ✓ Database container running
- ✓ Database accepts connections
- ✓ Database has tables
- ✓ Backend container running
- ✓ No containers in restart loop
- ✓ Protected endpoints require auth
- ✓ No critical errors in logs
- ✓ Required directories exist
- ✓ Environment variables set
- ✓ Swagger docs accessible

### 3. `test-all-endpoints.sh`
**Comprehensive endpoint testing script** that:
- Tests all 80+ API endpoints sequentially
- Uses proper authentication tokens for each role
- Validates response codes and data structure
- Tests both success and error scenarios
- Tracks passed/failed test counts

**Usage:**
```bash
export API_BASE_URL=http://localhost:3000/api  # Optional, defaults to this
./scripts/test-all-endpoints.sh
```

**Test Categories:**
- Authentication tests (login, profile, password reset, invalid credentials)
- User management tests (CRUD, filtering, CSV import)
- Department tests (full CRUD cycle)
- Room tests (full CRUD cycle)
- Specialty, Level, Group, Subject tests
- Timetable tests (with conflict detection)
- Absence tests (excuse workflow)
- Message tests (conversations, read status)
- Notification tests (multi-type, bulk)
- Analytics tests (reports, PDF/CSV export)

**Output:**
- Color-coded test results (green for pass, red for fail)
- Test counters and summary
- Detailed failure messages with responses
- Exit code 0 if all pass, 1 if any fail

### 4. `test-workflows.sh`
**End-to-end workflow testing script** that simulates:

**Student Workflow:**
1. Student logs in
2. Views their schedule
3. Checks absences
4. Views performance analytics
5. Checks messages
6. Checks notifications

**Teacher Workflow:**
1. Teacher logs in
2. Views their schedule
3. Views students in group
4. Records an absence
5. Reviews excuse requests
6. Sends message to student

**Admin Workflow:**
1. Admin logs in
2. Creates a new user
3. Creates a group
4. Assigns student to group
5. Views analytics
6. Sends announcement to users

**Usage:**
```bash
./scripts/test-workflows.sh
```

**Features:**
- Realistic user journey simulations
- Tests integration between modules
- Validates data flow across endpoints
- Checks role-based access control
- Reports workflow success/failure

### 5. `init-directories.sh`
**Utility script** that creates required directories:
- `uploads/` - For file uploads
- `uploads/csv-imports/` - For CSV bulk imports
- `uploads/excuse-documents/` - For absence excuse documents
- `exports/` - For PDF/CSV report exports
- `logs/` - For application logs

**Usage:**
```bash
./scripts/init-directories.sh
```

## Quick Start Guide

### Complete Deployment and Testing

1. **Deploy the test environment:**
   ```bash
   cd /home/greed/Desktop/Projects/university-platform/backend
   ./scripts/deploy-test-env.sh
   ```

   This will:
   - Start all services
   - Create test database
   - Seed initial data
   - Run validation checks

2. **Access the application:**
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs
   - Database: localhost:5432

3. **Test credentials:**
   - **Admin:**
     - Email: `admin@university.edu`
     - Password: `Admin@123456`
   
   - **Teacher:**
     - Email: `teacher@university.edu`
     - Password: `Teacher@123456`
   
   - **Student:**
     - Email: `student@university.edu`
     - Password: `Student@123456`

4. **Run comprehensive tests:**
   ```bash
   # Test all endpoints
   ./scripts/test-all-endpoints.sh
   
   # Test user workflows
   ./scripts/test-workflows.sh
   
   # Validate deployment
   ./scripts/validate-deployment.sh
   ```

5. **View logs:**
   ```bash
   # Backend logs
   docker-compose logs -f backend
   
   # Database logs
   docker-compose logs -f db
   
   # All logs
   docker-compose logs -f
   ```

6. **Stop the environment:**
   ```bash
   docker-compose down
   
   # Or with volume cleanup
   docker-compose down -v
   ```

## Testing Individual Modules

You can modify the scripts to test specific modules:

```bash
# Edit test-all-endpoints.sh and comment out sections you don't want to test
# For example, to only test authentication:
main() {
    test_auth
    # test_users
    # test_departments
    # ...
    print_summary
}
```

## Environment Variables

The scripts support the following environment variables:

```bash
# API base URL (default: http://localhost:3000/api)
export API_BASE_URL=http://your-server:3000/api

# Test credentials (override defaults)
export ADMIN_EMAIL=your-admin@example.com
export ADMIN_PASSWORD=YourPassword123

# Run tests
./scripts/test-all-endpoints.sh
```

## Troubleshooting

### Services won't start
```bash
# Check Docker status
docker ps

# Check logs
docker-compose logs backend
docker-compose logs db

# Restart services
docker-compose restart
```

### Database connection issues
```bash
# Check if database is ready
docker-compose exec db pg_isready -U postgres

# Check database logs
docker-compose logs db

# Reset database
docker-compose down -v
docker-compose up -d
```

### API not responding
```bash
# Check backend container status
docker ps | grep backend

# Check backend logs
docker-compose logs backend

# Check if port is in use
lsof -i :3000

# Restart backend
docker-compose restart backend
```

### Tests failing
```bash
# Ensure services are running
./scripts/validate-deployment.sh

# Check if test users exist
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.edu","password":"Admin@123456"}'

# Re-seed data
./scripts/deploy-test-env.sh
```

## CI/CD Integration

These scripts can be integrated into CI/CD pipelines:

```yaml
# Example GitLab CI
test:
  script:
    - ./scripts/deploy-test-env.sh
    - ./scripts/test-all-endpoints.sh
    - ./scripts/test-workflows.sh
  after_script:
    - docker-compose down -v
```

```yaml
# Example GitHub Actions
- name: Deploy and Test
  run: |
    ./scripts/deploy-test-env.sh
    ./scripts/test-all-endpoints.sh
    ./scripts/test-workflows.sh
    
- name: Cleanup
  if: always()
  run: docker-compose down -v
```

## Script Maintenance

To add new endpoint tests:

1. **Add to `test-all-endpoints.sh`:**
   ```bash
   test_your_module() {
       print_header "YOUR MODULE TESTS"
       
       print_test "GET /your-endpoint"
       response=$(make_request GET "/your-endpoint" "$ADMIN_TOKEN")
       status=$(extract_status "$response")
       
       if [ "$status" = "200" ]; then
           print_success "Test passed"
       else
           print_fail "Test failed - status $status" "$response"
       fi
   }
   ```

2. **Add to `test-workflows.sh`:**
   ```bash
   print_step "7" "User does something"
   response=$(curl -s -X POST "$BASE_URL/your-endpoint" \
       -H "Authorization: Bearer $TOKEN" \
       -H "Content-Type: application/json" \
       -d '{"key":"value"}')
   
   if echo $response | grep -q '"success"'; then
       print_success "Action completed"
   fi
   ```

3. **Update this README** with new endpoint counts and test descriptions.

## Performance Metrics

Expected execution times:
- `deploy-test-env.sh`: 2-3 minutes (full deployment)
- `validate-deployment.sh`: 10-15 seconds
- `test-all-endpoints.sh`: 30-45 seconds (80+ endpoints)
- `test-workflows.sh`: 15-20 seconds (3 workflows)

## Support

For issues or questions:
1. Check container logs: `docker-compose logs`
2. Verify environment: `./scripts/validate-deployment.sh`
3. Review error messages in test output
4. Check Docker and Docker Compose versions
5. Ensure ports 3000 and 5432 are available

---

**Total Coverage:**
- 80+ API endpoints tested
- 3 complete user workflows
- 15+ validation checks
- Automated deployment with seeding
- PDF/CSV export testing
- File upload testing (CSV, documents)
- Real-time conflict detection testing
- Email notification testing (via logs)
