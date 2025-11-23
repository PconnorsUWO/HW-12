#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${GREEN}Starting HackWestern12 services...${NC}\n"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $FLASK_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    kill $EXPO_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup SIGINT SIGTERM

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: python3 is not installed${NC}"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: node is not installed${NC}"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

# Start Flask backend
echo -e "${YELLOW}Starting Flask backend on port 5001...${NC}"
cd "$SCRIPT_DIR/backend"
python3 server.py > /tmp/flask.log 2>&1 &
FLASK_PID=$!
cd "$SCRIPT_DIR"

# Wait a moment for Flask to start
sleep 2

# Check if Flask started successfully
if ! kill -0 $FLASK_PID 2>/dev/null; then
    echo -e "${RED}Error: Flask backend failed to start${NC}"
    cat /tmp/flask.log
    exit 1
fi

echo -e "${GREEN}✓ Flask backend started (PID: $FLASK_PID)${NC}"

# Start ngrok tunnel
echo -e "${YELLOW}Starting ngrok tunnel for port 5001...${NC}"
npx ngrok http 5001 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Wait a moment for ngrok to start
sleep 3

# Check if ngrok started successfully
if ! kill -0 $NGROK_PID 2>/dev/null; then
    echo -e "${RED}Error: ngrok failed to start${NC}"
    cat /tmp/ngrok.log
    exit 1
fi

echo -e "${GREEN}✓ ngrok tunnel started (PID: $NGROK_PID)${NC}"
echo -e "${YELLOW}Note: Check /tmp/ngrok.log for the ngrok URL${NC}\n"

# Start Expo frontend
echo -e "${YELLOW}Starting Expo frontend...${NC}"
npm start &
EXPO_PID=$!

echo -e "${GREEN}✓ Expo frontend started (PID: $EXPO_PID)${NC}\n"
echo -e "${GREEN}All services are running!${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Wait for all background processes
wait

