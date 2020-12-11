#!/usr/bin/env bash

post_install_exit_value=0

echo "Installing npm dependencies..."
pushd "$XDMOD_INSTALL_DIR/etl/js" >/dev/null || exit 1
npm install
popd >/dev/null || exit 1

echo "Testing ETL configs..."
pushd "$XDMOD_INSTALL_DIR" >/dev/null || exit 2
node etl/js/etl.cli.js -t
if [ $? != 0 ]; then
    post_install_exit_value=2
fi
for file in etl/js/config/supremm/unit_test/*.js;
do
    node $file
    if [ $? != 0 ]; then
        post_install_exit_value=2
    fi
done
popd >/dev/null || exit 2

exit $post_install_exit_value
