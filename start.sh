#!/bin/sh
set -e

echo "Starting deployment script..."

# Explicitly set the database URL to point to the mounted persistent disk
export DATABASE_URL="file:///data/sqlite.db"

echo "Initializing Prisma schema and migrating database..."
# Run Prisma push which handles syncing schema and database automatically
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

echo "Starting Node server..."
# Boot up the compiled backend
node dist/index.js
