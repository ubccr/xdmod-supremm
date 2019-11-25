<?php
require_once __DIR__ . '/../configuration/linker.php';

use CCR\DB;
use ETL\Utilities;

$conf = array(
    'emailSubject' => gethostname() . ': XDMOD: Data Warehouse: SUPReMM ETL Log',
);

$options = array(
    'h'  => 'help',
    'a:' => 'append:',
    'u:' => 'useetllog:',
    't:' => 'analyze-tables',
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

    -t, --analyze-tables=YESNO
        whether to override the table analysis settings in the aggregation.
        Default is to leave the settings unmodified.

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

foreach ($args as $arg => $value) {
    switch ($arg) {
        case 'h':
        case 'help':
            usage_and_exit();
            break;
        case 't':
        case 'analyze-tables':
            $conf['analyze_table'] = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
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

function run_aggregation($sourceTable, $pipeline)
{
    global $conf, $logger;

    $process_start_time = date('Y-m-d H:i:s');

    $journal = new \DB\EtlJournalHelper($sourceTable[0], $sourceTable[1]);

    $last_modified = $journal->getLastModified();

    $scriptOptions = array(
        'process-sections' => $pipeline,
        'verbosity' => $conf['consoleLogLevel'],
        'option-overrides' => array(
            'batch_aggregation_min_num_periods' => 10
        ),
        'default-module-name' => 'xdmod'
    );

    if (isset($conf['analyze_table'])) {
        $scriptOptions['option-overrides']['analyze_table'] = $conf['analyze_table'];
    }

    if ($last_modified !== null) {
        $scriptOptions['last-modified-start-date'] = $last_modified;
    }

    $etlConfig = \ETL\Configuration\EtlConfiguration::factory(
        CONFIG_DIR . '/etl/etl.json',
        null,
        $logger,
        array(
            'option_overrides' => $scriptOptions['option-overrides'],
            'default_module_name' => $scriptOptions['default-module-name']
        )
    );
    Utilities::setEtlConfig($etlConfig);
    $overseerOptions = new \ETL\EtlOverseerOptions($scriptOptions, $logger);
    $overseer = new \ETL\EtlOverseer($overseerOptions, $logger);
    $overseer->execute($etlConfig);

    $process_end_time = date('Y-m-d H:i:s');

    $journal->markAsDone($process_start_time, $process_end_time, array());
}

try {
    run_aggregation(
        array('modw_supremm', 'job'),
        array('supremm.supremm-realm-aggregation', 'jobefficiency.aggregation')
    );
    run_aggregation(array('modw_aggregates', 'supremmfact_by_day'), array('supremm.supremm-realm-joblist'));
    run_aggregation(array('modw_aggregates', 'jobefficiency_by_day'), array('jobefficiency.joblist'));

    $logger->notice(array(
        'message'          => 'aggregate_supremm end',
        'process_end_time' => date('Y-m-d H:i:s')
    ));
} catch (\Exception $e) {
    $msg = 'Caught exception while executing: ' . $e->getMessage();
    $logger->err(array(
        'message'    => $msg,
        'stacktrace' => $e->getTraceAsString()
    ));
}
