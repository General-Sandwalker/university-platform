#!/bin/bash

# Start Frontend Development Server for University Platform

echo "🎨 Starting Frontend Development Server..."

cd "$(dirname "$0")/../frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🚀 Starting Vite dev server on http://localhost:5173"
npm run dev
