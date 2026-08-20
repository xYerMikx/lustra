#!/bin/sh
set -eu

# Prisma's post-migrate update/checkpoint HTTP can hang for minutes on Railway
# pre-deploy. CI + these flags skip it. `exec` so pnpm does not wait on leftovers.
export CI=true
export PRISMA_HIDE_UPDATE_MESSAGE=true
export CHECKPOINT_DISABLE=1

root=$(pwd)
cd packages/db

if [ -x "$root/node_modules/.bin/prisma" ]; then
  exec "$root/node_modules/.bin/prisma" migrate deploy
fi

if [ -x node_modules/.bin/prisma ]; then
  exec node_modules/.bin/prisma migrate deploy
fi

exec pnpm exec prisma migrate deploy
