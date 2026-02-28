#!/bin/sh
set -ex

echo "Starting deployment script..."

# Explicitly set the database URL to point to the mounted persistent disk
export DATABASE_URL="file:///data/sqlite.db"
export PRISMA_CLIENT_ENGINE_TYPE="binary"
export PRISMA_CLI_QUERY_ENGINE_TYPE="binary"

echo "Checking data directory..."
ls -la /data || echo "No /data directory"

echo "Initializing Prisma schema and migrating database..."
# Run Prisma push which handles syncing schema and database automatically
npx prisma migrate deploy --schema=./prisma/schema.prisma || npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

echo "Starting Node server..."
# Boot up the compiled backend
node dist/index.js
