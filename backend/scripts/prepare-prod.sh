#!/bin/sh
set -e

mkdir -p var/cache var/log var/sessions var/share

chown -R www-data:www-data var
chmod -R 775 var
