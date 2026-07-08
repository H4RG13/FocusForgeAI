#!/bin/bash
set -e

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Cache config and routes for production
php artisan config:cache
php artisan route:cache
php artisan event:cache

# Run migrations
php artisan migrate --force

exec "$@"
