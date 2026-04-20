# ─── Stage 1: Dependencies ───
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./

# npm install (not npm ci) to resolve correct platform-specific native binaries
# npm ci strictly uses the lockfile which only has Windows binaries when generated on Windows
# npm install still respects lockfile version pinning but correctly resolves
# optional dependencies like lightningcss-linux-x64-gnu for the current platform
RUN npm install --prefer-offline

# ─── Stage 2: Build ───
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ─── Stage 3: Production ───
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
