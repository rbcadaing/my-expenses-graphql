#!/bin/sh
set -e

echo "Starting application..."

# Note: For Prisma 7, migrations should be run using the prisma.config.ts
# You can run migrations manually with: docker-compose exec app npx prisma migrate deploy
# Or run them before starting: npx prisma migrate deploy (if prisma config is properly set)

echo "Starting server..."
exec "$@"
