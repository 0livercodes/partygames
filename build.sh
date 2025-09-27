#!/bin/bash
# Build script for Render deployment

echo "📦 Installing frontend dependencies..."
cd frontend && npm install

echo "🏗️ Building React frontend..."
npm run build

echo "📦 Installing backend dependencies..."
cd ../backend && npm install

echo "✅ Build complete! Ready to start server."