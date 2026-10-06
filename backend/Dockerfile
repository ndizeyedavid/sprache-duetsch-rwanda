FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json prisma7.config.ts ./
COPY prisma ./prisma
RUN DATABASE_URL=postgresql://build:build@localhost/build npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gosu ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json package-lock.json prisma7.config.ts ./
COPY prisma ./prisma
COPY assets ./assets
COPY public-logo.png ./public-logo.png
COPY deploy/entrypoint.sh /usr/local/bin/sparch-entrypoint
# Prefetch the migration engine for this runtime's OpenSSL version as root.
RUN DATABASE_URL=postgresql://build:build@localhost/build npx prisma --version
RUN mkdir -p uploads && chown node:node uploads
RUN chmod +x /usr/local/bin/sparch-entrypoint
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["sparch-entrypoint"]
CMD ["npm", "run", "start:deploy"]
