#!/bin/sh

assets_dir="$(
    cd "$(dirname "$0")"
    pwd
)"
module_dir="$assets_dir/.."
xdmod_dir="$module_dir/../../.."

echo Installing node dependencies
cd $xdmod_dir/etl/js
npm install

echo Installing Composer dependencies
cd "$module_dir"
composer install --no-dev
