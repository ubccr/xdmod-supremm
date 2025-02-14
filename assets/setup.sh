#!/bin/sh

assets_dir="$(
    cd "$(dirname "$0")"
    pwd
)"
module_dir="$assets_dir/.."
xdmod_dir="$module_dir/../../.."

echo Installing Composer dependencies
cd "$module_dir"
composer install --no-dev

echo Installing npm managed dependencies
npm install --production --prefix html/gui/lib
