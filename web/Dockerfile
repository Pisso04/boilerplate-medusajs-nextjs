# --- BUILD STAGE ---
FROM node:20-alpine AS builder
WORKDIR /app

# 1️⃣ Enable and prepare Yarn Berry (Corepack)
RUN corepack enable && corepack prepare yarn@3.2.3 --activate

# 2️⃣ Copy project files
COPY package.json yarn.lock ./
COPY . .

# 3️⃣ Set environment vars for build
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}
ENV MEDUSA_BACKEND_URL=${MEDUSA_BACKEND_URL}

# 4️⃣ Install dependencies
RUN yarn install --immutable

# 5️⃣ Build Next.js
RUN yarn build


# --- RUNTIME STAGE ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what’s needed at runtime
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/.yarnrc.yml ./.yarnrc.yml
COPY --from=builder /app/node_modules ./node_modules


# Enable Corepack in runtime container too (for Yarn CLI)
RUN corepack enable && corepack prepare yarn@3.2.3 --activate

EXPOSE 3000
CMD ["yarn", "start"]
