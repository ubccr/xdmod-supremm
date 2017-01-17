<?php

namespace DataWarehouse\Query\SUPREMM\GroupBys;

/* 
* @author Joe White
* @date 2014-06-16
*
* class for adding group by shared to a query
* 
*/
class GroupByShared extends \DataWarehouse\Query\SUPREMM\GroupBy
{
   
    public function __construct()
    {
        parent::__construct(
            'shared',
            array(),
            "
			select 
				gt.id, 
				gt.name as short_name, 
				gt.name as long_name 
			from modw_supremm.shared gt 
			where 1
			order by gt.id
		"
        );

        $this->_id_field_name = 'id';
        $this->_long_name_field_name = 'name';
        $this->_short_name_field_name = 'name';
        $this->_order_id_field_name = 'id';
        $this->setOrderByStat(null);
        $this->modw_schema = new \DataWarehouse\Query\Model\Schema('modw_supremm');
        $this->shared_table = new \DataWarehouse\Query\Model\Table($this->modw_schema, 'shared', 'shared');
    }

    public function getInfo()
    {
        return  "A categorization of jobs into discrete groups based on whether the job shared nodes.";
    }

    public static function getLabel()
    {
        return 'Share Mode';
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
        $query->addTable($this->shared_table);
        
        $shared_id_field = new \DataWarehouse\Query\Model\TableField($this->shared_table, $this->_id_field_name, $this->getIdColumnName($multi_group));
        $shared_description_field = new \DataWarehouse\Query\Model\TableField($this->shared_table, $this->_long_name_field_name, $this->getLongNameColumnName($multi_group));
        $shared_shortname_field = new \DataWarehouse\Query\Model\TableField($this->shared_table, $this->_short_name_field_name, $this->getShortNameColumnName($multi_group));
        $order_id_field = new \DataWarehouse\Query\Model\TableField($this->shared_table, $this->_order_id_field_name, $this->getOrderIdColumnName($multi_group));
        
        $query->addField($order_id_field);
        $query->addField($shared_id_field);
        $query->addField($shared_description_field);
        $query->addField($shared_shortname_field);
        
        $query->addGroup($shared_id_field);
                                
        $query->addWhereCondition(new \DataWarehouse\Query\Model\WhereCondition(
            new \DataWarehouse\Query\Model\TableField($data_table, 'shared'),
            '=',
            new \DataWarehouse\Query\Model\TableField($this->shared_table, 'id')
        ));
                                                    
        $this->addOrder($query, $multi_group, 'asc', true);
    }

    public function addWhereJoin(
        \DataWarehouse\Query\Query &$query,
        \DataWarehouse\Query\Model\Table $data_table,
        $multi_group = false,
        $operation,
        $whereConstraint
    ) {
    
        // construct the join between the main data_table and this group by table
        $query->addTable($this->shared_table);

        $id_field = new \DataWarehouse\Query\Model\TableField($this->shared_table, $this->_id_field_name);

        // the where condition that specifies the join of the tables
        $query->addWhereCondition(new \DataWarehouse\Query\Model\WhereCondition(
            new \DataWarehouse\Query\Model\TableField($data_table, 'shared'),
            '=',
            $id_field
        ));

        // the where condition that specifies the constraint on the joined table
        if (is_array($whereConstraint)) {
            $whereConstraint="(". implode(",", $whereConstraint) .")";
        }


        // the where condition that specifies the constraint on the joined table
        $query->addWhereCondition(new \DataWarehouse\Query\Model\WhereCondition(
            $id_field,
            $operation,
            $whereConstraint
        ));
    } // addWhereJoin

    
    public function addOrder(\DataWarehouse\Query\Query &$query, $multi_group = false, $dir = 'asc', $prepend = false)
    {
        $orderField = new \DataWarehouse\Query\Model\OrderBy(new \DataWarehouse\Query\Model\TableField($this->shared_table, $this->_order_id_field_name), $dir, $this->getName());
        if ($prepend === true) {
            $query->prependOrder($orderField);
        } else {
            $query->addOrder($orderField);
        }
    }
    
    public function pullQueryParameters(&$request)
    {
        return parent::pullQueryParameters2($request, '_filter_', 'shared');
    }

    public function pullQueryParameterDescriptions(&$request)
    {
        return parent::pullQueryParameterDescriptions2(
            $request,
            "select name as field_label from modw_supremm.shared where id in (_filter_) order by id"
        );
    }

    public function getCategory()
    {
        return 'Usage';
    }
}
