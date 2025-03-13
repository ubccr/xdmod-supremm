#!/bin/bash

# These tests will change the data in the database and should only be run after
# the integration and regression tests have executed

set -e

/usr/lib64/xdmod/xdmod-supremm-admin --action=reset --resource=robertson --force 2>&1 | tee /tmp/supremm-admin-output.txt

if ! grep -q "Job summary documents status reset for 1 jobs" /tmp/supremm-admin-output.txt;
then
    echo "Error missing expected output from xdmod-supremm-admin"
fi
