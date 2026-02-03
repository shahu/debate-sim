#!/bin/bash

# CPDL Debate Simulator - Unified Start Script
# Usage: ./start-server.sh [--debug] [DEEPSEEK_API_KEY]
# 
# This script starts both the Python backend and Vite frontend
# Backend runs on port 8000, Frontend on port 5173
#
# Options:
#   --debug    Enable debug mode (logs all prompts and responses)

# Pre-configured API Key (optional - environment variables preferred)
DEFAULT_DEEPSEEK_API_KEY=""

# Configuration
BACKEND_PORT=8000
FRONTEND_PORT=5173
BACKEND_URL="http://localhost:${BACKEND_PORT}"
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"

# Parse arguments
DEBUG_MODE=false
API_KEY=""

for arg in "$@"; do
    case $arg in
        --debug)
            DEBUG_MODE=true
            shift
            ;;
        --help|-h)
            echo "Usage: ./start-server.sh [--debug] [DEEPSEEK_API_KEY]"
            echo ""
            echo "Options:"
            echo "  --debug    Enable debug mode (logs all DeepSeek prompts and responses)"
            echo "  --help     Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./start-server.sh                      # Start with default config"
            echo "  ./start-server.sh --debug              # Start with debug logging"
            echo "  ./start-server.sh YOUR_API_KEY         # Start with custom API key"
            echo "  ./start-server.sh --debug YOUR_KEY     # Start with debug + custom key"
            exit 0
            ;;
        *)
            API_KEY="$arg"
            ;;
    esac
done

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Cleanup function to kill background processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${BLUE}✓${NC} Backend stopped"
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${BLUE}✓${NC} Frontend stopped"
    fi
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  CPDL Debate Simulator - Full Stack Startup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if API key is provided as argument or already set
if [ -n "$API_KEY" ]; then
    export DEEPSEEK_API_KEY="$API_KEY"
    echo -e "${GREEN}✓${NC} API key set from command line argument"
elif [ -n "$DEEPSEEK_API_KEY" ]; then
    echo -e "${GREEN}✓${NC} API key found in environment variable"
elif [ -n "$DEFAULT_DEEPSEEK_API_KEY" ]; then
    export DEEPSEEK_API_KEY="$DEFAULT_DEEPSEEK_API_KEY"
    echo -e "${GREEN}✓${NC} API key set from script configuration"
else
    echo -e "${YELLOW}⚠${NC} No API key configured"
    echo ""
    echo -e "${YELLOW}To configure an API key:${NC}"
    echo '  ./start-server.sh YOUR_API_KEY'
    echo ""
fi

# Show debug mode status
if [ "$DEBUG_MODE" = true ]; then
    echo ""
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}  🔍 DEBUG MODE ENABLED${NC}"
    echo -e "${MAGENTA}  All prompts and responses will be logged${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
fi

# Verify we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}✗${NC} Error: package.json not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

if [ ! -f "backend/main.py" ]; then
    echo -e "${RED}✗${NC} Error: backend/main.py not found"
    echo "Please ensure the backend directory exists"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  STEP 1: Starting Python Backend${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗${NC} Python 3 is not installed"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

# Check if backend virtual environment exists, create if not
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}⚠${NC} Backend virtual environment not found. Creating..."
    cd backend
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗${NC} Failed to create virtual environment"
        exit 1
    fi
    cd ..
    echo -e "${GREEN}✓${NC} Virtual environment created"
fi

# Install backend dependencies if needed
if [ ! -f "backend/venv/lib/python*/site-packages/fastapi" ] 2>/dev/null || \
   [ "backend/requirements.txt" -nt "backend/venv/.requirements_installed" ] 2>/dev/null; then
    echo -e "${YELLOW}⚠${NC} Installing backend dependencies..."
    cd backend
    source venv/bin/activate
    pip install -r requirements.txt -q
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗${NC} Failed to install backend dependencies"
        exit 1
    fi
    touch .requirements_installed
    cd ..
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${GREEN}✓${NC} Backend dependencies already installed"
fi

# Check backend .env file
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠${NC} Backend .env file not found. Creating from template..."
    if [ -n "$DEEPSEEK_API_KEY" ]; then
        echo "DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY" > backend/.env
        echo -e "${GREEN}✓${NC} Created backend/.env with API key"
    else
        cp backend/.env.example backend/.env
        echo -e "${YELLOW}⚠${NC} Created backend/.env from template (please add your API key)"
    fi
else
    # Update backend .env with current API key if provided
    if [ -n "$DEEPSEEK_API_KEY" ]; then
        if ! grep -q "DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY" backend/.env; then
            echo "DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY" > backend/.env
            echo -e "${GREEN}✓${NC} Updated backend/.env with API key"
        fi
    fi
fi

# Add debug mode to .env if enabled
if [ "$DEBUG_MODE" = true ]; then
    if ! grep -q "^DEBUG=true" backend/.env; then
        echo "" >> backend/.env
        echo "# Debug mode - logs all prompts and responses" >> backend/.env
        echo "DEBUG=true" >> backend/.env
        echo "LOG_LEVEL=DEBUG" >> backend/.env
        echo -e "${MAGENTA}🔍${NC} Debug logging enabled in backend/.env"
    fi
else
    # Remove debug flags if present
    sed -i '' '/^DEBUG=true/d' backend/.env 2>/dev/null || true
    sed -i '' '/^LOG_LEVEL=DEBUG/d' backend/.env 2>/dev/null || true
fi

# Kill any existing backend processes
pkill -f "uvicorn main:app" 2>/dev/null || true
sleep 1

# Start backend in background
echo -e "${CYAN}▶${NC} Starting backend server on port $BACKEND_PORT..."
cd backend
source venv/bin/activate

if [ "$DEBUG_MODE" = true ]; then
    # In debug mode, show logs in terminal
    uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT --reload --log-level debug &
    BACKEND_PID=$!
else
    # Normal mode, log to file
    uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT --reload > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
fi
cd ..

# Wait for backend to be ready
echo -e "${CYAN}⏳${NC} Waiting for backend to start..."
for i in {1..30}; do
    if curl -s "http://localhost:$BACKEND_PORT/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend is ready at ${CYAN}$BACKEND_URL${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗${NC} Backend failed to start within 30 seconds"
        if [ "$DEBUG_MODE" = false ]; then
            echo "Check logs: tail -f /tmp/backend.log"
        fi
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  STEP 2: Starting Frontend${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠${NC} Frontend dependencies not found. Installing..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗${NC} Failed to install frontend dependencies"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
fi

# Kill any existing Vite processes
pkill -f "vite" 2>/dev/null || true
sleep 1

# Check if API key is configured
if [ -n "$DEEPSEEK_API_KEY" ]; then
    echo -e "${GREEN}✓${NC} DeepSeekV3 API Key: ${DEEPSEEK_API_KEY:0:8}...${DEEPSEEK_API_KEY: -4}"
else
    echo -e "${YELLOW}⚠${NC}  Running without API key"
fi

# Build frontend
echo -e "${CYAN}▶${NC} Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}✗${NC} Frontend build failed"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi
echo -e "${GREEN}✓${NC} Frontend build successful"

echo ""
echo -e "${CYAN}▶${NC} Starting frontend dev server on port $FRONTEND_PORT..."
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo -e "${CYAN}⏳${NC} Waiting for frontend to start..."
for i in {1..30}; do
    if curl -s "http://localhost:$FRONTEND_PORT" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Frontend is ready at ${CYAN}$FRONTEND_URL${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗${NC} Frontend failed to start within 30 seconds"
        echo "Check logs: tail -f /tmp/frontend.log"
        cleanup
        exit 1
    fi
done

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✓ Both servers are running!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Backend API:${NC}  $BACKEND_URL"
echo -e "${CYAN}Frontend:${NC}    $FRONTEND_URL"
echo ""
echo -e "${BLUE}API Endpoints:${NC}"
echo "  • Health:     $BACKEND_URL/api/health"
echo "  • Debate:     $BACKEND_URL/api/debate/stream"
echo "  • TTS:        $BACKEND_URL/api/tts/generate"
echo ""

if [ "$DEBUG_MODE" = true ]; then
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}  🔍 DEBUG MODE ACTIVE${NC}"
    echo -e "${MAGENTA}  All DeepSeek prompts and responses are logged above${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
fi

echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Wait for both processes
wait
