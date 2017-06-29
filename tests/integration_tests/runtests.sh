#!/bin/bash

PHPUNITARGS="$@"

cd $(dirname $0)
phpunit="$(readlink -f ../../../xdmod/vendor/bin/phpunit)"

if [ ! -x "$phpunit" ]; then
    echo phpunit not found, run \"composer install\" 1>&2
    exit 127
fi

$phpunit ${PHPUNITARGS} .
