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

export REG_TEST_BASE="/../../../../../xdmod-supremm/tests/artifacts/regression/current/"

if [ "$REG_TEST_ALL" == "1" ]; then
    set +e
    REG_TEST_USER_ROLE=cd $phpunit $CD ./lib/Controllers/UsageExplorerSupremmTest.php

    #REG_TEST_USER_ROLE=usr $phpunit $REGUSER ./lib/Controllers/UsageExplorerSupremmTest.php
    #REG_TEST_USER_ROLE=pi $phpunit $PI ./lib/Controllers/UsageExplorerSupremmTest.php
    #REG_TEST_USER_ROLE=cs $phpunit $CS ./lib/Controllers/UsageExplorerSupremmTest.php
    #$phpunit $PUB ./lib/Controllers/UsageExplorerSupremmTest.php
else
    REG_TEST_USER_ROLE=cd $phpunit $CD ./lib/Controllers/UsageExplorerSupremmTest.php & cdpid=$!

    #REG_TEST_USER_ROLE=usr $phpunit $REGUSER ./lib/Controllers/UsageExplorerSupremmTest.php & usrpid=$!
    #REG_TEST_USER_ROLE=pi $phpunit $PI ./lib/Controllers/UsageExplorerSupremmTest.php & pipid=$!
    #REG_TEST_USER_ROLE=cs $phpunit $CS ./lib/Controllers/UsageExplorerSupremmTest.php & cspid=$!
    #$phpunit $PUB ./lib/Controllers/UsageExplorerSupremmTest.php & pubpid=$!

    EXIT_STATUS=0
    for pid in $usrpid $pipid $cdpid $cspid $pubpid;
    do
        wait "$pid"
        if [ "$?" -ne "0" ];
        then
            EXIT_STATUS=1
        fi
    done
    exit $EXIT_STATUS
fi
