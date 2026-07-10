FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN npm ci
COPY . .
RUN npm run build --workspace=@groweasy/shared-types
RUN npm run build --workspace=@groweasy/api

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Install production dependencies only
COPY package*.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN npm ci --omit=dev

COPY --from=builder --chown=expressjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=expressjs:nodejs /app/packages/shared-types/dist ./packages/shared-types/dist

USER expressjs
EXPOSE 8080
ENV PORT=8080
CMD ["node", "apps/api/dist/index.js"]
