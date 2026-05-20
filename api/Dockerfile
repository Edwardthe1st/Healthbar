# ─── Stage 1: builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# openssl is required by Prisma's query engine on Alpine (OpenSSL 3.x)
RUN apk add --no-cache openssl

# Install all dependencies (including devDependencies for tsc)
COPY package*.json ./
RUN npm ci

# Generate Prisma client before compiling TypeScript
COPY prisma ./prisma
RUN npx prisma generate

# Compile TypeScript (src → dist/) and seed (prisma → dist/prisma/)
COPY tsconfig.json tsconfig.seed.json ./
COPY src ./src
RUN npm run build && npx tsc --project tsconfig.seed.json

# ─── Stage 2: runner ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# openssl is required by Prisma's query engine on Alpine (OpenSSL 3.x)
RUN apk add --no-cache openssl

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema + generated client (already generated in builder stage)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

# Copy compiled output
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
