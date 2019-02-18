<?php

namespace DataWarehouse\Query\UserReport\GroupBys;

class GroupByNone extends \DataWarehouse\Query\UserReport\GroupBy
{
    public function __construct()
    {
        parent::__construct('none', array());
    }

    public static function getLabel()
    {
        return 'UserReport';
    }

    public function getDefaultDatasetType()
    {
        return 'timeseries';
    }

    public function getInfo()
    {
        return  'Summarizes job performance data. These data are obtained from performance monitoring software running on each HPC resource.';
    }

    public function getDefaultDisplayType($dataset_type = null)
    {
        if($dataset_type == 'timeseries')
        {
            return 'line';
        }
        else
        {
            return 'h_bar';
        }
    }
    public function getDefaultCombineMethod()
    {
        return 'stack';
    }

    public function applyTo(\DataWarehouse\Query\Query &$query, \DataWarehouse\Query\Model\Table $data_table, $multi_group = false)
    {
        $query->addField(new \DataWarehouse\Query\Model\FormulaField('-9999', $this->getIdColumnName($multi_group)));

        $fieldLabel = "'UserReport'";

        $query->addField(new \DataWarehouse\Query\Model\FormulaField($fieldLabel, $this->getLongNameColumnName($multi_group)));
        $query->addField(new \DataWarehouse\Query\Model\FormulaField($fieldLabel, $this->getShortNameColumnName($multi_group)));
        $query->addField(new \DataWarehouse\Query\Model\FormulaField($fieldLabel, $this->getOrderIdColumnName($multi_group)));
    }

    public function addWhereJoin(\DataWarehouse\Query\Query &$query, \DataWarehouse\Query\Model\Table $data_table, $multi_group, $operation, $whereConstraint)
    {
       // no-op
    }

    public function pullQueryParameterDescriptions(&$request)
    {
        $parameters = array();
        return $parameters;
    }
}
