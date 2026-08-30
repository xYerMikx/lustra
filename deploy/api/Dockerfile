FROM node:24-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /repo
ENV HUSKY=0

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/landing/package.json apps/landing/
COPY packages/db/package.json packages/db/
COPY packages/contracts/package.json packages/contracts/
COPY packages/config/package.json packages/config/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile --filter @lumira/api...

FROM deps AS build
COPY . .
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build?schema=public
ENV DIRECT_URL=postgresql://build:build@127.0.0.1:5432/build?schema=public
RUN pnpm --filter @lumira/contracts build \
  && pnpm --filter @lumira/db build \
  && pnpm --filter @lumira/api build

FROM node:24-bookworm-slim AS runner
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /repo
ENV NODE_ENV=production
ENV PATH="/repo/packages/db/node_modules/.bin:/repo/node_modules/.bin:$PATH"
COPY --from=build /repo /repo
COPY deploy/api/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
WORKDIR /repo/apps/api
EXPOSE 3333
ENTRYPOINT ["/entrypoint.sh"]
