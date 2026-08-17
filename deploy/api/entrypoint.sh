#!/bin/sh
set -eu

prisma migrate deploy --schema=/app/prisma/schema.prisma

if [ -n "${ADMIN_BOOTSTRAP_EMAIL:-}" ] && [ -n "${ADMIN_BOOTSTRAP_PASSWORD:-}" ]; then
  tsx /app/scripts/ensure-admin.ts
fi

exec node dist/main.js
