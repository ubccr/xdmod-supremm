#!/bin/bash

set -e

REGUSER=""
PI=""
CD=""
CS=""
PUB=""

if [ "$1" = "--junit-output-dir" ];
then
    REGUSER="--log-junit $2/xdmod-supremm-regression-user.xml"
    PI="--log-junit $2/xdmod-supremm-regression-principalinvestigator.xml"
    CD="--log-junit $2/xdmod-supremm-regression-centerdirector.xml"
    CS="--log-junit $2/xdmod-supremm-regression-centerstaff.xml"
    PUB="--log-junit $2/xdmod-supremm-regression-public.xml"
fi

cd $(dirname $0)

if [ ! -e ../../../xdmod/open_xdmod/modules/xdmod/integration_tests/.secrets.json ];
then
    echo "ERROR missing .secrets.json file." >&2
    echo >&2
    cat README.md >&2
    false
fi

phpunit="$(readlink -f ../../../xdmod/vendor/bin/phpunit)"

if [ ! -x "$phpunit" ]; then
    echo phpunit not found, run \"composer install\" 1>&2
    exit 127
fi

export REG_TEST_BASE="/../../../tests/artifacts/xdmod-test-artifacts/xdmod-supremm/regression/current/"

REG_TEST_USER_ROLE=usr $phpunit $REGUSER ../../../xdmod/open_xdmod/modules/xdmod/regression_tests/ &
REG_TEST_USER_ROLE=pi $phpunit $PI ../../../xdmod/open_xdmod/modules/xdmod/regression_tests/ &
REG_TEST_USER_ROLE=cd $phpunit $CD ../../../xdmod/open_xdmod/modules/xdmod/regression_tests/ &
REG_TEST_USER_ROLE=cs $phpunit $CS ../../../xdmod/open_xdmod/modules/xdmod/regression_tests/ &
$phpunit $PUB ../../../xdmod/open_xdmod/modules/xdmod/regression_tests/ &
wait
