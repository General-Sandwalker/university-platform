#!/bin/bash

# Build Frontend for Production

echo "🏗️  Building Frontend for Production..."

cd "$(dirname "$0")/../frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build complete! Output is in frontend/dist"
echo "📂 To preview: cd frontend && npm run preview"
