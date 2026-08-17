FROM node:24-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /repo

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/landing/package.json apps/landing/
COPY packages/db/package.json packages/db/
COPY packages/contracts/package.json packages/contracts/
COPY packages/config/package.json packages/config/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
# Dummy URLs so `prisma generate` can parse the schema. Real DATABASE_URL
# comes from `.env.production` at container start, not baked into the image.
ENV DATABASE_URL=postgresql://prisma:prisma@127.0.0.1:5432/prisma?schema=public
ENV DIRECT_URL=postgresql://prisma:prisma@127.0.0.1:5432/prisma?schema=public
RUN pnpm --filter @lustra/contracts build \
  && pnpm --filter @lustra/db build \
  && pnpm --filter @lustra/api build
RUN pnpm --filter @lustra/api --prod deploy /out

FROM node:24-bookworm-slim AS runner
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && npm install -g prisma@6.1.0 tsx@4.19.2
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /out/ ./
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/packages/db/prisma ./prisma
COPY --from=build /repo/apps/api/src/scripts/ensure-admin.ts ./scripts/ensure-admin.ts
COPY deploy/api/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 3333
ENTRYPOINT ["/entrypoint.sh"]
