<?php

namespace DataWarehouse\Query\SUPREMM\GroupBys;

/* 
* @author Joe White
* @date 2014-06-16
*
*/
class _GROUPBY_CLASS_ extends \DataWarehouse\Query\SUPREMM\GroupBy
{
   
    public function __construct()
    {
        parent::__construct(
            '_NAME_',
            array(),
            "
			select 
				gt.id, 
				gt.description as short_name, 
				gt.description as long_name 
			from modw_supremm._DIMENSION_TABLE_ gt
			where 1
			order by gt.id
		"
        );

        $this->_id_field_name = 'id';
        $this->_long_name_field_name = 'description';
        $this->_short_name_field_name = 'description';
        $this->_order_id_field_name = 'id';
        $this->setOrderByStat(null);

        $modw_schema = new \DataWarehouse\Query\Model\Schema('modw_supremm');
        $this->buckets_table = new \DataWarehouse\Query\Model\Table($modw_schema, '_DIMENSION_TABLE_', '_DIMENSION_TABLE_');
    }

    public function getInfo()
    {
        return '_INFO_';
    }

    public static function getLabel()
    {
        return '_LABEL_';
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
        $query->addTable($this->buckets_table);
        
        $buckets_id_field = new \DataWarehouse\Query\Model\TableField($this->buckets_table, $this->_id_field_name, $this->getIdColumnName($multi_group));
        $buckets_description_field = new \DataWarehouse\Query\Model\TableField($this->buckets_table, $this->_long_name_field_name, $this->getLongNameColumnName($multi_group));
        $buckets_shortname_field = new \DataWarehouse\Query\Model\TableField($this->buckets_table, $this->_short_name_field_name, $this->getShortNameColumnName($multi_group));
        $order_id_field = new \DataWarehouse\Query\Model\TableField($this->buckets_table, $this->_order_id_field_name, $this->getOrderIdColumnName($multi_group));
        
        $query->addField($order_id_field);
        $query->addField($buckets_id_field);
        $query->addField($buckets_description_field);
        $query->addField($buckets_shortname_field);
        
        $query->addGroup($buckets_id_field);
                                
        $query->addWhereCondition(
            new \DataWarehouse\Query\Model\WhereCondition(
                new \DataWarehouse\Query\Model\TableField($data_table, '_AGGREGATE_COLUMN_'),
                '=',
                new \DataWarehouse\Query\Model\TableField($this->buckets_table, 'id')
            )
        );
                                                    
        $this->addOrder($query, $multi_group, 'asc', true);
    }

    // JMS: add join with where clause, October 2015
    public function addWhereJoin(
        \DataWarehouse\Query\Query &$query,
        \DataWarehouse\Query\Model\Table $data_table,
        $multi_group = false,
        $operation,
        $whereConstraint
    ) {
    
        // construct the join between the main data_table and this group by table
        $query->addTable($this->buckets_table);

        $id_field = new \DataWarehouse\Query\Model\TableField($this->buckets_table, 'id');

        // construct the join between the main data_table and this group by table
        $query->addWhereCondition(
            new \DataWarehouse\Query\Model\WhereCondition(
                new \DataWarehouse\Query\Model\TableField($data_table, '_AGGREGATE_COLUMN_'),
                '=',
                $id_field
            )
        );

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
    } // addWhereJoin

    
    public function addOrder(\DataWarehouse\Query\Query &$query, $multi_group = false, $dir = 'asc', $prepend = false)
    {
        $orderField = new \DataWarehouse\Query\Model\OrderBy(new \DataWarehouse\Query\Model\TableField($this->buckets_table, $this->_order_id_field_name), $dir, $this->getName());
        if ($prepend === true) {
            $query->prependOrder($orderField);
        } else {
            $query->addOrder($orderField);
        }
    }
    
    public function pullQueryParameters(&$request)
    {
        return parent::pullQueryParameters2($request, '_filter_', '_AGGREGATE_COLUMN_');
    }

    public function pullQueryParameterDescriptions(&$request)
    {
        return parent::pullQueryParameterDescriptions2(
            $request,
            "SELECT description AS field_label FROM modw_supremm._DIMENSION_TABLE_ WHERE id IN (_filter_) ORDER BY id"
        );
    }

    public function getCategory()
    {
        return '_CATEGORY_';
    }
}
