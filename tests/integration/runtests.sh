#!/bin/bash

PHPUNITARGS="$@"

cd $(dirname $0)
phpunit="$(readlink -f ../../../xdmod/vendor/bin/phpunit)"

if [ ! -x "$phpunit" ]; then
    echo phpunit not found, run \"composer install\" 1>&2
    exit 127
fi

# Run subset of xdmod tests that work with this module
$phpunit ${PHPUNITARGS} ../../../xdmod/tests/integration/lib/Rest/ReportThumbnailsTest.php

# Run module specific tests
$phpunit ${PHPUNITARGS} .
