#!/bin/bash

# Create necessary directories for the application

echo "Creating directory structure..."

# Create uploads directories
mkdir -p uploads/user-imports
mkdir -p uploads/excuse-documents
mkdir -p uploads/profile-pictures

# Create logs directory
mkdir -p logs

# Set permissions
chmod 755 uploads
chmod 755 uploads/user-imports
chmod 755 uploads/excuse-documents
chmod 755 uploads/profile-pictures
chmod 755 logs

echo "✅ Directory structure created successfully!"
echo ""
echo "Created directories:"
echo "  - uploads/user-imports       (for CSV user imports)"
echo "  - uploads/excuse-documents   (for absence excuse documents)"
echo "  - uploads/profile-pictures   (for user profile images)"
echo "  - logs                       (for application logs)"
