#!/bin/bash

LOCKFILE=/var/tmp/supremm_ingest.lock
XDMOD_SHARE_PATH=__XDMOD_SHARE_PATH__
XDMOD_LIB_PATH=__XDMOD_LIB_PATH__
XDMOD_BIN_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

reportfail()
{
    echo "SUPReMM ingest/aggregation not running due to another process holding the lock." >&2
    exit 1
}

usage()
{
    echo "Usage: $0 [OPTION]..."
    echo "  -h      Display this help message."
    echo "  -d      Enable debug log output."
    echo "  -a (true|false) Whether to enable or disable the analyse table"
    echo "          step after aggregation."
}

FLAGS="-q"
AGG_FLAGS=""

while getopts "hda:" option; do
    case "$option" in
        a)
            if [[ "${OPTARG}" = "false" ]];
	    then
                AGG_FLAGS='--analyze-tables false'
            fi
            ;;
        d)
            FLAGS="-d"
            ;;
        h)
            usage
            exit 0
            ;;
    esac
done

shift $((OPTIND-1))

(
    flock -n 9 || reportfail

    cd ${XDMOD_SHARE_PATH}/etl/js
    
    node --max-old-space-size=4096 etl.cluster.js $FLAGS
    
    php ${XDMOD_LIB_PATH}/supremm_sharedjobs.php $FLAGS
    
    php ${XDMOD_LIB_PATH}/aggregate_supremm.php $FLAGS $AGG_FLAGS

    ${XDMOD_BIN_PATH}/xdmod-build-filter-lists --realm SUPREMM $FLAGS
) 9>${LOCKFILE}
