#!/bin/bash

echo "🧪 RENDR BLOCKCHAIN INTEGRATION TEST"
echo "===================================="
echo ""

# Test 1: Check API is running
echo "Test 1: Check API is running..."
API_HEALTH=$(curl -s http://localhost:8001/api/health)
if [[ $API_HEALTH == *"healthy"* ]]; then
    echo "✅ API is running"
else
    echo "❌ API is not responding"
    exit 1
fi
echo ""

# Test 2: Check blockchain connection
echo "Test 2: Check blockchain connection..."
BLOCKCHAIN_STATUS=$(curl -s http://localhost:8001/api/blockchain/status)
echo "$BLOCKCHAIN_STATUS" | jq '.'

CONNECTED=$(echo "$BLOCKCHAIN_STATUS" | jq -r '.connected')
if [[ $CONNECTED == "true" ]]; then
    echo "✅ Connected to Polygon Amoy"
else
    echo "❌ Not connected to blockchain"
    exit 1
fi

BLOCKCHAIN_ENABLED=$(echo "$BLOCKCHAIN_STATUS" | jq -r '.blockchain_enabled')
if [[ $BLOCKCHAIN_ENABLED == "true" ]]; then
    echo "✅ Blockchain private key configured"
    WALLET=$(echo "$BLOCKCHAIN_STATUS" | jq -r '.wallet_address')
    BALANCE=$(echo "$BLOCKCHAIN_STATUS" | jq -r '.balance_pol')
    echo "   Wallet: $WALLET"
    echo "   Balance: $BALANCE POL"
    
    if (( $(echo "$BALANCE < 0.001" | bc -l) )); then
        echo "⚠️  Warning: Low POL balance! Get more from faucet."
        echo "   https://faucet.polygon.technology/"
    fi
else
    echo "⚠️  Blockchain private key NOT configured"
    echo "   Videos will upload without blockchain proof"
    echo "   Add BLOCKCHAIN_PRIVATE_KEY to /app/backend/.env"
fi
echo ""

# Test 3: Test authentication
echo "Test 3: Test user authentication..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@rendr.com","password":"Test123!"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
if [[ $TOKEN != "null" && $TOKEN != "" ]]; then
    echo "✅ Authentication working"
    echo "   Token: ${TOKEN:0:20}..."
else
    echo "ℹ️  Test user doesn't exist (expected for fresh install)"
    echo "   Creating test user..."
    
    REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{"email":"test@rendr.com","password":"Test123!","display_name":"Test User"}')
    
    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
    if [[ $TOKEN != "null" && $TOKEN != "" ]]; then
        echo "✅ Test user created successfully"
    else
        echo "❌ Could not create test user"
        echo "$REGISTER_RESPONSE" | jq '.'
        exit 1
    fi
fi
echo ""

# Test 4: Check if test video exists
echo "Test 4: Check test video database..."
TEST_VIDEO=$(curl -s http://localhost:8001/api/verify/code \
  -H "Content-Type: application/json" \
  -d '{"verification_code":"RND-TEST01"}')

RESULT=$(echo "$TEST_VIDEO" | jq -r '.result')
if [[ $RESULT == "authentic" ]]; then
    echo "✅ Test video (RND-TEST01) exists"
    BLOCKCHAIN_VERIFIED=$(echo "$TEST_VIDEO" | jq -r '.metadata.blockchain_verified')
    if [[ $BLOCKCHAIN_VERIFIED == "true" ]]; then
        echo "✅ Test video has blockchain proof"
        BLOCKCHAIN_TX=$(echo "$TEST_VIDEO" | jq -r '.metadata.blockchain_tx')
        echo "   TX: $BLOCKCHAIN_TX"
    else
        echo "ℹ️  Test video created before blockchain integration"
    fi
else
    echo "ℹ️  Test video doesn't exist (expected for fresh install)"
fi
echo ""

# Summary
echo "===================================="
echo "📊 INTEGRATION STATUS SUMMARY"
echo "===================================="
echo ""
echo "✅ Backend API: Running"
echo "✅ MongoDB: Connected"
echo "✅ Polygon Amoy: Connected"

if [[ $BLOCKCHAIN_ENABLED == "true" ]]; then
    echo "✅ Blockchain: Enabled & Configured"
    echo ""
    echo "🎉 READY TO GO!"
    echo ""
    echo "Next steps:"
    echo "1. Upload a video via API"
    echo "2. Check blockchain TX on Polygonscan"
    echo "3. Verify video works"
else
    echo "⚠️  Blockchain: Connected but not configured"
    echo ""
    echo "⏭️  ALMOST READY!"
    echo ""
    echo "Next steps:"
    echo "1. Add BLOCKCHAIN_PRIVATE_KEY to /app/backend/.env"
    echo "2. Get test POL from https://faucet.polygon.technology/"
    echo "3. Restart backend: sudo supervisorctl restart backend"
    echo "4. Run this test again"
fi
echo ""
echo "📖 Read: /app/BLOCKCHAIN_SETUP_GUIDE.md for details"
echo ""
