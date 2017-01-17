<?php
namespace DataWarehouse\Query\SUPREMM\GroupBys;

/* 
* @author Amin Ghadersohi
* @date 2013-10-3
*
* class for adding group by application to a query
* 
*/

class GroupByApplication extends \DataWarehouse\Query\SUPREMM\GroupBy
{
    public static function getLabel()
    {
         return 'Application';
    }

    public function getInfo()
    {
        return  "The classication of the job as common scientific application.";
    }
    public function __construct()
    {
        parent::__construct(
            'application',
            array(),
            "SELECT distinct
								gt.id, 
								gt.name as short_name, 
								gt.name as long_name
								FROM 
								modw_supremm.application gt 
								WHERE license_type = 'permissive' 
								order by gt.name",
            array('application')
        );
        $this->_id_field_name = 'id';
        $this->_long_name_field_name = 'name';
        $this->_short_name_field_name = 'name';
        $this->_order_id_field_name = 'name';
        $this->modw_schema = new \DataWarehouse\Query\Model\Schema('modw');
        $this->taccstats_schema = new \DataWarehouse\Query\Model\Schema('modw_supremm');
        $this->application_table = new \DataWarehouse\Query\Model\Table($this->taccstats_schema, 'application', 'app');
    }
    
    public function applyTo(\DataWarehouse\Query\Query &$query, \DataWarehouse\Query\Model\Table $data_table, $multi_group = false)
    {
        $query->addTable($this->application_table);
        
        $id_field = new \DataWarehouse\Query\Model\TableField($this->application_table, $this->_id_field_name, $this->getIdColumnName($multi_group));
        $name_field = new \DataWarehouse\Query\Model\TableField($this->application_table, $this->_long_name_field_name, $this->getLongNameColumnName($multi_group));
        $shortname_field = new \DataWarehouse\Query\Model\TableField($this->application_table, $this->_short_name_field_name, $this->getShortNameColumnName($multi_group));
        $order_id_field = new \DataWarehouse\Query\Model\TableField($this->application_table, $this->_order_id_field_name, $this->getOrderIdColumnName($multi_group));
        
        $query->addField($order_id_field);
        $query->addField($id_field);
        $query->addField($name_field);
        $query->addField($shortname_field);
        
        $query->addGroup($id_field);
        
        
        $datatable_application_field = new \DataWarehouse\Query\Model\TableField($data_table, 'application_id');
        $query->addWhereCondition(new \DataWarehouse\Query\Model\WhereCondition(
            $id_field,
            '=',
            $datatable_application_field
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
        $query->addTable($this->application_table);

        $id_field = new \DataWarehouse\Query\Model\TableField($this->application_table, $this->_id_field_name);
        $datatable_application_id_field = new \DataWarehouse\Query\Model\TableField($data_table, 'application_id');

        // construct the join between the main data_table and this group by table
        $query->addWhereCondition(new \DataWarehouse\Query\Model\WhereCondition(
            $datatable_application_id_field,
            '=',
            $id_field
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
    } // addWhereJoin
    
    public function addOrder(\DataWarehouse\Query\Query &$query, $multi_group = false, $dir = 'asc', $prepend = false)
    {
        $orderField = new \DataWarehouse\Query\Model\OrderBy(new \DataWarehouse\Query\Model\TableField($this->application_table, $this->_order_id_field_name), $dir, $this->getName());
        if ($prepend === true) {
            $query->prependOrder($orderField);
        } else {
            $query->addOrder($orderField);
        }
    }
    
    public function pullQueryParameters(&$request)
    {
        return parent::pullQueryParameters2($request, '_filter_', 'application_id');
    }
    public function pullQueryParameterDescriptions(&$request)
    {
        return parent::pullQueryParameterDescriptions2(
            $request,
            "select name as field_label from modw_supremm.application  where id in (_filter_) order by name"
        );
    }

    public function getCategory()
    {
        return 'Executable';
    }
}
