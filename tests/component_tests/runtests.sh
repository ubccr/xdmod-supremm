#!/bin/bash
echo "Component tests beginning:" `date +"%a %b %d %H:%M:%S.%3N %Y"`

PHPUNITARGS="$@"

cd $(dirname $0)
phpunit="$(readlink -f ../../vendor/bin/phpunit)"

if [ ! -x "$phpunit" ]; then
    echo phpunit not found, run \"composer install\" 1>&2
    exit 127
fi

# Run module specific tests
$phpunit ${PHPUNITARGS} .
