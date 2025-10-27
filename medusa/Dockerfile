# Medusa service Dockerfile
# Use Node 20 LTS
FROM node:20-alpine AS base

# Set working directory
WORKDIR /server

# Install dependencies (use yarn)
RUN corepack enable

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./

# Install deps
RUN yarn install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Give execute permissions to the startup script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Start with migrations and then the development server
CMD ["./start.sh"]

# # Production image
# FROM node:20-alpine AS runner
# WORKDIR /server
# ENV NODE_ENV=production
# RUN corepack enable

# # Copy node_modules and build artifacts from builder
# COPY --from=base /server/node_modules ./node_modules
# # Medusa build outputs to .medusa (includes server + admin build)
# COPY --from=base /server/.medusa ./.medusa
# COPY --from=base /server/package.json ./package.json
# COPY --from=base /server/medusa-config.ts ./medusa-config.ts
# COPY --from=base /server/tsconfig.json ./tsconfig.json

# # Copy the startup script and make it executable
# COPY start.sh ./start.sh
# RUN chmod +x ./start.sh

# # Expose Medusa default port
# EXPOSE 9000

# # Start Medusa server
# CMD ["./start.sh"]
