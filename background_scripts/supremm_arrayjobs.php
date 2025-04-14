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
    $conf['start'] = $conf['end'] - (60*60*24 * 10);

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
    -r, --resource=RESOURCE Only process array jobs on the given resource.
                            (default all resources in the SUPREMM realm are
                            processed). The resource code or the resource_id
                            may be specified.
    -s, --start=START_TIME  Specify the start of the time window. (default
                            10 days ago).
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
 * Get the list of resources to process
 */
function get_resource_list($conf)
{
    $s = new \DataWarehouse\Query\SUPREMM\SupremmDbInterface();
    $resources = $s->getResources();

    $stmt = 'SELECT id FROM `modw`.`resourcefact` WHERE id IN (' . implode(',', $resources) . ')';
    $args = array();

    if (isset($conf['resource'])) {
        $stmt .= ' AND (id = :resource OR code = :resource)';
        $args['resource'] = $conf['resource'];
    }

    $db = DB::factory('datawarehouse');
    $query = $db->handle()->prepare($stmt);
    $query->execute($args);

    return $query->fetchAll(PDO::FETCH_COLUMN, 0);
}

/**
 * Build a table with mapping between the diffent jobs in a job array
 *
 * @param string $resource_id the resource id
 * @param string $start       the minimum data range to select
 * @param string $end         the maximum date range to select
 *
 * @return null
 */
function get_array_jobs($resource_id, $start, $end)
{
    global $logger;
    $db = DB::factory('datawarehouse');

    $logger->debug('Checking for array jobs on resource_id=' . $resource_id . ' between ' . $start . ' and ' . $end);

    $db->handle()->exec('DROP TABLE IF EXISTS `modw_supremm`.`job_array_tmp`');
    $createtmp = $db->handle()->prepare('CREATE TABLE `modw_supremm`.`job_array_tmp` (KEY (resource_id, local_jobid, submit_time_ts, _id)) SELECT s._id, j.resource_id, j.local_jobid, j.submit_time_ts FROM modw_supremm.job s, modw.job_tasks j WHERE s.tg_job_id = j.job_id AND j.local_job_array_index != -1 and j.local_job_id_raw is not null and s.end_time_ts BETWEEN :start AND :end AND s.resource_id = :resource_id');
    $createtmp->execute(array('start' => $start, 'end' => $end, 'resource_id' => $resource_id));

    $logger->debug('Updating array job mapping table on resource_id=' . $resource_id . ' between ' . $start . ' and ' . $end);

     $db->handle()->exec('INSERT IGNORE INTO `modw_supremm`.`job_array_peers` SELECT DISTINCT s1._id as job_id, s2._id as other_job_id FROM `modw_supremm`.`job_array_tmp` s1, `modw_supremm`.`job_array_tmp` s2 WHERE s1.resource_id = s2.resource_id and s1.submit_time_ts = s2.submit_time_ts and s1.local_jobid = s2.local_jobid and s1._id != s2._id');

    $db->handle()->exec('DROP TABLE IF EXISTS `modw_supremm`.`job_array_tmp`');
}

$conf = get_config();

$logger = CCR\Log::factory('SUPREMM', $conf);

$cmd = implode(' ', array_map('escapeshellarg', $argv));
$logger->info("Command: $cmd");

$logger->notice(
    array(
        'message'            => 'process array jobs start',
        'process_start_time' => date('Y-m-d H:i:s'),
    )
);

try
{
    foreach (get_resource_list($conf) as $resource_id) {
        get_array_jobs($resource_id, $conf['start'], $conf['end']);
    }
}
catch (\Exception $e) {

    $msg = 'Caught exception while executing: ' . $e->getMessage();
    $logger->err(
        array(
            'message'    => $msg,
            'stacktrace' => $e->getTraceAsString()
        )
    );
}

$logger->notice(
    array(
        'message'          => 'process array jobs end',
        'process_end_time' => date('Y-m-d H:i:s'),
    )
);
