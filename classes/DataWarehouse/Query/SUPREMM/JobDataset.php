<?php
namespace DataWarehouse\Query\SUPREMM;

use Configuration\XdmodConfiguration;
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
    private $sconf = null;
    private $documentation = array();

    public function __construct(
        array $parameters,
        $stat = "all"
    ) {
    
        parent::__construct('SUPREMM', 'modw_supremm', 'job', array());

        $this->loadRawStatsConfig();

        $joinlist = array(
            "exit_status_id" => array( "schema" => "modw_supremm", "table" => "exit_status"),
            "cluster_id" => array( "schema" => "modw_supremm", "table" => "cluster"),
            "jobname_id" => array( "schema" => "modw_supremm", "table" => "job_name"),
            "nodecount_id" => array( "schema" => "modw", "table" => "nodecount", "column" => "nodes"),
            "application_id" => array( "schema" => "modw_supremm", "table" => "application"),
            "cwd_id" => array( "schema" => "modw_supremm", "table" => "cwd", "column" => "cwd"),
            "executable_id" => array( "schema" => "modw_supremm", "table" => "executable", "column" => "exec"),
            "piperson_organization_id" => array( "schema" => "modw", "table" => "organization"),
            "principalinvestigator_person_id" => array( "schema" => "modw", "table" => "person", "column" => "long_name" ),
            "person_organization_id" => array( "schema" => "modw", "table" => "organization"),
            "person_id" => array( "schema" => "modw", "table" => "person", "column" => "long_name" ),
            "systemaccount_id" => array( "schema" => "modw", "table" => "systemaccount", "column" => "username" ),
            "fos_id" => array( "schema" => "modw", "table" => "fieldofscience", "column" => "description" ),
            "account_id" => array( "schema" => "modw", "table" => "account", "column" => "charge_number" ),
            "organization_id" => array(  "schema" => "modw", "table" => "organization"),
            "resource_id" => array(  "schema" => "modw", "table" => "resourcefact" )
        );


        $dataTable = $this->getDataTable();

        if (isset($parameters['primary_key'])) {
            $this->addPdoWhereCondition(new WhereCondition(new TableField($dataTable, '_id'), "=", $parameters['primary_key']));
        } else {
            $this->addPdoWhereCondition(new WhereCondition(new TableField($dataTable, 'resource_id'), '=', $parameters['resource_id']));
            $this->addPdoWhereCondition(new WhereCondition(new TableField($dataTable, 'local_job_id'), '=', $parameters['job_identifier']));
        }

        if ($stat == "accounting") {
            $i = 0;
            foreach ($this->sconf["modw_supremm.job"] as $sdata) {
                $sfield = $sdata['key'];
                if ($sdata['dtype'] == "accounting") {
                    $this->addField(new TableField($dataTable, $sfield));
                    $this->documentation[$sfield] = $sdata;
                } elseif ($sdata['dtype'] == "foreignkey") {
                    if (isset($joinlist[$sfield])) {
                        $info = $joinlist[$sfield];
                        $i += 1;
                        $tmptable = new Table(new Schema($info['schema']), $info['table'], "ft$i");
                        $this->addTable($tmptable);
                        $this->addWhereCondition(new WhereCondition(new TableField($dataTable, $sfield), '=', new TableField($tmptable, "id")));
                        $fcol = isset($info['column']) ? $info['column'] : 'name';
                        $this->addField(new TableField($tmptable, $fcol, $sdata['name']));

                        $this->documentation[ $sdata['name'] ] = $sdata;
                    }
                }
            }
            $rf = new Table(new Schema('modw'), 'resourcefact', 'rf');
            $this->addTable($rf);
            $this->addWhereCondition(new WhereCondition(new TableField($dataTable, 'resource_id'), '=', new TableField($rf, 'id')));
            $this->addField(new TableField($rf, 'timezone'));
            $this->documentation['timezone'] = array(
                "name" => "Timezone",
                "documentation" => "The timezone of the resource.",
                "group" => "Administration",
                'visibility' => 'public',
                "per" => "resource");
        } elseif ($stat == "metrics") {
            foreach ($this->sconf["modw_supremm.job"] as $sdata) {
                $sfield = $sdata['key'];
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
                        $this->addField(new TableField($dataTable, $sfield));
                        $this->documentation[$sfield] = $sdata;
                    }
                }
            }
        } elseif ($stat == "analytics") {

            $joberrors = new Table(new Schema('modw_supremm'), 'job_errors', 'je');
            $this->addTable($joberrors);

            $this->addWhereCondition(
                new WhereCondition(
                    new TableField($dataTable, '_id'),
                    '=',
                    new TableField($joberrors, '_id')
                )
            );

            foreach ($this->sconf["modw_supremm.job"] as $sdata) {
                $sfield = $sdata['key'];
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
                'dtype' => 'analysis'
            );

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

    private function loadRawStatsConfig()
    {
        if ($this->sconf == null) {
            $configFile = new XdmodConfiguration(
                'rawstatisticsconfig.json',
                CONFIG_DIR
            );
            $configFile->initialize();

            $this->sconf = json_decode($configFile->toJson(), true);
        }
    }

    public function getColumnDocumentation()
    {
        return $this->documentation;
    }
}
