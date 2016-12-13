<?php
require_once __DIR__ . '/../configuration/linker.php';
use CCR\DB;
$append = true;
$useetllog = false;
$start_date = "2011-10-01";
$end_date = date("Y-m-d");

$conf = array(
    'emailSubject' => gethostname() . ': XDMOD: Data Warehouse: SUPReMM ETL Log',
);

$options = array(
    'h'  => 'help',
    'a:' => 'append:',
    'u:' => 'useetllog:',
    'q'  => 'quiet',
    'v'  => 'verbose',
    'd'  => 'debug'
);

function usage_and_exit()
{
    global $argv, $append, $useetllog;
    $appendtxt = $append ? "true" : "false";
    $useetllogtxt = $useetllog ? "true" : "false";

    fwrite(STDERR,
        <<<"EOMSG"
Usage: {$argv[0]}
    -h, --help
        Display this help

    -a, --append
        true or false. Append to the last dataset [default $appendtxt]

    -u, --useetllog
        true or false. Use the ETL log entries to determine the aggregation time range [default $useetllogtxt]

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

// The OpenSource release and the XSEDE release have two slightly incompatible
// implementations of the DataWarehouseInitializer class.
function getdwi()
{
    if (xd_utilities\getConfiguration('features', 'xsede') == 'on')
    {
        return new DataWarehouseInitializer();
    }
    else
    {
        $shredderDb = DB::factory('shredder');
        $hpcdbDb    = DB::factory('hpcdb');
        $dwDb       = DB::factory('datawarehouse');
        return new OpenXdmod\DataWarehouseInitializer($shredderDb, $hpcdbDb, $dwDb);
    }
}

function getappend()
{
    global $append;
    if($append === false || xd_utilities\getConfiguration('features', 'xsede') == 'on')
    {
        return $append;
    }

    $dwDb       = DB::factory('datawarehouse');

    $helper = CCR\DB\MySQLHelper::factory(new CCR\DB\MySQLDB(
            $dwDb->_db_host,
            $dwDb->_db_port,
            'modw_aggregates',
            $dwDb->_db_username,
            $dwDb->_db_password
            ));

    return $helper->tableExists('supremmfact_by_year');
}

$args = getopt(implode('', array_keys($options)), $options);

foreach ($args as $arg => $value) 
{
    switch ($arg) 
    {
        case 'a':
        case 'append':
            $append = filter_var(trim($value), FILTER_VALIDATE_BOOLEAN);
            break;
        case 'u':
        case 'useetllog':
            $useetllog = filter_var(trim($value), FILTER_VALIDATE_BOOLEAN);
            break;
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
    'message'            => 'aggregate_supremm start',
    'process_start_time' => date('Y-m-d H:i:s'),
));

try
{
    $dwi = getdwi();
    $dwi->setLogger($logger);

    $append_to_tables = getappend();

    if( $useetllog ) 
    {
        $db = DB::factory('datawarehouse', false);
        $db->handle()->beginTransaction();
        $minMaxTS = $db->query('select from_unixtime(min(min_index), "%Y-%m-%d") as min_date, from_unixtime(max(max_index), "%Y-%m-%d") as max_date from modw_etl.log where aggregated = 0');
        $logIds = $db->query('select id from  modw_etl.log where aggregated = 0');
        $db->handle()->commit();

        //get the min_index max_index from modw_etl.log and replace $start_date and $end_date
        if(count($minMaxTS) === 1 && $minMaxTS[0]['min_date'] != '' && $minMaxTS[0]['max_date'] != '')
        {
            $start_date = $minMaxTS[0]['min_date'];
            $end_date = $minMaxTS[0]['max_date'];

            $dwi->initializeAggregation();
            $dwi->aggregate('SupremmTimeseriesAggregator', $start_date, $end_date, $append_to_tables, true);

            foreach($logIds as $logId)
            {
                $db->execute('update modw_etl.log set aggregated = 1 where id = :id', array('id' => $logId['id']));
            }
        }
    } 
    else 
    {
        $dwi->initializeAggregation();
        $dwi->aggregate('SupremmTimeseriesAggregator', $start_date, $end_date, $append_to_tables, true);
    }

    $logger->notice(array(
        'message'          => 'aggregate_supremm end',
        'process_end_time' => date('Y-m-d H:i:s'),
    ));

}
catch (\Exception $e) {

    $msg = 'Caught exception while executing: ' . $e->getMessage();
    $logger->err(array(
        'message'    => $msg,
        'stacktrace' => $e->getTraceAsString()
    ));
}


