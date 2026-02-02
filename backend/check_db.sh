#!/bin/bash
# Verify database integrity and see current state

echo "🔍 Checking database state..."
echo ""

# Connect to PostgreSQL and check tables
PGPASSWORD=password psql -h localhost -U dosimetry_user -d dosimetry_db -c "
SELECT schemaname, tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema' ORDER BY tablename;
" 2>/dev/null || echo "❌ Could not connect to database"

echo ""
echo "📊 Table row counts:"
PGPASSWORD=password psql -h localhost -U dosimetry_user -d dosimetry_db -c "
SELECT 'articles' as table_name, COUNT(*) as rows FROM articles
UNION ALL
SELECT 'experiences', COUNT(*) FROM experiences
UNION ALL
SELECT 'machines', COUNT(*) FROM machines
UNION ALL
SELECT 'experience_machine', COUNT(*) FROM experience_machine
UNION ALL
SELECT 'detecteurs', COUNT(*) FROM detecteurs
UNION ALL
SELECT 'experience_detecteur', COUNT(*) FROM experience_detecteur
UNION ALL
SELECT 'phantoms', COUNT(*) FROM phantoms
UNION ALL
SELECT 'experience_phantom', COUNT(*) FROM experience_phantom
UNION ALL
SELECT 'donnees', COUNT(*) FROM donnees
ORDER BY table_name;
" 2>/dev/null || echo "❌ Could not query tables"

echo ""
echo "🔗 Sample data from main tables:"
PGPASSWORD=password psql -h localhost -U dosimetry_user -d dosimetry_db -c "
SELECT 'Articles:';
SELECT article_id, titre FROM articles LIMIT 3;
SELECT 'Experiences:';
SELECT experience_id, description FROM experiences LIMIT 3;
SELECT 'Experience-Machine links:';
SELECT experience_id, machine_id FROM experience_machine LIMIT 3;
" 2>/dev/null || echo "❌ Could not query sample data"
