<?php

namespace DataWarehouse\Query\SUPREMM\GroupBys;

/* 
* @author Amin Ghadersohi
* @date 2011-Jan-07
*
* class for adding group by resource to a query
* 
*/

class GroupByGrantedPe extends \DataWarehouse\Query\SUPREMM\GroupBy
{
    public static function getLabel($query = null)
    {
        return 'Granted Processing Element';
    }

    public function getInfo()
    {
        return  "How many cores within one node.";
    }

    public function __construct()
    {
        parent::__construct(
            'granted_pe',
            array(),
            "SELECT distinct
								gt.id as id, 
								gt.name as short_name, 
								gt.name as long_name
								FROM 
								modw_supremm.granted_pe gt
								where 1
								order by long_name",
            array()
        );
        $this->_id_field_name = 'id';
        $this->_long_name_field_name = 'name';
        $this->_short_name_field_name = 'name';
        $this->_order_id_field_name = 'id';
        $this->modw_schema = new \DataWarehouse\Query\Model\Schema('modw');
        $this->taccstats_schema = new \DataWarehouse\Query\Model\Schema('modw_supremm');
        $this->granted_pe_table = new \DataWarehouse\Query\Model\Table($this->taccstats_schema, 'granted_pe', 'gpe');
    }
    
    public function applyTo(\DataWarehouse\Query\Query &$query, \DataWarehouse\Query\Model\Table $data_table, $multi_group = false)
    {
        $query->addTable($this->granted_pe_table);
        
        $id_field = new \DataWarehouse\Query\Model\TableField($this->granted_pe_table, $this->_id_field_name, $this->getIdColumnName($multi_group));
        $name_field = new \DataWarehouse\Query\Model\TableField($this->granted_pe_table, $this->_long_name_field_name, $this->getLongNameColumnName($multi_group));
        $shortname_field = new \DataWarehouse\Query\Model\TableField($this->granted_pe_table, $this->_short_name_field_name, $this->getShortNameColumnName($multi_group));
        $order_id_field = new \DataWarehouse\Query\Model\TableField($this->granted_pe_table, $this->_order_id_field_name, $this->getOrderIdColumnName($multi_group));
        
        $query->addField($order_id_field);
        $query->addField($id_field);
        $query->addField($name_field);
        $query->addField($shortname_field);
        
        $query->addGroup($id_field);
        
        
        $datatable_granted_pe_field = new \DataWarehouse\Query\Model\TableField($data_table, 'granted_pe');
        $query->addWhereCondition(new \DataWarehouse\Query\Model\WhereCondition(
            $id_field,
            '=',
            $datatable_granted_pe_field
        ));

        $this->addOrder($query, $multi_group);

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
        $query->addTable($this->granted_pe_table);

        $id_field = new \DataWarehouse\Query\Model\TableField($this->granted_pe_table, 'id');
        $datatable_id_field = new \DataWarehouse\Query\Model\TableField($data_table, 'granted_pe');

        // the where condition that specifies the join of the tables
        $query->addWhereCondition(
            new \DataWarehouse\Query\Model\WhereCondition(
                $id_field,
                '=',
                $datatable_id_field
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
    } // addWhereJoin()

    
    public function addOrder(\DataWarehouse\Query\Query &$query, $multi_group = false, $dir = 'asc', $prepend = false)
    {
        $orderField = new \DataWarehouse\Query\Model\OrderBy(new \DataWarehouse\Query\Model\TableField($this->granted_pe_table, $this->_order_id_field_name), $dir, $this->getName());
        if ($prepend === true) {
            $query->prependOrder($orderField);
        } else {
            $query->addOrder($orderField);
        }
    }
    
    public function pullQueryParameters(&$request)
    {
        return parent::pullQueryParameters2($request, '_filter_', 'granted_pe');
        
    }
    public function pullQueryParameterDescriptions(&$request)
    {
        return parent::pullQueryParameterDescriptions2(
            $request,
            "select name as field_label from modw_supremm.granted_pe  where id in (_filter_) order by name"
        );
    
    }

    public function getCategory()
    {
        return 'Usage';
    }
}
