#!/bin/bash

# BloodConnect Startup Script for macOS/Linux

echo "🩸 BloodConnect - Startup Script"
echo "================================"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi
echo "✓ Python found: $(python3 --version)"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+"
    exit 1
fi
echo "✓ Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm 8+"
    exit 1
fi
echo "✓ npm found: $(npm --version)"

# Create backend venv if not exists
if [ ! -d "backend/venv" ]; then
    echo ""
    echo "📦 Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    cd ..
    echo "✓ Virtual environment created"
fi

# Install frontend dependencies if not exists
if [ ! -d "frontend/node_modules" ]; then
    echo ""
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✓ Frontend dependencies installed"
fi

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn main:app --reload"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Terminal 3 (MongoDB):"
echo "  mongod"
echo ""
echo "Then visit: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""
