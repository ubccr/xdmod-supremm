<?php
namespace DataWarehouse\Query\SUPREMM;

use \DataWarehouse\Query\Model\Table;
use \DataWarehouse\Query\Model\TableField;
use \DataWarehouse\Query\Model\WhereCondition;
use \DataWarehouse\Query\Model\Schema;
use \DataWarehouse\Query\Model\OrderBy;
use Psr\Log\LoggerInterface;

/*
* @author Amin Ghadersohi
* @date 2013-Feb-07
*
*/
class RawData extends \DataWarehouse\Query\Query implements \DataWarehouse\Query\iQuery
{

    public function __construct(
        $realmId,
        $aggregationUnitName,
        $start_date,
        $end_date,
        $groupById = null,
        $statisticId = null,
        array $parameters = array(),
        LoggerInterface $logger = null
    )
	{
        $realmId = 'SUPREMM';
        parent::__construct(
            $realmId,
            $aggregationUnitName,
            $start_date,
            $end_date,
            $groupById,
            null,
            $parameters
        );


        $dataTable = $this->getDataTable();
        $joblistTable = new Table($dataTable->getSchema(), $dataTable->getName() . "_joblist", "jl");
        $factTable = new Table(new Schema('modw_supremm'), "job", "sj" );

		$resourcefactTable = new Table(new Schema('modw'),'resourcefact', 'rf');
		$this->addTable($resourcefactTable);

		$this->addWhereCondition(new WhereCondition(new TableField($dataTable,"resource_id"),
													'=',
													new TableField($resourcefactTable,"id") ));

		$personTable = new Table(new Schema('modw'),'person', 'p');

		$this->addTable($personTable);
		$this->addWhereCondition(new WhereCondition(new TableField($dataTable,"person_id"),
													'=',
													new TableField($personTable,"id") ));

		$this->addField(new TableField($resourcefactTable,"code", 'resource'));
		$this->addField(new TableField($personTable, "long_name", "name"));

        $this->addField( new TableField($factTable, "_id", "jobid") );
        $this->addField( new TableField($factTable, "local_job_id" ) );
        $this->addField(new TableField($factTable, "start_time_ts"));
        $this->addField(new TableField($factTable, "end_time_ts"));
        $this->addField(new TableField($factTable, "cpu_user"));

        $this->addTable( $joblistTable );
        $this->addTable( $factTable );

        $this->addWhereCondition(new WhereCondition( new TableField($joblistTable, "agg_id"), "=",
                                                                                new TableField($dataTable, "id") ));
        $this->addWhereCondition(new WhereCondition( new TableField($joblistTable, "jobid"), "=",
                                                                                new TableField($factTable, "_id") ));

        // This is used by Integrations and not currently shown on the XDMoD interface
        $jobnameTable = new Table(new Schema('modw_supremm'), "job_name", "jn" );
        $this->addWhereCondition(new WhereCondition(new TableField($factTable, "jobname_id"), '=', new TableField($jobnameTable, "id") ));
        $this->addField(new TableField($jobnameTable, 'name', 'job_name'));
        $this->addTable($jobnameTable );

        switch($statisticId) {
            case "job_count":
                $this->addWhereCondition(new WhereCondition( "sj.end_time_ts", "BETWEEN", "duration.day_start_ts and duration.day_end_ts") );
                break;
            case "started_job_count":
                $this->addWhereCondition(new WhereCondition( "sj.start_time_ts", "BETWEEN", "duration.day_start_ts and duration.day_end_ts") );
                break;
            default:
                // All other metrics show running job count
                break;
        }

        $this->addOrder(new OrderBy(new TableField($factTable, 'end_time_ts'), 'DESC', 'end_time_ts'));
    }

    public function getQueryString($limit = NULL, $offset = NULL, $extraHavingClause = NULL)
    {
        $wheres = $this->getWhereConditions();
        $groups = $this->getGroups();

        $select_tables = $this->getSelectTables();
        $select_fields = $this->getSelectFields();

        $select_order_by = $this->getSelectOrderBy();

        $data_query = "SELECT DISTINCT ".implode(", ",$select_fields).
            " FROM ".implode(", ", $select_tables).
            " WHERE ".implode(" AND ", $wheres);

        if(count($groups) > 0)
        {
            $data_query .= " GROUP BY \n".implode(",\n",$groups);
        }
        if($extraHavingClause != NULL)
        {
            $data_query .= " HAVING " . $extraHavingClause . "\n";
        }
        if(count($select_order_by) > 0)
        {
            $data_query .= " ORDER BY \n".implode(",\n",$select_order_by);
        }

        if($limit !== NULL && $offset !== NULL)
        {
            $data_query .= " LIMIT $limit OFFSET $offset";
        }
        return $data_query;
    }

    public function getCountQueryString()
    {
        $wheres = $this->getWhereConditions();
        $groups = $this->getGroups();

        $select_tables = $this->getSelectTables();
        $select_fields = $this->getSelectFields();

        $data_query = "SELECT COUNT(*) AS row_count FROM (SELECT DISTINCT ".implode(", ",$select_fields).
            " FROM ".implode(", ", $select_tables).
            " WHERE ".implode(" AND ", $wheres);

        if(count($groups) > 0)
        {
            $data_query .= " GROUP BY \n".implode(",\n",$groups);
        }
        return $data_query . ') as a';
    }
    public function getQueryType(){
        return 'timeseries';
    }
}
?>
