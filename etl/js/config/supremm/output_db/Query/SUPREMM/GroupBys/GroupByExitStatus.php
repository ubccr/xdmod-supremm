<?php

namespace DataWarehouse\Query\SUPREMM\GroupBys;

/* 
* @author Joe White
* @date 2014-06-16
*
* class for adding group by Exit status to a query
* 
*/
class GroupByExitStatus extends \DataWarehouse\Query\SUPREMM\GroupBy
{	
	public function __construct()
	{
		parent::__construct('exit_status', array(), 
		"
			select 
				gt.id, 
				gt.name as short_name, 
				gt.name as long_name 
			from modw_supremm.exit_status gt 
			where 1
			order by gt.id
		");

		$this->_id_field_name = 'id';
		$this->_long_name_field_name = 'name';
		$this->_short_name_field_name = 'name';
		$this->_order_id_field_name = 'id';
		$this->setOrderByStat(NULL);
		$this->modw_schema = new \DataWarehouse\Query\Model\Schema('modw_supremm');
		$this->exitstatus_table = new \DataWarehouse\Query\Model\Table($this->modw_schema, 'exit_status', 'exit_status');
	}	

	public function getInfo() 
	{
		return 	"A categorization of jobs into discrete groups based on the exit status of each job reported by the resource manager.";
	}

	public static function getLabel()
	{
		return 'Exit Status';	
	}

	public function getDefaultDatasetType()
	{
		return 'aggregate';
	}

	public function getDefaultDisplayType($dataset_type = NULL)
	{
		if($dataset_type == 'timeseries')
		{
			return 'area';
		}
		else
		{
			return 'bar';
		}
	}
	
	public function applyTo(\DataWarehouse\Query\Query &$query, \DataWarehouse\Query\Model\Table $data_table, $multi_group = false)
	{
		$query->addTable($this->exitstatus_table);
		
		$exitstatus_id_field = new \DataWarehouse\Query\Model\TableField($this->exitstatus_table, $this->_id_field_name, $this->getIdColumnName($multi_group));
		$exitstatus_description_field = new \DataWarehouse\Query\Model\TableField($this->exitstatus_table, $this->_long_name_field_name, $this->getLongNameColumnName($multi_group));
		$exitstatus_shortname_field = new \DataWarehouse\Query\Model\TableField($this->exitstatus_table, $this->_short_name_field_name, $this->getShortNameColumnName($multi_group));
		$order_id_field = new \DataWarehouse\Query\Model\TableField($this->exitstatus_table,$this->_order_id_field_name, $this->getOrderIdColumnName($multi_group));
		
		$query->addField($order_id_field);
		$query->addField($exitstatus_id_field);
		$query->addField($exitstatus_description_field);	
		$query->addField($exitstatus_shortname_field);	
		
		$query->addGroup($exitstatus_id_field);	
								
		$query->addWhereCondition(new \DataWarehouse\Query\Model\WhereCondition(new \DataWarehouse\Query\Model\TableField($data_table,'exit_status_id'),
													'=',
													new \DataWarehouse\Query\Model\TableField($this->exitstatus_table, 'id')
													));
													
		$this->addOrder($query, $multi_group, 'asc',true);
	}

    // JMS: add join with where clause, October 2015
    public function addWhereJoin(\DataWarehouse\Query\Query &$query,
                                 \DataWarehouse\Query\Model\Table $data_table,
                                 $multi_group = false,
                                 $operation,
                                 $whereConstraint)
    {
        // construct the join between the main data_table and this group by table
        $query->addTable($this->exitstatus_table);

        $id_field = new \DataWarehouse\Query\Model\TableField($this->exitstatus_table,'id');

        // construct the join between the main data_table and this group by table
        $query->addWhereCondition(new \DataWarehouse\Query\Model\WhereCondition(
                                                    new \DataWarehouse\Query\Model\TableField($data_table, 'exit_status_id'),
                                                    '=',
                                                    $id_field
                                                    ));
        // the where condition that specifies the constraint on the joined table
        if (is_array($whereConstraint)) $whereConstraint="(". implode(",",$whereConstraint) .")";

        $query->addWhereCondition(
            new \DataWarehouse\Query\Model\WhereCondition(
                $id_field,
                $operation,
                $whereConstraint
            )
        );
    } // addWhereJoin

	
	public function addOrder(\DataWarehouse\Query\Query &$query, $multi_group = false, $dir = 'asc', $prepend = false)
	{
		$orderField = new \DataWarehouse\Query\Model\OrderBy(new \DataWarehouse\Query\Model\TableField($this->exitstatus_table, $this->_order_id_field_name),$dir, $this->getName());
		if($prepend === true)
		{
			$query->prependOrder($orderField);
		}else
		{
			$query->addOrder($orderField);
		}
	}
	
	public function pullQueryParameters(&$request)
	{
		return parent::pullQueryParameters2($request,'_filter_','exit_status_id');
	}

	public function pullQueryParameterDescriptions(&$request)
	{
		return parent::pullQueryParameterDescriptions2($request, 
							"select name as field_label from modw_supremm.exit_status where id in (_filter_) order by id");
	}

    public function getCategory()
    {
        return 'Executable';
    }
}
?>
