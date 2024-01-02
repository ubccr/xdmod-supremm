#!/bin/bash

set -e

REGUSER=""
PI=""
CD=""
CS=""
PUB=""
WAREHOUSE=""

if [ "$1" = "--junit-output-dir" ];
then
    REGUSER="--log-junit $2/xdmod-supremm-regression-user.xml"
    PI="--log-junit $2/xdmod-supremm-regression-principalinvestigator.xml"
    CD="--log-junit $2/xdmod-supremm-regression-centerdirector.xml"
    CS="--log-junit $2/xdmod-supremm-regression-centerstaff.xml"
    PUB="--log-junit $2/xdmod-supremm-regression-public.xml"
    WAREHOUSE="--log-junit $2/xdmod-supremm-regression-warehouse.xml"
fi

cd $(dirname $0)

if [ ! -e ../../../xdmod/tests/ci/testing.json ];
then
    echo "ERROR missing .secrets.json file." >&2
    echo >&2
    cat README.md >&2
    exit 126
fi

phpunit="$(readlink -f ../../../xdmod/vendor/bin/phpunit)"

if [ ! -x "$phpunit" ]; then
    echo phpunit not found, run \"composer install\" 1>&2
    exit 127
fi

export REG_TEST_BASE=${REG_TEST_BASE:-/../../../../../xdmod-supremm/tests/artifacts/regression/current/}

function run_warehouse_raw_data_tests {
    # Need to ignore the values of deidentified usernames when comparing the
    # actual and expected data because the values will be different depending
    # on whether XDMOD_TEST_MODE is set to 'upgrade' or 'fresh_install' since
    # these two testing pipelines produce different hashes for the usernames.
    REG_TEST_USER_ROLE=usr \
        REG_TEST_REGEX='/[0-9a-f]{40}/' \
        REG_TEST_REPLACE='<username>' \
        $phpunit $WAREHOUSE --group warehouseRawData .
}

if [ "$REG_TEST_ALL" == "1" ]; then
    set +e
    REG_TEST_USER_ROLE=cd $phpunit $CD --exclude-group warehouseRawData .

    #REG_TEST_USER_ROLE=usr $phpunit $REGUSER ./lib/Controllers/UsageExplorerSupremmTest.php
    #REG_TEST_USER_ROLE=pi $phpunit $PI ./lib/Controllers/UsageExplorerSupremmTest.php
    #REG_TEST_USER_ROLE=cs $phpunit $CS ./lib/Controllers/UsageExplorerSupremmTest.php
    #$phpunit $PUB ./lib/Controllers/UsageExplorerSupremmTest.php

    run_warehouse_raw_data_tests
else
    REG_TEST_USER_ROLE=cd $phpunit $CD --exclude-group warehouseRawData . & cdpid=$!

    #REG_TEST_USER_ROLE=usr $phpunit $REGUSER ./lib/Controllers/UsageExplorerSupremmTest.php & usrpid=$!
    #REG_TEST_USER_ROLE=pi $phpunit $PI ./lib/Controllers/UsageExplorerSupremmTest.php & pipid=$!
    #REG_TEST_USER_ROLE=cs $phpunit $CS ./lib/Controllers/UsageExplorerSupremmTest.php & cspid=$!
    #$phpunit $PUB ./lib/Controllers/UsageExplorerSupremmTest.php & pubpid=$!

    run_warehouse_raw_data_tests & warehousepid=$!

    EXIT_STATUS=0
    for pid in $usrpid $pipid $cdpid $cspid $pubpid $warehousepid;
    do
        wait "$pid"
        if [ "$?" -ne "0" ];
        then
            EXIT_STATUS=1
        fi
    done
    exit $EXIT_STATUS
fi
