#!/bin/bash
# This script is intended to be used to run tests that validate the correct
# packaging / install behavour of XDMoD. For example checking the
# file permissions are correct on the RPM packaged files.

set -euo pipefail

exitcode=0

# Check that there are no development artifacts installed in the RPM
if rpm -ql xdmod-supremm | fgrep .eslintrc.json; then
    echo "Error eslintrc files found in the RPM"
    exitcode=1
fi

for file in ../xdmod/open_xdmod/build/*.tar.gz;
do
    echo "Checking $file"
    if tar tf $file | fgrep .eslintrc.json; then
        echo "Error eslintrc files found in build tarball $file"
        exitcode=1
    fi
done

# Check that the application table exists and has the correct content
appcount=$(echo 'SELECT COUNT(*) FROM modw_supremm.application' | mysql -N modw_supremm)
if [ $appcount -ne 227 ];
then
    echo "Mismatch rows in modw_supremm.application ($appcount)"
    exitcode=1
fi

exit $exitcode
