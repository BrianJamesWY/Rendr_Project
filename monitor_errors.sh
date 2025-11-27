#!/bin/bash
# Real-time error monitoring for RENDR platform
# Usage: ./monitor_errors.sh [backend|frontend|all]

MODE="${1:-all}"

echo "======================================"
echo "RENDR Real-Time Error Monitor"
echo "Mode: $MODE"
echo "Press Ctrl+C to stop"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

monitor_backend() {
    echo -e "${BLUE}[BACKEND ERRORS]${NC}"
    tail -f /var/log/supervisor/backend.err.log | while read line; do
        if echo "$line" | grep -iq "error"; then
            echo -e "${RED}[ERROR]${NC} $line"
        elif echo "$line" | grep -iq "warning"; then
            echo -e "${YELLOW}[WARN]${NC} $line"
        else
            echo -e "${GREEN}[INFO]${NC} $line"
        fi
    done
}

monitor_frontend() {
    echo -e "${BLUE}[FRONTEND ERRORS]${NC}"
    tail -f /var/log/supervisor/frontend.err.log | while read line; do
        if echo "$line" | grep -iq "error"; then
            echo -e "${RED}[ERROR]${NC} $line"
        elif echo "$line" | grep -iq "warning"; then
            echo -e "${YELLOW}[WARN]${NC} $line"
        else
            echo -e "${GREEN}[INFO]${NC} $line"
        fi
    done
}

monitor_all() {
    # Monitor both logs simultaneously
    (tail -f /var/log/supervisor/backend.err.log | while read line; do
        echo -e "${BLUE}[BACKEND]${NC} $line"
    done) &
    
    (tail -f /var/log/supervisor/frontend.err.log | while read line; do
        echo -e "${GREEN}[FRONTEND]${NC} $line"
    done) &
    
    wait
}

case "$MODE" in
    backend)
        monitor_backend
        ;;
    frontend)
        monitor_frontend
        ;;
    all)
        monitor_all
        ;;
    *)
        echo "Usage: $0 [backend|frontend|all]"
        exit 1
        ;;
esac
