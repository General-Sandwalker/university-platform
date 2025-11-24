#!/bin/bash

set -e

echo "🌱 Database Seeding Script"
echo "=========================="
echo ""

# Change to project root
cd "$(dirname "$0")/../.."

# Check if containers are running
if ! docker ps | grep -q university_backend; then
    echo "❌ Error: Backend container is not running"
    echo "   Please start the services first:"
    echo "   docker-compose up -d"
    exit 1
fi

echo "📦 Running seed script in backend container..."
echo ""

docker-compose exec backend npm run seed

echo ""
echo "✅ Seeding complete!"
echo ""
echo "You can now test login with:"
echo "  CIN: ADMIN001"
echo "  Password: Admin@123456"
echo ""
