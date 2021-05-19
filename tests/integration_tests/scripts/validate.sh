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
if [ $appcount -ne 231 ];
then
    echo "Mismatch rows in modw_supremm.application ($appcount)"
    exitcode=1
fi

function checkForColumn
{
    # Check that the energy metric columns are present and correct
    local hascolumn=$(echo "show columns from modw_supremm.job LIKE '""$1""'"  | mysql -N modw_supremm)
    if [ -z "$hascolumn" ];
    then
        echo "Misssing $1 column from job table"
        exitcode=1
    fi
}

checkForColumn energy
checkForColumn netdir_home_read
checkForColumn netdir_home_write
checkForColumn netdir_projects_read
checkForColumn netdir_projects_write
checkForColumn netdir_util_read
checkForColumn netdir_util_write

# Check that the jobhosts table has end_time_ts column with non-zero timestamps
jobcount=$(echo 'SELECT COUNT(*) FROM modw_supremm.job j, modw_supremm.jobhost jh WHERE j.resource_id = jh.resource_id AND j.local_job_id = jh.local_job_id AND j.end_time_ts = jh.end_time_ts' | mysql -N modw_supremm)
if [ $jobcount -eq 0 ];
then
    echo "Job Hosts table incorrect data"
    exitcode=1
fi

exit $exitcode
