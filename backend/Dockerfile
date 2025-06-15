#
# ─────────────────── Image Laravel + PHP 8.2 + Apache ────────────────────
#
FROM php:8.2-apache

# --- Packages système & extensions PHP ---
RUN apt-get update && apt-get install -y \
        git curl zip unzip \
        libpng-dev libjpeg62-turbo-dev libfreetype6-dev \
        libonig-dev libxml2-dev libzip-dev libpq-dev \
    && docker-php-ext-configure gd --with-jpeg --with-freetype \
    && docker-php-ext-install pdo pdo_pgsql pgsql gd mbstring zip opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# --- Apache: activer mod_rewrite & changer DocumentRoot vers /public ---
RUN a2enmod rewrite
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" \
        /etc/apache2/sites-available/000-default.conf \
        /etc/apache2/apache2.conf

# --- Installer Composer ---
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# --- Copier le code de l’application ---
WORKDIR /var/www/html
COPY . .

# --- Installer les dépendances PHP du projet ---
RUN composer install --no-interaction --prefer-dist --optimize-autoloader \
    && chown -R www-data:www-data storage bootstrap/cache

# --- Exposer le port HTTP ---
EXPOSE 80

#
# CMD : ① migrations forcées  ② queue:work en arrière-plan  ③ Apache PID 1
#
CMD sh -c \
  "export CACHE_DRIVER=file && \
   php artisan migrate --force && \
   php artisan queue:work --sleep=3 --tries=3 --timeout=90 & \
   exec apache2-foreground"
