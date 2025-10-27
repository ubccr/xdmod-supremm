#!/bin/bash
BASEDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

set -e
#ensure that playwright installed
echo "SUPREMM UI tests beginning:" `date +"%a %b %d %H:%M:%S.%3N %Y"`

#playwright automatically runs in headless

while getopts ":j:" opt; do
    case ${opt} in
        j) log_junit=${OPTARG};;
    esac
done

# Note: we're using XDMoD's install of playwright due to playwright complaining about importing it twice when it's
# a dep of xdmod-supremm's playwright tests.
if [ -n "${log_junit}" ];
then
    PLAYWRIGHT_JUNIT_OUTPUT_NAME=test_results-${log_junit}.xml $XDMOD_INSTALL_DIR/tests/playwright/node_modules/.bin/playwright  test --reporter=junit $BASE_DIR/tests
else
    $XDMOD_INSTALL_DIR/tests/playwright/node_modules/.bin/playwright test $BASE_DIR/tests/
fi
