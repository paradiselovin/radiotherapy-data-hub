#!/bin/bash
# Comprehensive Sanity Tests for Radiotherapy Data Hub

BASE_URL="http://localhost:8000"
PASS=0
FAIL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} $description (HTTP $http_code)"
        ((PASS++))
        echo "$body"
    else
        echo -e "${RED}✗${NC} $description (Expected $expected_status, got $http_code)"
        echo "  Response: $body"
        ((FAIL++))
    fi
    echo ""
}

echo "=========================================="
echo "SANITY TESTS - Radiotherapy Data Hub"
echo "=========================================="
echo ""

# ====== ARTICLES ======
echo "📄 ARTICLES TESTS"
echo "─────────────────"
test_endpoint "POST" "/articles/" \
    '{"titre":"Article Test","auteurs":"John Doe","doi":"10.1234/test"}' \
    "201" "Create Article"

ARTICLE_ID=$(curl -s -X POST "$BASE_URL/articles/" \
    -H "Content-Type: application/json" \
    -d '{"titre":"Test","auteurs":"Author","doi":"10.0/1"}' | \
    grep -o '"article_id":[0-9]*' | grep -o '[0-9]*' | head -1)

test_endpoint "GET" "/articles/" "" "200" "List Articles"
echo ""

# ====== EXPERIENCES ======
echo "🔬 EXPERIENCES TESTS"
echo "────────────────────"
test_endpoint "POST" "/experiences/" \
    '{"description":"Test Experience","article_id":'$ARTICLE_ID'}' \
    "201" "Create Experience with Article"

EXPERIENCE_ID=$(curl -s -X POST "$BASE_URL/experiences/" \
    -H "Content-Type: application/json" \
    -d '{"description":"Test","article_id":'$ARTICLE_ID'}' | \
    grep -o '"experience_id":[0-9]*' | grep -o '[0-9]*' | head -1)

test_endpoint "GET" "/experiences/" "" "200" "List Experiences"
test_endpoint "GET" "/experiences/$EXPERIENCE_ID/summary" "" "200" "Get Experience Summary"
echo ""

# ====== MACHINES ======
echo "🏭 MACHINES TESTS"
echo "──────────────────"
test_endpoint "POST" "/machines/" \
    '{"modele":"TrueBeam","constructeur":"VARIAN","type_machine":"LINAC"}' \
    "201" "Create Machine"

MACHINE_ID=$(curl -s -X POST "$BASE_URL/machines/" \
    -H "Content-Type: application/json" \
    -d '{"modele":"Elekta","constructeur":"Elekta","type_machine":"LINAC"}' | \
    grep -o '"machine_id":[0-9]*' | grep -o '[0-9]*' | head -1)

test_endpoint "GET" "/machines/" "" "200" "List Machines"

test_endpoint "POST" "/experiences/$EXPERIENCE_ID/machines" \
    '{"machine_id":'$MACHINE_ID',"energy":"10MV","collimation":"X300"}' \
    "201" "Link Machine to Experience"
echo ""

# ====== DETECTORS ======
echo "🎯 DETECTORS TESTS"
echo "───────────────────"
test_endpoint "POST" "/detectors/" \
    '{"type_detecteur":"ionizationChamber","modele":"FC65","constructeur":"IBA"}' \
    "201" "Create Detector"

DETECTOR_ID=$(curl -s -X POST "$BASE_URL/detectors/" \
    -H "Content-Type: application/json" \
    -d '{"type_detecteur":"chamber","modele":"test","constructeur":"test"}' | \
    grep -o '"detecteur_id":[0-9]*' | grep -o '[0-9]*' | head -1)

test_endpoint "GET" "/detectors/" "" "200" "List Detectors"

test_endpoint "POST" "/experiences/$EXPERIENCE_ID/detectors" \
    '{"detector_id":'$DETECTOR_ID',"position":"surface","depth":"1.5cm","orientation":"perpendicular"}' \
    "201" "Link Detector to Experience"
echo ""

# ====== PHANTOMS ======
echo "👻 PHANTOMS TESTS"
echo "──────────────────"
test_endpoint "POST" "/phantoms/" \
    '{"name":"RW3","phantom_type":"solid","dimensions":"10x10x10","material":"plastic"}' \
    "201" "Create Phantom"

PHANTOM_ID=$(curl -s -X POST "$BASE_URL/phantoms/" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","phantom_type":"solid","dimensions":"5x5x5","material":"water"}' | \
    grep -o '"phantom_id":[0-9]*' | grep -o '[0-9]*' | head -1)

test_endpoint "GET" "/phantoms/" "" "200" "List Phantoms"

test_endpoint "POST" "/experiences/$EXPERIENCE_ID/phantoms" \
    '{"phantom_id":'$PHANTOM_ID'}' \
    "201" "Link Phantom to Experience"
echo ""

# ====== DATA (DONNEES) ======
echo "📊 DATA TESTS"
echo "──────────────"
test_endpoint "GET" "/donnees/" "" "200" "List Data"
echo ""

# ====== SUMMARY ======
echo "📋 FINAL SUMMARY TEST"
echo "─────────────────────"
test_endpoint "GET" "/experiences/$EXPERIENCE_ID/summary" "" "200" "Get Complete Experience Summary"
echo ""

# ====== RESULTS ======
echo "=========================================="
echo -e "RESULTS: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo "=========================================="

if [ $FAIL -gt 0 ]; then
    exit 1
fi
