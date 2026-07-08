FROM php:8.3-apache

# System dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev libpq-dev \
    libjpeg62-turbo-dev libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions (gd required by phpoffice/phpword)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif bcmath zip pcntl gd

# Fix Apache MPM conflict — wipe ALL mpm symlinks, only keep prefork
RUN find /etc/apache2/mods-enabled -name 'mpm_*' -delete \
    && ln -sf /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf \
    && ln -sf /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Apache: point document root to /public
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
        /etc/apache2/sites-available/*.conf \
        /etc/apache2/apache2.conf \
        /etc/apache2/conf-available/*.conf \
    && a2enmod rewrite

WORKDIR /var/www/html

COPY . .

# Clear bootstrap cache so stale service providers don't linger
RUN rm -f bootstrap/cache/packages.php \
    && rm -f bootstrap/cache/services.php \
    && rm -f bootstrap/cache/config.php

RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE ${PORT:-80}

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
