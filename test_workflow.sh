#!/bin/bash
# Test script for the new API workflow

BASE_URL="http://localhost:8000"

echo "🧪 Testing new API workflow..."
echo ""

# Step 1: Create Article
echo "1️⃣ Creating Article..."
ARTICLE=$(curl -s -X POST "$BASE_URL/articles/" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Test Article",
    "auteurs": "Test Author",
    "doi": "10.1234/test"
  }')
ARTICLE_ID=$(echo $ARTICLE | grep -o '"article_id":[0-9]*' | grep -o '[0-9]*')
echo "   Article created: ID=$ARTICLE_ID"
echo ""

# Step 2: Create Experience
echo "2️⃣ Creating Experience..."
EXPERIENCE=$(curl -s -X POST "$BASE_URL/experiences/" \
  -H "Content-Type: application/json" \
  -d "{
    \"description\": \"Test Experience\",
    \"article_id\": $ARTICLE_ID
  }")
EXPERIENCE_ID=$(echo $EXPERIENCE | grep -o '"experience_id":[0-9]*' | grep -o '[0-9]*')
echo "   Experience created: ID=$EXPERIENCE_ID"
echo ""

# Step 3: Create Machine
echo "3️⃣ Creating Machine..."
MACHINE=$(curl -s -X POST "$BASE_URL/machines/" \
  -H "Content-Type: application/json" \
  -d '{
    "constructeur": "VARIAN",
    "modele": "TrueBeam",
    "type_machine": "LINAC"
  }')
MACHINE_ID=$(echo $MACHINE | grep -o '"machine_id":[0-9]*' | grep -o '[0-9]*')
echo "   Machine created: ID=$MACHINE_ID"
echo ""

# Step 4: Link Machine to Experience
echo "4️⃣ Linking Machine to Experience..."
LINK=$(curl -s -X POST "$BASE_URL/experiences/$EXPERIENCE_ID/machines" \
  -H "Content-Type: application/json" \
  -d "{
    \"machine_id\": $MACHINE_ID,
    \"energy\": \"10MV\",
    \"collimation\": \"X300\",
    \"settings\": \"normal\"
  }")
echo "   Machine linked to experience"
echo ""

# Step 5: Get Experience Summary
echo "5️⃣ Getting Experience Summary..."
SUMMARY=$(curl -s -X GET "$BASE_URL/experiences/$EXPERIENCE_ID/summary")
echo "   Summary retrieved:"
echo $SUMMARY | jq .
echo ""

echo "✅ Test workflow completed successfully!"
