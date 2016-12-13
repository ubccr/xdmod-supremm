#!/usr/bin/env bash

function install_pear_dependencies() {
    pear install Log
}

# If PHP 5.3.3 is installed, SSL/TLS isn't available to PHP.
# Use a newer version of PHP for installing Composer dependencies.
using_php_533="false"; [[ "$(php --version)" == PHP\ 5.3.3\ * ]] && using_php_533="true"
if "$using_php_533"; then
    echo "Using newer version of PHP for installing dependencies"
    phpenv global 5.3
    php --version

    # Install PEAR dependencies for newer version of PHP.
    install_pear_dependencies
fi

# Install Composer dependencies.
composer install

# If using PHP 5.3.3 for testing purposes, stop using the newer PHP version.
if "$using_php_533"; then
    echo "Reverting back to PHP 5.3.3 for testing"
    phpenv global 5.3.3
    php --version
fi

# Install PEAR dependencies for testing version of PHP.
install_pear_dependencies

# Install npm dependencies.
source ~/.nvm/nvm.sh
nvm install "$NODE_VERSION"
nvm use "$NODE_VERSION"
npm install
