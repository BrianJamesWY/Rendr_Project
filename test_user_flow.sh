#!/bin/bash
# Test critical user flows

BACKEND_URL="https://verifyvideos.preview.emergentagent.com/api"

echo "====================================="
echo "Testing Critical User Flows"
echo "====================================="
echo ""

# Test 1: Load creator profile
echo "[TEST 1] Loading creator profile..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/@/BrianJames")
if [ "$RESPONSE" = "200" ]; then
    echo "✓ Creator profile loads successfully"
else
    echo "✗ Creator profile failed: HTTP $RESPONSE"
fi
echo ""

# Test 2: Load creator videos
echo "[TEST 2] Loading creator videos..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/@/BrianJames/videos")
if [ "$RESPONSE" = "200" ]; then
    echo "✓ Creator videos load successfully"
else
    echo "✗ Creator videos failed: HTTP $RESPONSE"
fi
echo ""

# Test 3: Explore page
echo "[TEST 3] Testing explore endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/explore/creators")
if [ "$RESPONSE" = "200" ]; then
    echo "✓ Explore endpoint works"
else
    echo "✗ Explore endpoint failed: HTTP $RESPONSE"
fi
echo ""

# Test 4: Premium folders
echo "[TEST 4] Testing premium folders..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/premium-folders")
if [ "$RESPONSE" = "200" ]; then
    echo "✓ Premium folders endpoint works"
else
    echo "✗ Premium folders failed: HTTP $RESPONSE"
fi
echo ""

# Test 5: Stripe webhook
echo "[TEST 5] Testing Stripe webhook endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BACKEND_URL}/stripe/webhook")
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "400" ]; then
    echo "✓ Stripe webhook endpoint accessible"
else
    echo "✗ Stripe webhook failed: HTTP $RESPONSE"
fi
echo ""

echo "====================================="
echo "Flow testing complete"
echo "====================================="
