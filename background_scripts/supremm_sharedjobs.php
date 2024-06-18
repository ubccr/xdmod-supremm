<?php
require_once __DIR__ . '/../configuration/linker.php';

use CCR\DB;
use CCR\Log;
use CCR\DB\MySQLHelper;

/**
 * Get the configuration
 */
function get_config() {
    $conf = array(
        'emailSubject' => gethostname() . ': XDMOD: Data Warehouse: SUPReMM ETL Log',
    );

    $options = array(
        'h'  => 'help',
        'q'  => 'quiet',
        'v'  => 'verbose',
        'r:' => 'resource:',
        'a'  => 'all',
        's:' => 'start:',
        'e:' => 'end:',
        'd'  => 'debug'
    );

    $conf['end'] = time();
    $conf['start'] = $conf['end'] - (60*60*24 * 3);

    $args = getopt(implode('', array_keys($options)), $options);

    foreach ($args as $arg => $value)
    {
        switch ($arg)
        {
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
            case 'r':
            case 'resource':
                $conf['resource'] = $value;
                break;
            case 's':
            case 'start':
                $conf['start'] = strtotime($value);
                break;
            case 'e':
            case 'end':
                $conf['end'] = strtotime($value);
                break;
            case 'a':
            case 'all':
                $conf['start'] = 0;
                $conf['end'] = time();
                break;
            case 'd':
            case 'debug':
                $conf['consoleLogLevel'] = CCR\Log::DEBUG;
                break;
            default:
                break;
        }
    }
    return $conf;
}

function usage_and_exit()
{
    global $argv;

    fwrite(
        STDERR,
        <<<"EOMSG"
Usage: {$argv[0]}
    -h, --help              Display this help

 Controlling which jobs are processed:
    -r, --resource=RESOURCE Only process shared jobs on the given resource.
                            (default all resources that have shared jobs are
                            processed). The resource code or the resource_id
                            may be specified.
    -s, --start=START_TIME  Specify the start of the time window. (default
                            3 days ago).
    -e, --end=END_TIME      Specify the end of the time window. (default
                            now).
    -a, --all               Do not restrict the jobs by time.

 Controlling log output:
    -q, --quiet             Quiet mode. Only print error messages to the
                            console
    -v, --verbose           Enable informational messages to the console
    -d, --debug             Enable debug messages to the console
EOMSG
);
    exit(1);
}

/**
 * Process shared jobs for a given resource_id
 */
function shared_jobs($resource_id, $start, $end)
{
    global $logger;
    global $db;

    $logger->debug('Checking for shared jobs on resource_id=' . $resource_id . ' between ' . $start . ' and ' . $end);

    $hostquery = "SELECT 
                h.id,
                h.name
            FROM
                `modw_supremm`.`host` h
            WHERE
                h.resource_id = :resource_id";

    $db->handle()->exec('DROP TABLE IF EXISTS `modw_supremm`.`job_tmp`');
    $createtmp = $db->handle()->prepare('CREATE TABLE `modw_supremm`.`job_tmp` (KEY (resource_id, local_job_id, end_time_ts)) SELECT _id, resource_id, local_job_id, start_time_ts, end_time_ts FROM `modw_supremm`.`job` WHERE end_time_ts BETWEEN :start AND :end AND resource_id = :resource_id');
    $createtmp->execute(array('start' => $start, 'end' => $end, 'resource_id' => $resource_id));

    $jobsforhost = "SELECT 
                j._id as jobid, 'e' as jobstate, j.end_time_ts as state_transition_timestamp
            FROM
                modw_supremm.job_tmp j,
                modw_supremm.jobhost jh
            WHERE
                jh.local_job_id = j.local_job_id
                AND jh.resource_id = j.resource_id
                AND jh.end_time_ts = j.end_time_ts
                AND jh.host_id = :hostid
            UNION SELECT 
                j._id as jobid, 's' as jobstate, j.start_time_ts as state_transition_timestamp
            FROM
                modw_supremm.job_tmp j,
                modw_supremm.jobhost jh
            WHERE
                jh.local_job_id = j.local_job_id
                AND jh.resource_id = j.resource_id
                AND jh.end_time_ts = j.end_time_ts
                AND jh.host_id = :hostid
            ORDER BY 3 ASC, 2 DESC";

    $jobfactupdate = "UPDATE IGNORE modw_supremm.job SET shared = 1 WHERE shared = 0 AND _id = ?";

    $jbq = $db->handle()->prepare($jobsforhost);
    $jbu = $db->handle()->prepare($jobfactupdate);

    $jobpeersfname = tempnam(sys_get_temp_dir(), 'supremm_sharedjobs_');
    $jobpeersfile = fopen($jobpeersfname, 'wb');

    if ($jobpeersfile === false) {
        throw new \Exception('Error creating temporary file ' . $jobpeersfname);
    }
    $jobpeercount = 0;

    $hosts = $db->query($hostquery, array('resource_id' => $resource_id));
    foreach($hosts as $host)
    {
        $activejobs = array();
        $sharedjobs = array();

        $jbq->execute(array("hostid" => $host['id']));
        while($row = $jbq->fetch(PDO::FETCH_ASSOC))
        {
            if($row['jobstate'] == "s") {
                $activejobs[ "{$row['jobid']}" ] = $row['state_transition_timestamp'];
            } elseif ($row['jobstate'] == "e") {

                if(count($activejobs) > 1) {

                    $npeers = 0;
                    foreach($activejobs as $currentjob => $state_transition_timestamp) {
                        if($currentjob != $row['jobid'] && $state_transition_timestamp != $row['state_transition_timestamp']) {
                            $npeers += 1;
                            $record = "{$row['jobid']} $currentjob\n$currentjob {$row['jobid']}\n";
                            $written = fwrite($jobpeersfile, $record);
                            if ($written !== strlen($record)) {
                                fclose($jobpeersfile);
                                throw new \Exception('Error writing job peer information to temporary file ' . $jobpeersfname);
                            }
                            $jobpeercount++;
                            $sharedjobs[ $currentjob ] = 1;
                        }
                    }
                    if( $npeers > 0 ) {
                        $sharedjobs[ $row['jobid'] ] = 1;
                    }
                }
                unset($activejobs[ "{$row['jobid']}" ]);
            }
        }
        
        foreach($sharedjobs as $key => $ignore) {
            $jbu->execute(array($key));
        }
        $logger->debug("Processed " . count($sharedjobs) . " jobs for host " . $host['name']);

        if ($jobpeercount > 250000) {
            fclose($jobpeersfile);
            batch_update($jobpeersfname, $jobpeercount);
            $jobpeersfile = fopen($jobpeersfname, 'wb');
            $jobpeercount = 0;
        }
    }

    fclose($jobpeersfile);
    batch_update($jobpeersfname, $jobpeercount);

    unlink($jobpeersfname);
    $db->handle()->exec('DROP TABLE IF EXISTS `modw_supremm`.`job_tmp`');
}

function batch_update($jobpeersfname, $jobpeercount)
{
    global $logger;
    global $db;

    if ($jobpeercount > 0) {
        $logger->info('Batch update ' . $jobpeercount . ' job peers');

        $jobpeerload = 'LOAD DATA LOCAL INFILE \'' . $jobpeersfname . '\' IGNORE INTO TABLE `modw_supremm`.`job_peers` FIELDS TERMINATED BY \' \' (job_id, other_job_id)';
        $databaseHelper = MySQLHelper::factory($db);
        $output = $databaseHelper->executeStatement($jobpeerload);

        if (count($output) > 0) {
            $logger->warning($jobpeerload);
            foreach($output as $line) {
                $logger->warning($line);
            }
        }
    } else {
        $logger->info('Skipping batch update - no job peers found');
    }
}

/**
 * Get the list of resources to process
 */
function get_resource_list($conf)
{
    global $db;

    $stmt = 'SELECT id FROM `modw`.`resourcefact` WHERE shared_jobs = 1';
    $args = array();

    if (isset($conf['resource'])) {
        $stmt .= ' AND (id = :resource OR code = :resource)';
        $args['resource'] = $conf['resource'];
    }

    $query = $db->handle()->prepare($stmt);
    $query->execute($args);

    return $query->fetchAll(PDO::FETCH_COLUMN, 0);
}

$conf = get_config();

$logger = CCR\Log::factory('SUPREMM', $conf);

$cmd = implode(' ', array_map('escapeshellarg', $argv));
$logger->info("Command: $cmd");

$logger->notice(array(
    'message'            => 'process shared jobs start',
    'process_start_time' => date('Y-m-d H:i:s'),
));

try
{
    $db = DB::factory('datawarehouse');

    foreach (get_resource_list($conf) as $resource_id) {
        shared_jobs($resource_id, $conf['start'], $conf['end']);
    }
}
catch (\Exception $e) {

    $msg = 'Caught exception while executing: ' . $e->getMessage();
    $logger->err(array(
        'message'    => $msg,
        'stacktrace' => $e->getTraceAsString()
    ));
}

$logger->notice(array(
    'message'          => 'process shared jobs end',
    'process_end_time' => date('Y-m-d H:i:s'),
));
