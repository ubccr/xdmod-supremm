#!/bin/bash
# Bootstrap script that configures the SUPReMM-specific services and
# data. This script calls the main XDMoD integration test bootstrap
# do configure & start the core.

BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
XDMOD_BOOTSTRAP=$BASEDIR/../../../../xdmod/tests/ci/bootstrap.sh
REF_DIR=/root/assets/referencedata

setup_mongod () {

    if [ `pgrep -c mongod` -eq 0 ]; then
        mongod -f /etc/mongod.conf
    fi
    mongo $BASEDIR/mongo_auth.mongojs
    mongod -f /etc/mongod.conf --shutdown

    mongod -f /etc/mongod.conf --auth
}

set -e
set -o pipefail

if [ "$XDMOD_TEST_MODE" = "fresh_install" ];
then
    rm -rf /var/lib/mongo/*
    mongod -f /etc/mongod.conf
    ~/bin/importmongo.sh
    setup_mongod
    $XDMOD_BOOTSTRAP
    expect $BASEDIR/xdmod-setup.tcl | col -b
    aggregate_supremm.sh
fi

if [ "$XDMOD_TEST_MODE" = "upgrade" ];
then
    setup_mongod
    sed 's#uri = "mongodb://localhost:27017/supremm"#uri = "mongodb://xdmod:uvVA6bIC9DMts30ZiLRaH@localhost:27017/supremm?authSource=auth"#' -i /etc/xdmod/portal_settings.d/supremm.ini
    $XDMOD_BOOTSTRAP
    aggregate_supremm.sh
fi
