#!/usr/bin/env bash

post_install_exit_value=0

echo "Installing npm dependencies..."
pushd "$XDMOD_INSTALL_DIR/share/etl/js" >/dev/null
npm install
popd >/dev/null

echo "Testing ETL configs..."
cd "$XDMOD_INSTALL_DIR" || exit 2
cp "$TRAVIS_BUILD_DIR/configuration/supremm_resources.json" etc/
node share/etl/js/etl.cli.js -t
if [ $? != 0 ]; then
    post_install_exit_value=2
fi

exit $post_install_exit_value
