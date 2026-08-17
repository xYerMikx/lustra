#!/bin/sh
set -eu

prisma migrate deploy --schema=/repo/packages/db/prisma/schema.prisma

if [ -n "${ADMIN_BOOTSTRAP_EMAIL:-}" ] && [ -n "${ADMIN_BOOTSTRAP_PASSWORD:-}" ]; then
  tsx /repo/apps/api/src/scripts/ensure-admin.ts
fi

exec node dist/main.js
