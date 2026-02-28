#!/bin/sh
set -ex

echo "Starting deployment script..."

export PRISMA_CLIENT_ENGINE_TYPE="binary"
export PRISMA_CLI_QUERY_ENGINE_TYPE="binary"

echo "Initializing Prisma schema and syncing database directly..."
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

echo "Starting Node server..."
# Boot up the compiled backend
node dist/index.js
