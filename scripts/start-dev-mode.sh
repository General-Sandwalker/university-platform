#!/bin/bash

# Development Mode - Frontend with Hot Reload

echo "🔥 Starting Full Stack in Development Mode..."
echo ""

cd "$(dirname "$0")/.."

# Check environment files
if [ ! -f ./backend/.env ]; then
    echo "⚠️  Creating backend/.env..."
    cp ./backend/.env.example ./backend/.env 2>/dev/null || echo "Warning: backend/.env.example not found"
fi

if [ ! -f ./frontend/.env ]; then
    echo "📝 Creating frontend/.env..."
    cat > ./frontend/.env << 'EOF'
VITE_API_URL=http://localhost:3000/api/v1
EOF
fi

# Start backend and database with Docker
echo "🐳 Starting backend and database..."
docker-compose up -d db backend

echo "⏳ Waiting for backend to be ready..."
sleep 5

# Start frontend with Vite (hot reload)
echo ""
echo "🎨 Starting frontend development server..."
echo "   Frontend will run with hot reload on port 5173"
echo ""

cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║         🚀 DEVELOPMENT MODE ACTIVE! 🚀         ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "📍 Access Points:"
echo "   🌐 Frontend:     http://localhost:5173  (Hot Reload)"
echo "   🔌 Backend API:  http://localhost:3000/api/v1"
echo "   📚 API Docs:     http://localhost:3000/api/docs"
echo ""
echo "💡 Frontend changes will auto-reload!"
echo "💡 Backend changes require: docker-compose restart backend"
echo ""

npm run dev
