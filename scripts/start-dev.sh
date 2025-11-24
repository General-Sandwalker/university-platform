#!/bin/bash

# Start Development Environment for University Platform

echo "🚀 Starting University Platform (Development Mode)..."

# Check if .env exists
if [ ! -f ./backend/.env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp ./backend/.env.example ./backend/.env
    echo "✅ Please update ./backend/.env with your configuration."
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Show logs
echo ""
echo "📋 Service Status:"
docker-compose ps

echo ""
echo "✅ Development environment is running!"
echo ""
echo "📍 Backend API: http://localhost:3000"
echo "📍 API Docs: http://localhost:3000/api/docs"
echo "📍 PostgreSQL: localhost:5432"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart backend: docker-compose restart backend"
echo ""
