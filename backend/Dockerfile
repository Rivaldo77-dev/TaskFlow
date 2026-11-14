
FROM php:8.4-fpm

WORKDIR /app

# Installer Nginx et les dépendances PHP
RUN apt-get update && apt-get install -y \
    nginx \
    gettext-base \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    libpq-dev \
    && docker-php-ext-install \
    bcmath \
    intl \
    opcache \
    pdo_mysql \
    pdo_pgsql \
    zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Installer Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Installer les dépendances Symfony
COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --prefer-dist \
    --no-scripts

# Copier le projet
COPY . .

# Préparer les dossiers Symfony
RUN mkdir -p var/cache var/log var/sessions var/share \
    && chown -R www-data:www-data var \
    && chmod -R 775 var

# Configuration Nginx
RUN printf '%s\n' \
    'server {' \
    '    listen 8080;' \
    '    server_name _;' \
    '    root /app/public;' \
    '    index index.php;' \
    '    location / {' \
    '        try_files $uri /index.php$is_args$args;' \
    '    }' \
    '    location ~ ^/index\.php(/|$) {' \
    '        fastcgi_pass 127.0.0.1:9000;' \
    '        fastcgi_split_path_info ^(.+\.php)(/.*)$;' \
    '        include fastcgi_params;' \
    '        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;' \
    '        fastcgi_param DOCUMENT_ROOT $document_root;' \
    '        internal;' \
    '    }' \
    '    location ~ \.php$ {' \
    '        return 404;' \
    '    }' \
    '}' > /etc/nginx/sites-available/default

EXPOSE 8080

CMD ["sh", "-c", "mkdir -p var/cache var/log var/sessions var/share && chown -R www-data:www-data var && chmod -R 775 var && sed -i \"s/listen 8080;/listen ${PORT:-8080};/\" /etc/nginx/sites-available/default && php-fpm -D && exec nginx -g 'daemon off;'"]