<?php
//DEPRECATED FOR NOW, since dimension is too large
namespace DataWarehouse\Query\SUPREMM\GroupBys;

/* 
* @author Amin Ghadersohi
* @date 2011-Jan-07
*
* class for adding group by job time (wall duration) to a query
* 
*/
class GroupByJobName extends \DataWarehouse\Query\SUPREMM\GroupBy
{
    public function __construct()
    {
        parent::__construct(
            'jobname',
            array(),
            "
		select distinct 
			gt.id as id, 
			gt.name short_name, 
			gt.name as long_name 
		from modw_supremm.job_name gt
		where 1
		order by gt.id
		"
        );
        
        $this->_id_field_name = 'id';
        $this->_long_name_field_name = 'name';
        $this->_short_name_field_name = 'name';
        $this->_order_id_field_name = 'id';
        //$this->setOrderByStat(NULL);
        $this->modw_supremm = new \DataWarehouse\Query\Model\Schema('modw_supremm');
        $this->job_names_table = new \DataWarehouse\Query\Model\Table($this->modw_supremm, 'job_name', 'jn');
    }
    public function getInfo()
    {
        return  "A categorization based on user provided job names.";
    }
    public static function getLabel()
    {
        return  'Job Name';
    }

    public function getDefaultDatasetType()
    {
        return 'aggregate';
    }
    public function getDefaultDisplayType($dataset_type = null)
    {
        if ($dataset_type == 'timeseries') {
            return 'area';
        } else {
            return 'bar';
        }
    }
    
    public function applyTo(\DataWarehouse\Query\Query &$query, \DataWarehouse\Query\Model\Table $data_table, $multi_group = false)
    {
        
        $query->addTable($this->job_names_table);
        $job_name_id_field = new \DataWarehouse\Query\Model\TableField($this->job_names_table, $this->_id_field_name, $this->getIdColumnName($multi_group));
        $job_name_description_field = new \DataWarehouse\Query\Model\TableField($this->job_names_table, $this->_long_name_field_name, $this->getLongNameColumnName($multi_group));
        $job_name_shortname_field = new \DataWarehouse\Query\Model\TableField($this->job_names_table, $this->_short_name_field_name, $this->getShortNameColumnName($multi_group));
        $order_id_field = new \DataWarehouse\Query\Model\TableField($this->job_names_table, $this->_order_id_field_name, $this->getOrderIdColumnName($multi_group));
        
        $query->addField($order_id_field);
        $query->addField($job_name_id_field);
        $query->addField($job_name_description_field);
        $query->addField($job_name_shortname_field);
        
        $query->addGroup($job_name_id_field);
        
        $datatable_jobname_id_field = new \DataWarehouse\Query\Model\TableField($data_table, 'jobname_id');
        $query->addWhereCondition(new \DataWarehouse\Query\Model\WhereCondition(
            $datatable_jobname_id_field,
            '=',
            $job_name_id_field
        ));
        $this->addOrder($query, $multi_group, 'asc', true);
    }

    public function addWhereJoin(\DataWarehouse\Query\Query &$query, \DataWarehouse\Query\Model\Table $data_table, $multi_group = false, $operation, $whereConstraint)
    {
        $query->addTable($this->job_names_table);

        $id_field = new \DataWarehouse\Query\Model\TableField($this->processor_buckets_table, $this->_id_field_name);

        $query->addWhereCondition(new \DataWarehouse\Query\Model\WhereCondition(
            $id_field,
            '=',
            new \DataWarehouse\Query\Model\TableField($data_table, 'jobname_id')
        ));

        // the where condition that specifies the constraint on the joined table
        if (is_array($whereConstraint)) {
            $whereConstraint="(". implode(",", $whereConstraint) .")";
        }

        $query->addWhereCondition(
            new \DataWarehouse\Query\Model\WhereCondition(
                $id_field,
                $operation,
                $whereConstraint
            )
        );
    } // addWhereJoin()

    
    public function addOrder(\DataWarehouse\Query\Query &$query, $multi_group = false, $dir = 'asc', $prepend = false)
    {
        $orderField = new \DataWarehouse\Query\Model\OrderBy(new \DataWarehouse\Query\Model\TableField($this->job_names_table, $this->_order_id_field_name), $dir, $this->getName());
        if ($prepend === true) {
            $query->prependOrder($orderField);
        } else {
            $query->addOrder($orderField);
        }
    }
    public function pullQueryParameters(&$request)
    {
        return parent::pullQueryParameters2($request, '_filter_', 'jobname_id');
    }
    public function pullQueryParameterDescriptions(&$request)
    {
        return parent::pullQueryParameterDescriptions2(
            $request,
            "select distinct name as field_label from modw_supremm.job_name  where id in (_filter_) order by id"
        );
    }
}
