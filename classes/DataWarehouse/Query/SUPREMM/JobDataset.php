<?php
namespace DataWarehouse\Query\SUPREMM;

use DataWarehouse\Data\RawStatisticsConfiguration;
use \DataWarehouse\Query\Model\Table;
use \DataWarehouse\Query\Model\TableField;
use \DataWarehouse\Query\Model\Field;
use \DataWarehouse\Query\Model\FormulaField;
use \DataWarehouse\Query\Model\WhereCondition;
use \DataWarehouse\Query\Model\Schema;

/*
* @author Joe White
* @date 2015-03-25
*
*/
class JobDataset extends \DataWarehouse\Query\RawQuery
{
    /**
     * Tables that have been added to the query with their alias used as key.
     * @var \DataWarehouse\Query\Model\Table[]
     */
    private $tables = [];

    /**
     * Table definitions with their alias used as key.
     * @var array[]
     */
    private $tableDefs = [];

    /**
     * Field definitions with their alias used as key.
     * @var array
     */
    private $fieldDefs = [];

    private $documentation = array();

    public function __construct(
        array $parameters,
        $stat = "all"
    ) {

        parent::__construct('SUPREMM', 'modw_supremm', 'job', array());

        $conf = RawStatisticsConfiguration::factory();

        $dataTable = $this->getDataTable();
        $this->tables[$dataTable->getAlias()->getName()] = $dataTable;

        foreach ($conf->getQueryTableDefinitions('SUPREMM') as $tableDef) {
            $this->tableDefs[$tableDef['alias']] = $tableDef;
        }

        foreach ($conf->getQueryFieldDefinitions('SUPREMM') as $fieldDef) {
            $this->fieldDefs[$fieldDef['alias']] = $fieldDef;
        }

        if (isset($parameters['primary_key'])) {
            $this->addPdoWhereCondition(new WhereCondition(new TableField($dataTable, '_id'), "=", $parameters['primary_key']));
        } elseif (isset($parameters['start_date']) && isset($parameters['end_date'])) {
            date_default_timezone_set('UTC');
            $startDate = date_parse_from_format('Y-m-d', $parameters['start_date']);
            $startDateTs = mktime(
                0,
                0,
                0,
                $startDate['month'],
                $startDate['day'],
                $startDate['year']
            );
            if ($startDateTs === false) {
                throw new \Exception('invalid "start_date" query parameter');
            }

            $endDate = date_parse_from_format('Y-m-d', $parameters['end_date']);
            $endDateTs = mktime(
                23,
                59,
                59,
                $endDate['month'],
                $endDate['day'],
                $endDate['year']
            );
            if ($startDateTs === false) {
                throw new \Exception('invalid "end_date" query parameter');
            }

            $this->addPdoWhereCondition(new WhereCondition(new TableField($dataTable, 'end_time_ts'), ">=", $startDateTs));
            $this->addPdoWhereCondition(new WhereCondition(new TableField($dataTable, 'end_time_ts'), "<=", $endDateTs));
        } else {
            $this->addPdoWhereCondition(new WhereCondition(new TableField($dataTable, 'resource_id'), '=', $parameters['resource_id']));
            $this->addPdoWhereCondition(new WhereCondition(new TableField($dataTable, 'local_job_id'), '=', $parameters['job_identifier']));
        }

        if ($stat == "accounting") {
            $this->addAccountingFields();
        } elseif ($stat == "metrics") {
            $this->addMetricsFields();
        } elseif ($stat == "analytics") {
            $this->addAnalyticsFields();
        } elseif ($stat == 'batch') {
            $this->addAccountingFields();
            $this->addMetricsFields();
        } elseif ($stat == "jobscript") {
            $batchscriptTable = new Table(new Schema("modw_supremm"), "job_scripts", "js");
            $this->addTable($batchscriptTable);
            $this->addWhereCondition(new WhereCondition(new TableField($dataTable, "tg_job_id"), '=', new TableField($batchscriptTable, "tg_job_id")));
            $this->addField(new TableField($batchscriptTable, "script"));

            $this->documentation['script'] = array("units" => null, "documentation" => "The batch script that was submitted to the job scheduler.", "name" => "script");
        } elseif ($stat == "internal") {
            $this->addField(new TableField($dataTable, "resource_id"));
            $this->addField(new TableField($dataTable, "local_job_id"));
            $this->addField(new TableField($dataTable, "start_time_ts"));
            $this->addField(new TableField($dataTable, "end_time_ts"));
            $this->addField(new TableField($dataTable, "cpu_user"));
            $this->addField(new TableField($dataTable, "catastrophe"));
            $this->addField(new TableField($dataTable, "shared"));

            $rf = new Table(new Schema('modw'), 'resourcefact', 'rf');
            $this->addTable($rf);
            $this->addWhereCondition(new WhereCondition(new TableField($dataTable, 'resource_id'), '=', new TableField($rf, 'id')));
            $this->addField(new TableField($rf, 'timezone'));
            $this->addField(new TableField($rf, 'code', 'resource'));

        } elseif ($stat == "peers") {
            $jp = new Table(new Schema("modw_supremm"), "job_peers", "jp");
            $this->joinTo($jp, "_id", "other_job_id", "jobid", "job_id");

            $jf = new Table(new Schema("modw_supremm"), "job", "jf1");
            $this->addTable($jf);
            $this->addWhereCondition(new WhereCondition(new TableField($jp, "other_job_id"), '=', new TableField($jf, "_id")));
            $this->addField(new TableField($jf, "local_job_id"));
            $this->addField(new TableField($jf, "start_time_ts"));
            $this->addField(new TableField($jf, "end_time_ts"));

            $rt = new Table(new Schema("modw"), "resourcefact", "rf");
            $this->addTable($rt);
            $this->addWhereCondition(new WhereCondition(new TableField($jf, "resource_id"), '=', new TableField($rt, "id")));
            $this->addField(new TableField($rt, "code", "resource"));

            $pt = new Table(new Schema('modw'), 'person', 'p');
            $this->addTable($pt);
            $this->addWhereCondition(new WhereCondition(new TableField($jf, "person_id"), '=', new TableField($pt, "id")));
            $this->addField(new TableField($pt, "long_name", "name"));

            $this->addOrder(
                new \DataWarehouse\Query\Model\OrderBy(
                    new TableField($jf, 'start_time_ts'),
                    'asc',
                    'start_time_ts'
                )
            );
        } else {
            // TODO This code is very similar to the code in ./classes/DataWarehouse/Query/SUPREMM/RawData.php ~ line 58
            // make this more common

            $this->addField(new TableField($dataTable, "_id", "jobid"));
            $this->addField(new TableField($dataTable, "local_job_id"));

            $rt = new Table(new Schema("modw"), "resourcefact", "rf");
            $this->joinTo($rt, "resource_id", "code", "resource");

            $pt = new Table(new Schema('modw'), 'person', 'p');
            $this->joinTo($pt, "person_id", "long_name", "name");

            $st = new Table(new Schema('modw'), 'systemaccount', 'sa');
            $this->joinTo($st, "systemaccount_id", "username", "username");
        }
    }

    /**
     * Add a field to the query using it's raw statistics definition.
     *
     * Also add and join the necessary table if not already part of the query
     * and adds the field to the documentation array.
     *
     * @param array $fieldDef Field definition from raw statistics configuration.
     */
    private function addFieldByDefinition(array $fieldDef)
    {
        $tableAlias = $fieldDef['tableAlias'];
        $table = null;
        if (array_key_exists($tableAlias, $this->tables)) {
            $table = $this->tables[$tableAlias];
        } elseif (array_key_exists($tableAlias, $this->tableDefs)) {
            $table = $this->addTableByDefinition($this->tableDefs[$tableAlias]);
        } else {
            throw new \Exception(sprintf('Unrecognized table alias "%s"', $tableAlias));
        }
        $this->addField(new TableField($table, $fieldDef['column'], $fieldDef['alias']));
        $this->documentation[$fieldDef['alias']] = $fieldDef;
    }

    /**
     * Add a table to this query using it's raw statistics definition.
     *
     * @param array $tableDef Table definition from raw statistics configuration.
     * @return \DataWarehouse\Query\Model\Table
     */
    private function addTableByDefinition(array $tableDef)
    {
        $table = new Table(new Schema($tableDef['schema']), $tableDef['name'], $tableDef['alias']);
        $this->tables[$tableDef['alias']] = $table;
        $this->addTable($table);
        if (!array_key_exists($tableDef['foreignTableAlias'], $this->tables)) {
            throw new \Exception(sprintf('Unrecognized table alias "%s"', $tableDef['foreignTableAlias']));
        }
        $this->addWhereCondition(
            new WhereCondition(
                new TableField($this->tables[$tableDef['foreignTableAlias']], $tableDef['foreignKey']),
                '=',
                new TableField($table, $tableDef['primaryKey'])
            )
        );
        return $table;
    }

    private function joinTo($othertable, $joinkey, $otherkey, $colalias, $idcol = "id")
    {
        $this->addTable($othertable);
        $this->addWhereCondition(new WhereCondition(new TableField($this->getDataTable(), $joinkey), '=', new TableField($othertable, $idcol)));
        $this->addField(new TableField($othertable, $otherkey, $colalias));
    }

    /**
     * Add a field and the corresponding error field to the query.
     *
     * @param Field  $field      The field to add to the query.
     * @param string $fieldName  The name of the field.
     * @param Table  $errorTable The error table.
     * @param string $errorName  The name of the error field, if null then the field name is
     *                           autogenerated based on the fieldName.
     *
     * @return null
     */
    private function addFieldWithError($field, $fieldName, $errorTable, $errorName = null)
    {
        static $errorTableIdx = 0;

        $this->addField($field);

        $errordesc = new Table(
            new Schema('modw'),
            'error_descriptions',
            'ed'.$errorTableIdx
        );

        $errorTableIdx += 1;

        $this->addLeftJoin($errordesc,
            new WhereCondition(
                new Field( '((' .$errorTable->getAlias() . '.' . $fieldName . ' >> ' . $errordesc->getAlias() . '.id - 1) & 1)'),
                '>',
                '0'
            )
        );

        if ($errorName === null) {
            $errorName = $fieldName.'_error';
        }

        $this->addField(
            new Field(
                'GROUP_CONCAT( DISTINCT '. $errordesc->getAlias() . ".description SEPARATOR '<br />' )",
                $errorName
            )
        );
    }

    public function getColumnDocumentation()
    {
        return $this->documentation;
    }

    private function addAccountingFields()
    {
        foreach ($this->fieldDefs as $sdata) {
            if ($sdata['dtype'] == "accounting" || $sdata['dtype'] == "foreignkey") {
                $this->addFieldByDefinition($sdata);
            }
        }
    }

    private function addMetricsFields()
    {
        $dataTable = $this->getDataTable();
        foreach ($this->fieldDefs as $sfield => $sdata) {
            if ($sdata['dtype'] == "statistic") {
                // HACK
                if ($sdata['units'] == 'cpuratio' || $sdata['units'] == '%') {
                    $this->addField(new FormulaField("100.0 * jf.$sfield", $sfield));
                    $this->documentation[$sfield] = $sdata;
                    $this->documentation[$sfield]['units'] = "%";
                } elseif ($sfield == "memory_used" || $sfield == "mem_used_including_os_caches") {
                    $this->addField(new FormulaField("jf.cores_avail * jf.$sfield", $sfield));
                    $this->documentation[$sfield] = $sdata;
                } else {
                    $this->addFieldByDefinition($sdata);
                }
            }
        }
    }

    private function addAnalyticsFields()
    {
        $dataTable = $this->getDataTable();
        $joberrors = new Table(new Schema('modw_supremm'), 'job_errors', 'je');
        $this->addTable($joberrors);

        $this->addWhereCondition(
            new WhereCondition(
                new TableField($dataTable, '_id'),
                '=',
                new TableField($joberrors, '_id')
            )
        );

        foreach ($this->fieldDefs as $sfield => $sdata) {
            // TODO work out a better way to have metrics have multiple
            // meta-types (ie cpu user is an analytic as well as a metric).
            if ($sfield == "cpu_user") {
                $this->addFieldWithError(new TableField($dataTable, $sfield), $sfield, $joberrors);
                $this->documentation[$sfield] = $sdata;
            }
        }
        $this->addFieldWithError(
            new FormulaField("(1.0 - (1.0 / (1.0 + 1000.0 * jf.catastrophe)))", "homogeneity"),
            'catastrophe',
            $joberrors,
            'homogeneity_error'
        );
        $this->documentation['homogeneity'] = array(
            'name'=> 'Homogeneity',
            'units' => 'ratio',
            'per' => 'job',
            'visibility' => 'public',
            'documentation' => 'A measure of how uniform the L1D load rate is over the lifetime of the job.
                                Jobs with a low homogeneity value (~0) should be investigated to check if there
                                has been a catastrophic failure during the job',
            'batchExport' => true,
            'dtype' => 'analysis'
        );

        $this->addFieldWithError(
            new FormulaField('(1.0 - (jf.cpu_user_imbalance/100.0))', 'cpu_user_balance'),
            'cpu_user_imbalance',
            $joberrors,
            'cpu_user_balance_error'
        );
        $this->documentation['cpu_user_balance'] = array(
            'name'=> 'CPU User Balance',
            'units' => 'ratio',
            'per' => 'job',
            'visibility' => 'public',
            'documentation' => 'A measure of how uniform the CPU usage is between the cores that the job was
                                assigned. A value of CPU User Balance near 1 corresponds to a job with evenly
                                loaded CPUs. A value near 0 corresponds to a job with one or more CPU cores
                                with much lower utilization that the others.',
            'batchExport' => true,
            'dtype' => 'analysis'
        );

        $this->addFieldWithError(
            new FormulaField('(1.0 - 1.0/POW(2-jf.max_memory, 5))', 'mem_coefficient'),
            'max_memory',
            $joberrors,
            'mem_coefficient_error'
        );
        $this->documentation['mem_coefficient'] = array(
            'name'=> 'Memory Headroom',
            'units' => 'ratio',
            'per' => 'job',
            'visibility' => 'public',
            'documentation' => 'A measure of the peak compute-node memory usage for the job. A value of 0 corresponds
            to a job which used all of the available memory and 1 corresponds to a job with low memory usage.
            The value is computed as 1 - 1 / (2 - m)^5, where m is the ratio of memory used to memory available for
            the compute node that had the highest memory usage.',
            'batchExport' => true,
            'dtype' => 'analysis'
        );
    }
}
