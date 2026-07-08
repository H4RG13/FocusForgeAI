#!/bin/bash

PORT=${PORT:-80}
echo "Starting on port $PORT"
echo "DB_HOST=$DB_HOST DB_DATABASE=$DB_DATABASE DB_USERNAME=$DB_USERNAME"

# Configure Nginx to listen on Railway's PORT
sed -i "s/PORT_PLACEHOLDER/$PORT/" /etc/nginx/sites-available/default

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

php artisan config:cache  || echo "config:cache failed"
php artisan route:cache   || echo "route:cache failed"
php artisan migrate --force 2>&1 || echo "migrate failed"

# Start PHP-FPM in background, then Nginx in foreground
php-fpm --daemonize
exec "$@"
