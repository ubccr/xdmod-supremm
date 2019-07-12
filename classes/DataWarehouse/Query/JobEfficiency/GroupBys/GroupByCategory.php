<?php

namespace DataWarehouse\Query\JobEfficiency\GroupBys;

/*
* @author Joe White
* @date 2014-06-16
*
*/
class GroupByCategory extends \DataWarehouse\Query\JobEfficiency\GroupBy
{
    public function __construct()
    {
        parent::__construct(
            'category',
            array(),
            "
			select
				gt.id,
				gt.description as short_name,
				gt.description as long_name
			from modw_jobefficiency.job_category gt
			where 1
			order by gt.id
		"
        );

        $this->_id_field_name = 'id';
        $this->_long_name_field_name = 'description';
        $this->_short_name_field_name = 'description';
        $this->_order_id_field_name = 'id';
        $this->setOrderByStat(null);

        $modw_schema = new \DataWarehouse\Query\Model\Schema('modw_jobefficiency');
        $this->buckets_table = new \DataWarehouse\Query\Model\Table($modw_schema, 'job_category', 'job_category');
    }

    public function getInfo()
    {
        return 'The software used to collect the performance data.';
    }

    public static function getLabel()
    {
        return 'Category';
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
                new \DataWarehouse\Query\Model\TableField($data_table, 'job_category_id'),
                '=',
                new \DataWarehouse\Query\Model\TableField($this->buckets_table, 'id')
            )
        );

        $this->addOrder($query, $multi_group, 'asc', true);
    }

    public function addWhereJoin(
        \DataWarehouse\Query\Query &$query,
        \DataWarehouse\Query\Model\Table $data_table,
        $multi_group,
        $operation,
        $whereConstraint
    ) {
        // construct the join between the main data_table and this group by table
        $query->addTable($this->buckets_table);

        $id_field = new \DataWarehouse\Query\Model\TableField($this->buckets_table, 'id');

        // construct the join between the main data_table and this group by table
        $query->addWhereCondition(
            new \DataWarehouse\Query\Model\WhereCondition(
                new \DataWarehouse\Query\Model\TableField($data_table, 'job_category_id'),
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
    }

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
        return parent::pullQueryParameters2($request, '_filter_', 'job_category_id');
    }

    public function pullQueryParameterDescriptions(&$request)
    {
        return parent::pullQueryParameterDescriptions2(
            $request,
            "SELECT description AS field_label FROM modw_jobefficiency.job_category WHERE id IN (_filter_) ORDER BY id"
        );
    }

    public function getCategory()
    {
        return 'Metrics';
    }
}
