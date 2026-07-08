#!/bin/bash

# Railway injects $PORT — configure Apache to listen on it
PORT=${PORT:-80}
sed -i "s/Listen 80/Listen $PORT/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost *:$PORT>/" /etc/apache2/sites-available/000-default.conf

echo "Starting on port $PORT"
echo "DB_HOST=$DB_HOST DB_DATABASE=$DB_DATABASE DB_USERNAME=$DB_USERNAME"

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

php artisan config:cache  || echo "config:cache failed"
php artisan route:cache   || echo "route:cache failed"
php artisan migrate --force || echo "migrate failed — check DB vars"

exec "$@"
