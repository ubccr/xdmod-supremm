<?php
namespace DataWarehouse\Query\SUPREMM\Statistics;

/* 
* @author Amin Ghadersohi
* @date 2014-May-13
*
*/

class _STAT_CLASS_ extends \DataWarehouse\Query\SUPREMM\Statistic
{
	public function __construct($query_instance = NULL)
	{
		$timeseries = $query_instance->getQueryType() == 'timeseries';
		$formula = str_replace(':timeseries', $timeseries?1:0, _FORMULA_);
		parent::__construct($formula, _NAME_, _LABEL_, _UNIT_, _DECIMALS_);
	}

	public function getInfo()
	{
		return _INFO_;
	}

    public function getAdditionalWhereCondition()
    {
        return _WHERECLAUSE_;
    }
}
 
?>
