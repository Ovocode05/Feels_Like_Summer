#!/bin/bash

# Load Test Script for Recommendation System
# Tests cache performance and concurrent request handling

# Configuration
BASE_URL="http://localhost:8080"
ENDPOINT="/api/v1/recommendations"
TOKEN="YOUR_AUTH_TOKEN_HERE"  # Replace with actual token
CONCURRENT_USERS=50
TOTAL_REQUESTS=500

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "================================================"
echo "Recommendation System Load Test"
echo "================================================"
echo ""

# Check if authorization token is set
if [ "$TOKEN" = "YOUR_AUTH_TOKEN_HERE" ]; then
    echo -e "${RED}ERROR: Please set your authorization token in the script${NC}"
    echo "Get your token by logging in and copying from browser dev tools"
    exit 1
fi

# Test 1: Single Request (Cold Cache)
echo -e "${YELLOW}Test 1: Cold Cache Request${NC}"
echo "Making initial request to populate cache..."
START_TIME=$(date +%s%N)
RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL$ENDPOINT")
END_TIME=$(date +%s%N)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
TIME_TAKEN=$(echo "$RESPONSE" | tail -n 2 | head -n 1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Request successful${NC}"
    echo "Time taken: ${TIME_TAKEN}s"
    
    # Check if cached
    CACHED=$(echo "$RESPONSE" | grep -o '"cached":[^,}]*' | cut -d':' -f2)
    if [ "$CACHED" = "false" ]; then
        echo -e "${GREEN}✓ Cold cache confirmed (cached: false)${NC}"
    fi
else
    echo -e "${RED}✗ Request failed with HTTP $HTTP_CODE${NC}"
    exit 1
fi

echo ""

# Test 2: Warm Cache Request
echo -e "${YELLOW}Test 2: Warm Cache Request${NC}"
echo "Making cached request..."
sleep 1
START_TIME=$(date +%s%N)
RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL$ENDPOINT")
END_TIME=$(date +%s%N)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
TIME_TAKEN=$(echo "$RESPONSE" | tail -n 2 | head -n 1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Request successful${NC}"
    echo "Time taken: ${TIME_TAKEN}s"
    
    # Check if cached
    CACHED=$(echo "$RESPONSE" | grep -o '"cached":[^,}]*' | cut -d':' -f2)
    if [ "$CACHED" = "true" ]; then
        echo -e "${GREEN}✓ Cache hit confirmed (cached: true)${NC}"
    else
        echo -e "${YELLOW}⚠ Expected cache hit but got cache miss${NC}"
    fi
else
    echo -e "${RED}✗ Request failed with HTTP $HTTP_CODE${NC}"
    exit 1
fi

echo ""

# Test 3: Multiple Rapid Requests (Cache Performance)
echo -e "${YELLOW}Test 3: Rapid Sequential Requests (Cache Test)${NC}"
echo "Making 10 rapid requests..."
TOTAL_TIME=0
SUCCESS_COUNT=0
CACHE_HITS=0

for i in {1..10}; do
    RESPONSE=$(curl -s -w "\n%{time_total}" \
        -H "Authorization: Bearer $TOKEN" \
        "$BASE_URL$ENDPOINT")
    
    TIME_TAKEN=$(echo "$RESPONSE" | tail -n 1)
    TOTAL_TIME=$(echo "$TOTAL_TIME + $TIME_TAKEN" | bc)
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    
    CACHED=$(echo "$RESPONSE" | grep -o '"cached":[^,}]*' | cut -d':' -f2)
    if [ "$CACHED" = "true" ]; then
        CACHE_HITS=$((CACHE_HITS + 1))
    fi
done

AVG_TIME=$(echo "scale=3; $TOTAL_TIME / 10" | bc)
echo -e "${GREEN}✓ Completed $SUCCESS_COUNT requests${NC}"
echo "Average time: ${AVG_TIME}s"
echo "Cache hits: $CACHE_HITS/10 ($(echo "scale=0; $CACHE_HITS * 100 / 10" | bc)%)"

if [ $CACHE_HITS -ge 8 ]; then
    echo -e "${GREEN}✓ Cache is working well (>80% hit rate)${NC}"
else
    echo -e "${YELLOW}⚠ Cache hit rate is low (<80%)${NC}"
fi

echo ""

# Test 4: Concurrent Requests (using Apache Bench if available)
echo -e "${YELLOW}Test 4: Concurrent Load Test${NC}"

if command -v ab &> /dev/null; then
    echo "Running Apache Bench with $CONCURRENT_USERS concurrent users, $TOTAL_REQUESTS total requests..."
    ab -n $TOTAL_REQUESTS -c $CONCURRENT_USERS \
        -H "Authorization: Bearer $TOKEN" \
        "$BASE_URL$ENDPOINT" > /tmp/ab_results.txt 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Load test completed${NC}"
        echo ""
        echo "Results:"
        grep "Requests per second" /tmp/ab_results.txt
        grep "Time per request" /tmp/ab_results.txt | head -n 1
        grep "Failed requests" /tmp/ab_results.txt
        
        # Check for failures
        FAILED=$(grep "Failed requests" /tmp/ab_results.txt | awk '{print $3}')
        if [ "$FAILED" = "0" ]; then
            echo -e "${GREEN}✓ No failed requests${NC}"
        else
            echo -e "${RED}✗ $FAILED requests failed${NC}"
        fi
    else
        echo -e "${RED}✗ Load test failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Apache Bench (ab) not installed, skipping concurrent load test${NC}"
    echo "Install with: brew install apache2-utils (macOS) or apt-get install apache2-utils (Ubuntu)"
fi

echo ""
echo "================================================"
echo "Load Test Complete"
echo "================================================"
echo ""
echo "Summary:"
echo "- Cold cache requests should take 200-500ms"
echo "- Warm cache requests should take <10ms"
echo "- Cache hit rate should be >80%"
echo "- No failed requests under load"
echo ""
echo "To install Apache Bench for full load testing:"
echo "  macOS: brew install apache2-utils"
echo "  Ubuntu: apt-get install apache2-utils"
