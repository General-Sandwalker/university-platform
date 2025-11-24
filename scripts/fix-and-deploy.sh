#!/bin/bash

set -e

echo "================================================="
echo "University Platform - Complete Fix and Deploy"
echo "================================================="
echo ""

cd "$(dirname "$0")/.."

echo "Step 1: Fixing AppError parameter order in service files..."
echo "---------------------------------------------------------"

# Function to fix AppError in a file
fix_apperror_in_file() {
    local file=$1
    echo "  Fixing $file..."
    
    # Use a temp file for safer replacements
    temp_file=$(mktemp)
    
    # Read through the file and fix AppError calls
    sed -E "s/new AppError\('([^']+)', ([0-9]+)\)/new AppError(\2, '\1')/g" "$file" > "$temp_file"
    
    # Only replace if changes were made
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        echo "    ✓ Fixed AppError calls"
    else
        rm "$temp_file"
        echo "    - No changes needed"
    fi
}

# Fix all service files
for service_file in src/services/*.service.ts; do
    if [ -f "$service_file" ]; then
        fix_apperror_in_file "$service_file"
    fi
done

echo ""
echo "Step 2: Checking current container status..."
echo "--------------------------------------------"
cd ..
docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "Error checking containers"

echo ""
echo "Step 3: Rebuilding Docker containers..."
echo "---------------------------------------"
echo "Stopping containers..."
docker-compose down 2>/dev/null || true

echo "Building and starting containers..."
docker-compose up -d --build

echo ""
echo "Step 4: Waiting for services to be ready..."
echo "-------------------------------------------"

echo "Waiting for database..."
for i in {1..30}; do
    if docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; then
        echo "✓ Database is ready"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

echo "Waiting for backend API..."
sleep 5
for i in {1..30}; do
    if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✓ Backend API is ready"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

echo ""
echo "Step 5: Deployment Status"
echo "========================="
echo ""

# Container status
echo "Container Status:"
echo "-----------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null

echo ""
echo "Backend Health Check:"
echo "--------------------"
health_response=$(curl -s http://localhost:3000/api/health 2>/dev/null || echo '{"error": "Backend not responding"}')
echo "$health_response" | python3 -m json.tool 2>/dev/null || echo "$health_response"

echo ""
echo "Recent Backend Logs:"
echo "-------------------"
docker logs university_backend --tail 20 2>&1 | tail -15

echo ""
echo "================================================="
echo "Deployment Complete!"
echo "================================================="
echo ""
echo "Next steps:"
echo "  1. Check if backend is healthy above"
echo "  2. Run: ./backend/scripts/test-all-endpoints.sh"
echo "  3. Run: ./backend/scripts/test-workflows.sh"
echo ""
