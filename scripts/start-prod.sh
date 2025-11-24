#!/bin/bash

# Start Production Environment for University Platform

echo "🚀 Starting University Platform (Production Mode)..."

# Check if .env.production exists
if [ ! -f ./backend/.env.production ]; then
    echo "❌ ERROR: ./backend/.env.production file not found!"
    echo "Please create it with your production configuration."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run migrations
echo "🔄 Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend npm run migration:run

# Show logs
echo ""
echo "📋 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Production environment is running!"
echo ""
echo "📍 Backend API: http://localhost:3000"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  - Restart backend: docker-compose -f docker-compose.prod.yml restart backend"
echo ""
