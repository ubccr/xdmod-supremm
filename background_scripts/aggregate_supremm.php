<?php
require_once __DIR__ . '/../configuration/linker.php';
use CCR\DB;

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
    global $argv;

    fwrite(STDERR,
        <<<"EOMSG"
Usage: {$argv[0]}
    -h, --help
        Display this help

    -a, --append
        this flag is deprecated and is ignored.

    -u, --useetllog
        this flag is deprecated and is ignored.

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
        case 'd':
        case 'debug':
            $conf['consoleLogLevel'] = CCR\Log::DEBUG;
            break;
        default:
            break;
    }
}

$logger = CCR\Log::factory('SUPREMM', $conf);

$logger->info('Command: ' . implode(' ', array_map('escapeshellarg', $argv)));

$process_start_time = date('Y-m-d H:i:s');
$logger->notice(array(
    'message'            => 'aggregate_supremm start',
    'process_start_time' => $process_start_time
));

try
{
    $journal = new \DB\EtlJournalHelper('modw_supremm', 'job');

    $last_modified = $journal->getLastModified();

    $scriptOptions = array(
        'process-sections' => array('supremm-realm-aggregation'),
        'verbosity' => $conf['consoleLogLevel'],
        'option-overrides' => array(
            'batch_aggregation_min_num_periods' => 10
        )
    );

    if ($last_modified !== null) {
        $scriptOptions['last-modified-start-date'] = $last_modified;
    }

    $etlConfig = new \ETL\Configuration\EtlConfiguration(CONFIG_DIR . '/etl/etl.json', null, $logger, array('option_overrides' => $scriptOptions['option-overrides']));
    $etlConfig->initialize();
    $overseerOptions = new \ETL\EtlOverseerOptions($scriptOptions, $logger);
    $overseer = new \ETL\EtlOverseer($overseerOptions, $logger);
    $overseer->execute($etlConfig);


    $process_end_time = date('Y-m-d H:i:s');

    $journal->markAsDone($process_start_time, $process_end_time, array());

    $process_start_time = date('Y-m-d H:i:s');

    $jobListJournal = new \DB\EtlJournalHelper('modw_aggregates', 'supremmfact_by_day');
    $last_modified = $jobListJournal->getLastModified();

    $scriptOptions = array(
        'actions' => array('supremm-aggregation-joblist'),
        'verbosity' => $conf['consoleLogLevel']
    );

    if ($last_modified !== null) {
        $scriptOptions['last-modified-start-date'] = $last_modified;
    }

    $etlConfig = new \ETL\Configuration\EtlConfiguration(CONFIG_DIR . '/etl/etl.json', null, $logger);
    $etlConfig->initialize();
    $overseerOptions = new \ETL\EtlOverseerOptions($scriptOptions, $logger);
    $overseer = new \ETL\EtlOverseer($overseerOptions, $logger);
    $overseer->execute($etlConfig);

    $process_end_time = date('Y-m-d H:i:s');
    $jobListJournal->markAsDone($process_start_time, $process_end_time, array());

    $logger->notice(array(
        'message'          => 'aggregate_supremm end',
        'process_end_time' => $process_end_time
    ));

}
catch (\Exception $e) {

    $msg = 'Caught exception while executing: ' . $e->getMessage();
    $logger->err(array(
        'message'    => $msg,
        'stacktrace' => $e->getTraceAsString()
    ));
}
