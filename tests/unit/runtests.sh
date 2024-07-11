#!/bin/bash
BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Unit tests beginging:" `date +"%a %b %d %H:%M:%S.%3N %Y"`
PHPUNITARGS=""
if [ "$1" = "coverage" ];
then
    PHPUNITARGS="${PHPUNITARGS} --coverage-html ../../../../html/phpunit"
fi

cd $(dirname $0)
phpunit="$(readlink -f ../../vendor/bin/phpunit)"

if { ! which phpunit >/dev/null 2>&1; } then
    echo phpunit not found 1>&2
    exit 127
fi

../artifacts/update-artifacts.sh

phpunit .
exit $?
