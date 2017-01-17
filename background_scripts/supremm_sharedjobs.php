<?php
require_once __DIR__ . '/../configuration/linker.php';

use CCR\DB;
use CCR\Log;

$conf = array(
    'emailSubject' => gethostname() . ': XDMOD: Data Warehouse: SUPReMM ETL Log',
);

$options = array(
    'h'  => 'help',
    'q'  => 'quiet',
    'v'  => 'verbose',
    'd'  => 'debug'
);

function usage_and_exit()
{
    global $argv;

    fwrite(
        STDERR,
        <<<"EOMSG"
Usage: {$argv[0]}
    -h, --help
        Display this help

    -q, --quiet
        quiet mode. Only print error messages to the console

    -v, --verbose
        enable informational messages to the console

    -d, --debug
        enable debug messages to the console

EOMSG
    );

    exit(1);
}

$args = getopt(implode('', array_keys($options)), $options);

foreach ($args as $arg => $value) {
    switch ($arg) {
        case 'h':
        case 'help':
            usage_and_exit();
            break;
        case 'q':
        case 'quiet':
            $conf['consoleLogLevel'] = CCR\Log::ERR;
            break;
        case 'v':
        case 'verbose':
            $conf['consoleLogLevel'] = CCR\Log::INFO;
            break;
        case 'd':
        case 'debug':
            $conf['consoleLogLevel'] = CCR\Log::DEBUG;
            break;
        default:
            break;
    }
}

$logger = CCR\Log::factory('SUPREMM', $conf);

$cmd = implode(' ', array_map('escapeshellarg', $argv));
$logger->info("Command: $cmd");

$logger->notice(array(
    'message'            => 'process shared jobs start',
    'process_start_time' => date('Y-m-d H:i:s'),
));

try {
    $end = time();
    $start = $end - (60*60*24 * 3);

    $db = DB::factory('datawarehouse');

    $hostquery = "SELECT 
                h.id,
                h.name
            FROM
                `modw_supremm`.`host` h,
                `modw`.`resourcefact` rf
            WHERE
                h.resource_id = rf.id
                AND rf.shared_jobs = 1";

    $jobsforhost = "SELECT 
                j._id as jobid, 'e' as jobstate, j.end_time_ts as state_transition_timestamp
            FROM
                modw_supremm.job j,
                modw_supremm.jobhost jh
            WHERE
                jh.local_job_id = j.local_job_id
                AND jh.resource_id = j.resource_id
                AND jh.host_id = :hostid
                AND j.end_time_ts BETWEEN :start AND :end
            UNION SELECT 
                j._id as jobid, 's' as jobstate, j.start_time_ts as state_transition_timestamp
            FROM
                modw_supremm.job j,
                modw_supremm.jobhost jh
            WHERE
                jh.local_job_id = j.local_job_id
                AND jh.resource_id = j.resource_id
                AND jh.host_id = :hostid
                AND j.end_time_ts BETWEEN :start AND :end
            ORDER BY 3 ASC, 2 DESC";

    $hostinsert = "INSERT LOW_PRIORITY IGNORE INTO modw_supremm.job_peers (job_id, other_job_id) VALUES (?,?), (?,?)";
    $jobfactupdate = "UPDATE IGNORE modw_supremm.job SET shared = 1 WHERE shared = 0 AND _id = ?";

    $jbq = $db->handle()->prepare($jobsforhost);
    $hiq = $db->handle()->prepare($hostinsert);
    $jbu = $db->handle()->prepare($jobfactupdate);

    $hosts = $db->query($hostquery);
    foreach ($hosts as $host) {
        $activejobs = array();
        $sharedjobs = array();

        $jbq->execute(array("hostid" => $host['id'], "start" => $start, "end" => $end));
        while ($row = $jbq->fetch(PDO::FETCH_ASSOC)) {
            if ($row['jobstate'] == "s") {
                $activejobs[ "{$row['jobid']}" ] = $row['state_transition_timestamp'];
            } elseif ($row['jobstate'] == "e") {
                if (count($activejobs) > 1) {
                    $npeers = 0;
                    foreach ($activejobs as $currentjob => $state_transition_timestamp) {
                        if ($currentjob != $row['jobid'] && $state_transition_timestamp != $row['state_transition_timestamp']) {
                            $npeers += 1;
                            $hiq->execute(array($row['jobid'], $currentjob, $currentjob, $row['jobid']));
                            $sharedjobs[ $currentjob ] = 1;
                        }
                    }
                    if ($npeers > 0) {
                        $sharedjobs[ $row['jobid'] ] = 1;
                    }
                }
                unset($activejobs[ "{$row['jobid']}" ]);
            }
        }
        
        foreach ($sharedjobs as $key => $ignore) {
            $jbu->execute(array( $key ));
        }
        $logger->debug("Processed " . count($sharedjobs) . " jobs for host " . $host['name']);
    }

    $logger->notice(array(
        'message'          => 'process shared jobs end',
        'process_end_time' => date('Y-m-d H:i:s'),
    ));
} catch (\Exception $e) {
    $msg = 'Caught exception while executing: ' . $e->getMessage();
    $logger->err(array(
        'message'    => $msg,
        'stacktrace' => $e->getTraceAsString()
    ));
}
