#!/bin/sh

# Add drone_extension module to Medusa
echo "Adding drone_extension module to Medusa..."
npx medusa db:generate drone_extension

# Run migrations and start server
echo "Running database migrations..."
npx medusa db:migrate

echo "Seeding database..."
yarn seed
echo "🚀 Starting Medusa server..."
yarn dev