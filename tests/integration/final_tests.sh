#!/bin/bash

# These tests will change the data in the database and should only be run after
# the integration and regression tests have executed

set -e

/usr/lib64/xdmod/xdmod-supremm-admin --action=reset --resource=robertson --force 2>&1 | tee /tmp/supremm-admin-output.txt

if ! grep -q "Job summary documents status reset for 6 jobs" /tmp/supremm-admin-output.txt;
then
    echo "Error missing expected output from xdmod-supremm-admin"
    exit 1
fi

# Now run again - this time there will be no jobs to reset
/usr/lib64/xdmod/xdmod-supremm-admin --action=reset --resource=robertson --force 2>&1 | tee /tmp/supremm-admin-output.txt

if ! grep -q "Job summary documents status reset for 0 jobs" /tmp/supremm-admin-output.txt;
then
    echo "Error missing expected output from xdmod-supremm-admin"
    exit 1
fi
