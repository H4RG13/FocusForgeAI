FROM php:8.3-fpm

# System dependencies + Nginx + Supervisor
RUN apt-get update && apt-get install -y \
    nginx supervisor git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev \
    libjpeg62-turbo-dev libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif bcmath zip pcntl gd

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

# Clear stale bootstrap cache
RUN rm -f bootstrap/cache/packages.php \
    && rm -f bootstrap/cache/services.php \
    && rm -f bootstrap/cache/config.php

RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 storage bootstrap/cache

# Nginx config
COPY docker/nginx.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/sites-enabled/default \
    && ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# PHP-FPM pool config (unix socket)
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

# Supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE ${PORT:-80}

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
