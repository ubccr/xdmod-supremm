#!/bin/bash

LOCKFILE=/var/tmp/supremm_ingest.lock
XDMOD_SHARE_PATH=__XDMOD_SHARE_PATH__
XDMOD_LIB_PATH=__XDMOD_LIB_PATH__

reportfail()
{
    echo "SUPReMM ingest/aggregation not running due to another process holding the lock." >&2
    exit 1
}

(
    flock -n 9 || reportfail

    cd ${XDMOD_SHARE_PATH}/etl/js
    
    node etl.cluster.js -q
    
    php ${XDMOD_LIB_PATH}/supremm_sharedjobs.php -q
    
    php ${XDMOD_LIB_PATH}/aggregate_supremm.php -q

) 9>${LOCKFILE}
