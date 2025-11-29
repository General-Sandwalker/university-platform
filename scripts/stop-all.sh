#!/bin/bash

# Stop all services

echo "🛑 Stopping University Platform services..."

cd "$(dirname "$0")/.."

docker-compose down

echo "✅ All services stopped"
echo ""
echo "To start again:"
echo "  Development:  ./scripts/start-dev-mode.sh"
echo "  Full Stack:   ./scripts/start-fullstack.sh"
echo "  Production:   ./scripts/start-prod.sh"
