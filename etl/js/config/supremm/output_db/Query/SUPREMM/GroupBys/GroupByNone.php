<?php

namespace DataWarehouse\Query\SUPREMM\GroupBys;

/* 
* @author Amin Ghadersohi
* @date 2011-Jan-07
*
* class for adding no group by to a query
* 
*/

class GroupByNone extends \DataWarehouse\Query\SUPREMM\GroupBy
{	public  function __construct()
	{
		parent::__construct('none',array());
	}
	public static function getLabel()
	{
	    return "SUPREMM";
	}

	public function getDefaultDatasetType()
	{
		return 'timeseries';
	}
	public function getInfo() 
	{
		return 	"Summarizes job performance data obtained via the SUPReMM project. These data are obtained from performance monitoring software running on each HPC resource. For most resources this data is generated for both XSEDE and non-XSEDE jobs. Non-XSEDE jobs can be filtered using a filter on the &quot;Grant Type&quot;.";
	}
	public function getDefaultDisplayType($dataset_type = NULL)
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

		$fieldLabel = "'SUPREMM'";

		$query->addField(new \DataWarehouse\Query\Model\FormulaField($fieldLabel, $this->getLongNameColumnName($multi_group)));
		$query->addField(new \DataWarehouse\Query\Model\FormulaField($fieldLabel, $this->getShortNameColumnName($multi_group)));
		$query->addField(new \DataWarehouse\Query\Model\FormulaField($fieldLabel, $this->getOrderIdColumnName($multi_group)));
	}

    public function addWhereJoin(\DataWarehouse\Query\Query &$query, \DataWarehouse\Query\Model\Table $data_table, $multi_group = false, $operation, $whereConstraint)
    {
       // no-op 
    } // addWhereJoin()

	
	public function pullQueryParameterDescriptions(&$request)
	{
		$parameters = array();


		return $parameters;
	}

}
?>
