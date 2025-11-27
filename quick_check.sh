#!/bin/bash
# Quick health check script for RENDR platform

echo "====================================="
echo "RENDR Quick Health Check"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if services are running
echo "[1] Service Status:"
sudo supervisorctl status | while read line; do
    if echo "$line" | grep -q "RUNNING"; then
        echo -e "${GREEN}✓${NC} $line"
    else
        echo -e "${RED}✗${NC} $line"
    fi
done
echo ""

# Check backend API
echo "[2] Backend API:"
if curl -s -f http://localhost:8001/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend responding on port 8001"
else
    echo -e "${RED}✗${NC} Backend not responding"
fi
echo ""

# Check frontend
echo "[3] Frontend:"
if curl -s -f http://localhost:3000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend responding on port 3000"
else
    echo -e "${RED}✗${NC} Frontend not responding"
fi
echo ""

# Check for recent errors in logs
echo "[4] Recent Errors:"
BACKEND_ERRORS=$(tail -n 50 /var/log/supervisor/backend.err.log 2>/dev/null | grep -i "error" | wc -l)
FRONTEND_ERRORS=$(tail -n 50 /var/log/supervisor/frontend.err.log 2>/dev/null | grep -i "error" | wc -l)

if [ "$BACKEND_ERRORS" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Backend: No recent errors"
else
    echo -e "${YELLOW}⚠${NC} Backend: $BACKEND_ERRORS errors in last 50 lines"
fi

if [ "$FRONTEND_ERRORS" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Frontend: No recent errors"
else
    echo -e "${YELLOW}⚠${NC} Frontend: $FRONTEND_ERRORS errors in last 50 lines"
fi
echo ""

# Check MongoDB connection
echo "[5] Database:"
if tail -n 100 /var/log/supervisor/backend.out.log | grep -q "MongoDB connected"; then
    echo -e "${GREEN}✓${NC} MongoDB connection established"
else
    echo -e "${YELLOW}⚠${NC} MongoDB connection status unclear"
fi
echo ""

echo "====================================="
echo "Run 'python3 /app/diagnostic_tool.py' for detailed diagnostics"
echo "====================================="
