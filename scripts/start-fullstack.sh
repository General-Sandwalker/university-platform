#!/bin/bash

# Start Full Stack (Backend + Frontend + Database)

echo "╔════════════════════════════════════════════════╗"
echo "║   University Platform - Full Stack Startup    ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")/.."

# Check if .env exists for backend
if [ ! -f ./backend/.env ]; then
    echo "⚠️  Creating backend/.env from example..."
    cp ./backend/.env.example ./backend/.env 2>/dev/null || echo "Warning: .env.example not found"
fi

# Check if frontend .env exists
if [ ! -f ./frontend/.env ]; then
    echo "📝 Creating frontend/.env..."
    cat > ./frontend/.env << 'EOF'
VITE_API_URL=http://localhost:3000/api/v1
EOF
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start all services
echo "🚀 Starting all services..."
echo ""
echo "   📊 Database:  PostgreSQL 17"
echo "   ⚙️  Backend:   Node.js API (port 3000)"
echo "   🎨 Frontend:  React App (port 80)"
echo ""

docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service health
echo ""
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║              🎉 READY TO USE! 🎉               ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "📍 Access Points:"
echo "   🌐 Frontend:     http://localhost"
echo "   🔌 Backend API:  http://localhost:3000/api/v1"
echo "   📚 API Docs:     http://localhost:3000/api/docs"
echo "   🗄️  Database:    localhost:5432"
echo ""
echo "📋 Useful Commands:"
echo "   View logs:       docker-compose logs -f"
echo "   Stop services:   docker-compose down"
echo "   Restart:         docker-compose restart"
echo ""
echo "🔐 Default Login:"
echo "   CIN:       ADMIN001"
echo "   Password:  Admin@123"
echo ""
