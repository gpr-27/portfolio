# syntax=docker/dockerfile:1

############################
# Stage 1 — builder
############################
# Build the frontend (tsc -b && vite build) into the ROOT dist/.
# Needs ALL deps (vite, typescript, @vitejs/plugin-react, @types/* live in devDependencies).
FROM node:20-slim AS builder
WORKDIR /app

# Install deps first for good layer caching: this layer is reused
# whenever package*.json are unchanged, even if source changes.
COPY package.json package-lock.json ./
RUN npm ci

# Now bring in the rest of the source and build.
# vite.config.ts sets root=frontend/ and outDir=../dist, so this emits /app/dist.
COPY . .
RUN npm run build

############################
# Stage 2 — runner
############################
# Runtime: `tsx backend/server.ts` (ESM). tsx runs the .ts SOURCE at runtime,
# so backend/ must be present and tsx must be a prod dependency (it is).
# Express serves /app/dist (resolved as path.resolve(backend/__dirname, '../dist')),
# so backend/ and dist/ must stay siblings under the same WORKDIR (/app).
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Prod-only deps: express, mongodb, tsx, dotenv. No dev tooling in the runtime image.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy only what runtime needs from the builder, preserving the /app layout:
#  - dist/    : built static frontend served by Express
#  - backend/ : the .ts source tsx executes (server + lib/*)
#  - tsconfig*: project config referenced by the toolchain (harmless, kept for parity)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/tsconfig.json /app/tsconfig.app.json /app/tsconfig.node.json ./

# Drop root: run as the unprivileged `node` user that ships with the base image.
USER node

# Server listens on process.env.PORT, defaulting to 3000.
EXPOSE 3000

CMD ["npm", "start"]
