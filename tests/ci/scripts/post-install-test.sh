#!/usr/bin/env bash

XDMOD_ETC_DIR="${XDMOD_ETC_DIR:-/etc/xdmod}"

post_install_exit_value=0

echo "Copy ETL Test Artifacts"

mv $XDMOD_ETC_DIR/supremm_resources.json $XDMOD_ETC_DIR/supremm_resources.json_post_install_test
cp ./configuration/supremm_resources.json $XDMOD_ETC_DIR
rsync -av ./etl/js/config/supremm/tests/ $XDMOD_INSTALL_DIR/etl/js/config/supremm/tests/

echo "Testing ETL configs..."
pushd "$XDMOD_INSTALL_DIR" >/dev/null || exit 2
node etl/js/etl.cli.js -t -d
if [ $? != 0 ]; then
    post_install_exit_value=2
fi

# revert changes to supremm_resource.json
mv $XDMOD_ETC_DIR/supremm_resources.json_post_install_test $XDMOD_ETC_DIR/supremm_resources.json

for file in etl/js/config/supremm/unit_test/*.js;
do
    node $file
    if [ $? != 0 ]; then
        post_install_exit_value=2
    fi
done
popd >/dev/null || exit 2

exit $post_install_exit_value
