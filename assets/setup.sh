#!/bin/sh

assets_dir="$(
    cd "$(dirname "$0")"
    pwd
)"
module_dir="$assets_dir/.."
xdmod_dir="$module_dir/../../.."

echo Installing Composer dependencies
cd "$module_dir"

# NOTE: We've added COMPOSER=composer.json while we support both el8 and el7. Once we drop support
# for Centos7 then we can remove `COMPOSER=composer.json`.
COMPOSER=composer.json composer install --no-dev
