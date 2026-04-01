#!/bin/bash

set -e

BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPODIR=`realpath -s $BASEDIR/../../../../../`
BUILD_DIR="$REPODIR/open_xdmod/build"

XDMOD_TAR="$(find $BUILD_DIR -regex '.*xdmod-[0-9]+[^/]*\.tar\.gz$')"

if [ ! -e $XDMOD_TAR ];
then
    echo "Error could not find xdmod install tarfile"
    exit 1
fi

PACKAGE_NAME=$(basename "$XDMOD_TAR" .tar.gz)
INSTALL_DIR=/opt/$PACKAGE_NAME

SUPREMM_TAR="$(find $BUILD_DIR -regex '.*xdmod-supremm-[0-9]+[^/]*\.tar\.gz$')"

if [ ! -e $SUPREMM_TAR ];
then
    echo "Error could not find xdmod-supremm install tarfile"
    exit 1
fi

SUPREMM_PACKAGE_NAME=$(basename "$SUPREMM_TAR" .tar.gz)

cd /tmp
tar -xf "$XDMOD_TAR"

cd $PACKAGE_NAME || exit 2
./install --prefix=$INSTALL_DIR

cd /tmp
tar -xf "$SUPREMM_TAR"

cd $SUPREMM_PACKAGE_NAME || exit 2

./install --prefix=$INSTALL_DIR
