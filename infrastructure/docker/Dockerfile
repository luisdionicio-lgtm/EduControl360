FROM node:22-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@11.3.0
WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/database/package.json packages/database/package.json
RUN pnpm install --frozen-lockfile

FROM dependencies AS development
COPY . .
RUN pnpm db:generate && pnpm --filter @edu/database build && chown -R node:node /app/apps /app/packages
USER node

FROM development AS build
USER root
RUN pnpm build

FROM base AS api
ENV NODE_ENV=production API_HOST=0.0.0.0 API_PORT=4000
COPY --from=build --chown=node:node /app /app
USER node
EXPOSE 4000
CMD ["node","apps/api/dist/main.js"]

FROM base AS web
ENV NODE_ENV=production HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app /app
USER node
EXPOSE 3000
CMD ["pnpm","--filter","@edu/web","start"]
